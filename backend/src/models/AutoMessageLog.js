/**
 * AutoMessageLog Model - Auto Message Tracking
 * @owner: Sujal (User Domain)
 * @purpose: Track auto-messages sent to enforce limits and prevent duplicates
 */

import mongoose from 'mongoose';

const autoMessageLogSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        templateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AutoMessageTemplate',
            required: true,
        },
        chatId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Chat',
            required: true,
        },
        messageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
            required: true,
        },
        sentAt: {
            type: Date,
            default: Date.now,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound indexes for enforcing constraints
// Unique index: Ensures a female never auto-messages the same male twice
autoMessageLogSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });

// Index for daily quota check
autoMessageLogSchema.index({ senderId: 1, sentAt: 1 });

// Index for analytics
autoMessageLogSchema.index({ templateId: 1, sentAt: -1 });

const AutoMessageLog = mongoose.model('AutoMessageLog', autoMessageLogSchema);

export default AutoMessageLog;
