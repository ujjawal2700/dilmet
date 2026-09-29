/**
 * Upload Controller
 * @purpose: Handle file upload requests
 */

import * as imageUploadService from '../../services/upload/imageUploadService.js';

/**
 * Upload chat image
 * @route POST /api/upload/chat-image
 */
export const uploadChatImage = async (req, res, next) => {
    try {
        const { image } = req.body;

        // Validate image
        imageUploadService.validateImage(image);

        // Upload to Cloudinary
        const result = await imageUploadService.uploadImageToCloudinary(image, 'chat-images');

        res.status(200).json({
            status: 'success',
            data: {
                url: result.url,
                width: result.width,
                height: result.height
            }
        });
    } catch (error) {
        next(error);
    }
};

/** Upload profile, verification or chat media through a server-signed Cloudinary request. */
export const uploadUserAsset = async (req, res, next) => {
    try {
        const { image, category } = req.body;
        const folders = {
            profile: 'profiles',
            verification: 'verification',
            chat: 'chat',
        };
        const folder = folders[category];
        if (!folder) {
            return res.status(400).json({ status: 'fail', message: 'Unsupported upload category.' });
        }
        if (category === 'verification' && req.user.role !== 'female') {
            return res.status(403).json({ status: 'fail', message: 'Verification documents are only accepted for female accounts.' });
        }
        imageUploadService.validateImage(image, category === 'verification' ? 10 : 5);
        const result = await imageUploadService.uploadImageToCloudinary(image, folder);
        res.status(200).json({
            status: 'success',
            data: {
                url: result.url,
                secureUrl: result.url,
                publicId: result.publicId,
                format: result.format,
                width: result.width,
                height: result.height,
                bytes: result.bytes,
                createdAt: new Date().toISOString(),
            },
        });
    } catch (error) {
        next(error);
    }
};
