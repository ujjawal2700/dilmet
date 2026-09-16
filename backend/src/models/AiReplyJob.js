/**
 * AI Reply Job Model - Delayed reply queue for AI companions
 * @purpose: Persist pending AI replies so they survive server restarts.
 * One pending job per chat; new user messages before runAt are answered together.
 */

import mongoose from 'mongoose';

const aiReplyJobSchema = new mongoose.Schema(
    {
        chatId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Chat',
            required: true,
        },
        companionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        runAt: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'processing', 'done', 'failed', 'skipped'],
            default: 'pending',
        },
        attempts: { type: Number, default: 0 },
        lockedAt: Date,
        lastError: String,
    },
    { timestamps: true }
);

aiReplyJobSchema.index({ status: 1, runAt: 1 });
// At most one pending job per chat
aiReplyJobSchema.index(
    { chatId: 1 },
    { unique: true, partialFilterExpression: { status: 'pending' } }
);
// Clean up finished jobs after 7 days
aiReplyJobSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60, partialFilterExpression: { status: { $in: ['done', 'failed', 'skipped'] } } });

const AiReplyJob = mongoose.model('AiReplyJob', aiReplyJobSchema);

export default AiReplyJob;
