/**
 * Auth Service - Authentication Logic
 * @owner: Sujal
 * @purpose: Handle user registration and login
 */

import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import { getEnvConfig } from '../../config/env.js';
import { BadRequestError, UnauthorizedError } from '../../utils/errors.js';
import { normalizeReferralCode, generateReferralId } from '../../utils/referral.js';
import AppSettings from '../../models/AppSettings.js';
import Referral from '../../models/Referral.js';
import mongoose from 'mongoose';
import { CURRENT_PRIVACY_VERSION, CURRENT_TERMS_VERSION } from '../../config/legal.js';

const { jwtSecret, jwtExpiresIn } = getEnvConfig();

const signToken = (id, role) => {
    return jwt.sign({ id, role }, jwtSecret, {
        expiresIn: jwtExpiresIn,
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id, user.role);

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
    });
};

import Otp from '../../models/Otp.js';
import { normalizePhoneNumber } from '../../utils/phoneNumber.js';
import * as smsService from '../sms/smsHubService.js';

// Helper to generate numeric OTP
const generateNumericOtp = (length = 4) => {
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += Math.floor(Math.random() * 10).toString();
    }
    return otp;
};

export const requestLoginOtp = async (phoneNumber) => {
    try {
        // Normalize phone number (accepts 10 digits, 91+10 digits, or +91+10 digits)
        const normalizedPhone = normalizePhoneNumber(phoneNumber);

        const user = await User.findOne({ phoneNumber: normalizedPhone, isDeleted: false });
        if (!user || user.isAiCompanion) {
            throw new BadRequestError('User not found. Please sign up first.');
        }

        const otp = generateNumericOtp(6);

        // Save/Update OTP
        await Otp.findOneAndUpdate(
            { phoneNumber: normalizedPhone, type: 'login' },
            { otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
            { upsert: true, new: true }
        );

        // Send via SMS provider
        await smsService.sendOTP(normalizedPhone, otp);
        console.log(`[OTP-LOGIN] OTP sent for mobile ending in ${normalizedPhone.slice(-4)}`);

        return { message: 'OTP sent successfully' };
    } catch (error) {
        console.error('[AUTH] requestLoginOtp error:', error.message);
        throw error;
    }
};

export const verifyLoginOtp = async (phoneNumber, otpCode) => {
    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    const user = await User.findOne({ phoneNumber: normalizedPhone });
    if (!user || user.isAiCompanion) {
        throw new BadRequestError('User not found');
    }

    // Import AppSettings dynamically to get admin secret
    const AppSettings = (await import('../../models/AppSettings.js')).default;
    const settings = await AppSettings.getSettings();
    const adminSecret = settings.adminSecret || '123456';

    // MOCK OTP / BYPASS: Allow 123456 or adminSecret for development testing
    const isBypass = otpCode === '123456' || otpCode === adminSecret;

    if (!isBypass) {
        const otpRecord = await Otp.findOne({ phoneNumber: normalizedPhone, type: 'login', otp: String(otpCode) });
        if (!otpRecord) {
            throw new BadRequestError('Invalid or expired OTP');
        }
        // Clear OTP
        await Otp.deleteOne({ _id: otpRecord._id });
    }

    return user;
};

export const requestSignupOtp = async (userData, requestMetadata = {}) => {
    const { phoneNumber } = userData;

    if (userData.termsAccepted !== true || userData.privacyAccepted !== true) {
        throw new BadRequestError('You must accept the Terms of Service and Privacy Policy to create an account.');
    }
    if (
        userData.termsVersion !== CURRENT_TERMS_VERSION ||
        userData.privacyVersion !== CURRENT_PRIVACY_VERSION
    ) {
        throw new BadRequestError('Our legal terms have changed. Please review and accept the current versions.');
    }

    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    // Check if user already exists and is not deleted
    const existingUser = await User.findOne({ phoneNumber: normalizedPhone });
    if (existingUser && !existingUser.isDeleted) {
        throw new BadRequestError('Phone number already in use. Please login.');
    }

    // If user existed but was deleted, we can proceed (they will be "overwritten" or a new record created if we handle IDs correctly)
    // Actually, since phoneNumber is unique, we should probably delete the old record or update it.
    // Given the complexity of relationships, it might be safer to hard delete the old record if it was already soft-deleted.
    if (existingUser && existingUser.isDeleted) {
        await User.deleteOne({ _id: existingUser._id });
    }

    const otp = generateNumericOtp(6);

    // Update userData with normalized phone
    const normalizedUserData = {
        ...userData,
        phoneNumber: normalizedPhone,
        legalConsent: {
            termsAccepted: true,
            privacyAccepted: true,
            termsVersion: CURRENT_TERMS_VERSION,
            privacyVersion: CURRENT_PRIVACY_VERSION,
            acceptedAt: new Date(),
            method: 'signup_checkbox',
            ipAddress: requestMetadata.ipAddress || '',
            userAgent: String(requestMetadata.userAgent || '').slice(0, 500),
        },
    };

    delete normalizedUserData.termsAccepted;
    delete normalizedUserData.privacyAccepted;
    delete normalizedUserData.termsVersion;
    delete normalizedUserData.privacyVersion;

    // Save/Update OTP with pending data
    await Otp.findOneAndUpdate(
        { phoneNumber: normalizedPhone, type: 'signup' },
        {
            otp,
            signupData: normalizedUserData,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        },
        { upsert: true, new: true }
    );

    // Send via SMS provider
    await smsService.sendOTP(normalizedPhone, otp);
    console.log(`[OTP-SIGNUP] OTP sent for mobile ending in ${normalizedPhone.slice(-4)}`);

    return { message: 'OTP sent successfully' };
};

export const verifySignupOtp = async (phoneNumber, otpCode, io = null) => {
    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    // For signup, we check the otpRecord first
    const otpRecord = await Otp.findOne({ phoneNumber: normalizedPhone, type: 'signup' });

    if (!otpRecord) {
        throw new BadRequestError('OTP not requested or expired');
    }

    // MOCK OTP / BYPASS: Allow 123456 for development testing
    const isBypass = otpCode === '123456';

    if (!isBypass) {
        if (otpRecord.otp !== otpCode) {
            throw new BadRequestError('Invalid OTP');
        }
    }

    const userData = otpRecord.signupData;
    if (!userData) {
        throw new BadRequestError('Session expired. Please sign up again.');
    }

    const { role, name, age, aadhaarCardUrl, location, bio, interests, photos, referralCode, legalConsent } = userData;

    if (
        !legalConsent?.termsAccepted ||
        !legalConsent?.privacyAccepted ||
        legalConsent.termsVersion !== CURRENT_TERMS_VERSION ||
        legalConsent.privacyVersion !== CURRENT_PRIVACY_VERSION
    ) {
        throw new BadRequestError('Valid legal consent is required to complete signup.');
    }

    // Normalize referral code if provided
    const normalizedReferralCode = normalizeReferralCode(referralCode);
    let referrer = null;

    if (normalizedReferralCode) {
        const codeOwner = await User.findOne({ referralId: normalizedReferralCode, isDeleted: false });
        if (!codeOwner) {
            // User typed it wrong or it doesn't exist - but as per requirement, we should show error if wrong
            // Except for casing and spacing which are already handled by normalizeReferralCode
            throw new BadRequestError('Invalid referral ID. Please check and try again.');
        }
        // Referral program is male-only - a code belonging to a female user is a valid
        // code that simply isn't eligible for a reward, so signup proceeds without a referrer
        // rather than hard-blocking someone who already has a female friend's code.
        if (codeOwner.role === 'male') {
            referrer = codeOwner;
        }
    }

    // Remove from DeletedAccount collection if re-registering with same phone number
    const DeletedAccount = (await import('../../models/DeletedAccount.js')).default;
    await DeletedAccount.deleteOne({ phoneNumber: normalizedPhone });

    // CRITICAL: Auto-translate name and bio for caching (cost optimization)
    // This translates once on signup and caches both languages in DB
    const { translateProfileData } = await import('../translate/translateService.js');
    const translatedProfile = await translateProfileData({ name, bio });

    // Build user object with cached translations
    const userPayload = {
        phoneNumber,
        role,
        genderPreference: role === 'male' ? 'female' : 'male', // Logic: Male -> Female, Female -> Male
        profile: {
            name: translatedProfile.name,
            name_en: translatedProfile.name_en,
            name_hi: translatedProfile.name_hi,
            age,
            location: {
                city: location || '', // Basic string for now until full geo implementation
                // Default coordinates will be [0,0] from schema
            },
            bio: translatedProfile.bio,
            bio_en: translatedProfile.bio_en,
            bio_hi: translatedProfile.bio_hi,
            interests,
            photos: photos?.map((p, i) => ({
                url: p.url || p, // Handle both object and string formats
                isPrimary: i === 0,
                uploadedAt: new Date()
            }))
        },
        referredBy: referrer ? referrer._id : null,
        referralId: generateReferralId(),
        legalConsent,
    };

    // Female-specific setup
    if (role === 'female') {
        userPayload.verificationDocuments = {
            aadhaarCard: {
                url: aadhaarCardUrl || '',
                uploadedAt: new Date(),
                verified: true // Auto-verified since auto-approved
            }
        };
        // Auto-approve female users on signup
        userPayload.approvalStatus = 'approved';
        userPayload.isVerified = true;
    }

    // Create user with session for transaction atomicity
    const session = await mongoose.startSession();
    session.startTransaction();

    let newUser;
    try {
        newUser = await User.create([userPayload], { session });
        newUser = newUser[0];

        // Track the referral relationship. The coin reward is paid out later,
        // once this new user completes their first coin recharge (see
        // paymentController.js) - not immediately on signup.
        if (referrer) {
            const settings = await AppSettings.getSettings();
            if (settings.referral?.isEnabled) {
                await Referral.create([{
                    referrerId: referrer._id,
                    refereeId: newUser._id,
                    referralCode: normalizedReferralCode,
                    status: 'pending',
                }], { session });

                // Increment referral count (total people referred, regardless of reward status)
                await User.findByIdAndUpdate(referrer._id, { $inc: { referralCount: 1 } }, { session });

                // Send non-disturbing notification (handled after transaction commit)
                // Use setImmediate to avoid blocking the auth flow
                setImmediate(async () => {
                    try {
                        const Notification = (await import('../../models/Notification.js')).default;
                        const referralPath = '/male/referral';
                        const notification = await Notification.create({
                            userId: referrer._id,
                            type: 'system',
                            title: 'New Referral! 🎉',
                            message: `${newUser.profile.name} joined using your referral code. You'll earn coins once they make their first recharge.`,
                            actionUrl: referralPath
                        });

                        // Emit real-time notification if io is available
                        if (io) {
                            const { emitNotification } = await import('../../socket/index.js');
                            emitNotification(io, referrer._id, notification);
                        }
                    } catch (err) {
                        console.error('Failed to send referral notification:', err);
                    }
                });
            }
        }

        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }

    // Clear OTP
    await Otp.deleteOne({ _id: otpRecord._id });

    return newUser;
};

export const generateToken = (userId, role) => {
    return signToken(userId, role);
};
