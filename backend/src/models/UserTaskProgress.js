/**
 * UserTaskProgress Model - Per-user, per-day progress against a Task
 * @purpose: Tracks how far a user has progressed on a given Task for a given
 *           IST calendar day. A new `taskDate` naturally starts fresh
 *           progress - the daily reset is a read-time consequence of the
 *           date key, not a scheduled job.
 */

import mongoose from 'mongoose';

const userTaskProgressSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        taskId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task',
            required: true,
        },
        // Start-of-IST-day instant this progress row belongs to (see
        // utils/dayBoundary.js#getISTDayStart) - effectively "which day".
        taskDate: {
            type: Date,
            required: true,
        },
        progressCount: {
            type: Number,
            default: 0,
        },
        // For distinct-recipient tasks (e.g. "message 5 different women"):
        // the set of target user IDs already counted today, so re-messaging
        // the same person never inflates progress.
        countedTargetIds: {
            type: [mongoose.Schema.Types.ObjectId],
            default: [],
        },
        isCompleted: {
            type: Boolean,
            default: false,
        },
        completedAt: {
            type: Date,
            default: null,
        },
        // Coin amount actually paid out on completion (snapshot, in case the
        // admin changes the task's reward later - history stays accurate).
        rewardCoinsPaid: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// One progress row per user, per task, per day
userTaskProgressSchema.index({ userId: 1, taskId: 1, taskDate: 1 }, { unique: true });

const UserTaskProgress = mongoose.model('UserTaskProgress', userTaskProgressSchema);

export default UserTaskProgress;
