/**
 * OTP Model
 * @owner: Sujal
 * @purpose: Store temporary OTPs and signup data
 */

import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
    {
        phoneNumber: {
            type: String,
            required: true,
            index: true,
        },
        otp: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['login', 'signup'],
            required: true,
        },
        // For signup, we store the pending user data here
        signupData: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
            index: { expires: 0 }, // Auto-delete after expiry
        },
    },
    {
        timestamps: true,
    }
);

// Ensure one active OTP per phone/type combo
otpSchema.index({ phoneNumber: 1, type: 1 });

const Otp = mongoose.model('Otp', otpSchema);

export default Otp;
