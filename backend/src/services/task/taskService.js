/**
 * Task Service - Daily Tasks progress tracking and reward payout
 * @purpose: Passively tracks progress toward admin-configured daily tasks as
 *           the underlying actions happen anywhere in the app (sending a
 *           message, sending a gift, checking in), and pays out the reward
 *           coins automatically the moment a task's target is reached.
 *
 * Daily reset: progress is keyed by IST calendar day (see utils/dayBoundary.js).
 * There is no cron job - a new day simply has no progress row yet, so every
 * task starts back at 0/target without any scheduled maintenance.
 */

import Task from '../../models/Task.js';
import UserTaskProgress from '../../models/UserTaskProgress.js';
import logger from '../../utils/logger.js';
import { getISTDayStart } from '../../utils/dayBoundary.js';
import relationshipManager from '../../core/relationships/relationshipManager.js';
import { emitBalanceUpdate, emitTaskCompleted } from '../../socket/chatHandlers.js';

const DEFAULT_TASKS = [
    {
        taskKey: 'daily_checkin',
        title: 'Daily Check-In',
        description: 'Open the app today',
        type: 'checkin',
        targetCount: 1,
        rewardCoins: 10,
        icon: 'event_available',
        deepLink: '/male/dashboard',
        displayOrder: 1,
    },
    {
        taskKey: 'say_hi_1',
        title: 'Say Hi to 1 Girl',
        description: 'Send a message to 1 new woman today',
        type: 'message_distinct_users',
        targetCount: 1,
        rewardCoins: 15,
        icon: 'waving_hand',
        deepLink: '/male/discover',
        displayOrder: 2,
    },
    {
        taskKey: 'say_hi_5',
        title: 'Say Hi to 5 Girls',
        description: 'Send a message to 5 different women today',
        type: 'message_distinct_users',
        targetCount: 5,
        rewardCoins: 50,
        icon: 'diversity_3',
        deepLink: '/male/discover',
        displayOrder: 3,
    },
    {
        taskKey: 'send_gift_1',
        title: 'Send a Gift',
        description: 'Send a gift to someone in chat',
        type: 'send_gift',
        targetCount: 1,
        rewardCoins: 20,
        icon: 'card_giftcard',
        deepLink: '/male/chats',
        displayOrder: 4,
    },
];

/**
 * Ensure at least the default task catalog exists. Runs once, lazily - safe
 * to call on every request (no-ops after the first time tasks exist).
 */
const ensureTasksSeeded = async () => {
    const count = await Task.countDocuments();
    if (count > 0) return;
    try {
        await Task.insertMany(DEFAULT_TASKS, { ordered: false });
        logger.info('✅ Seeded default daily tasks');
    } catch (err) {
        // Ignore duplicate-key races from concurrent seed attempts
        if (err.code !== 11000) {
            logger.error(`Failed to seed default tasks: ${err.message}`);
        }
    }
};

/**
 * Get all active tasks with the given user's progress for the current IST day.
 */
export const getTasksForUser = async (userId) => {
    await ensureTasksSeeded();

    const taskDate = getISTDayStart();
    const tasks = await Task.find({ isActive: true }).sort({ displayOrder: 1, createdAt: 1 }).lean();
    const taskIds = tasks.map(t => t._id);

    const progressRows = await UserTaskProgress.find({
        userId,
        taskId: { $in: taskIds },
        taskDate,
    }).lean();

    const progressByTaskId = new Map(progressRows.map(p => [p.taskId.toString(), p]));

    return tasks.map(task => {
        const progress = progressByTaskId.get(task._id.toString());
        return {
            id: task._id,
            taskKey: task.taskKey,
            title: task.title,
            description: task.description,
            type: task.type,
            targetCount: task.targetCount,
            rewardCoins: task.rewardCoins,
            icon: task.icon,
            deepLink: task.deepLink,
            progressCount: Math.min(progress?.progressCount || 0, task.targetCount),
            isCompleted: progress?.isCompleted || false,
            completedAt: progress?.completedAt || null,
        };
    });
};

/**
 * Record one occurrence of `taskType` for `userId` (e.g. a message was sent,
 * a gift was sent). Fire-and-forget from the caller's perspective - never
 * throws, only logs. Atomically guards against double-counting and
 * double-payout even under concurrent calls.
 *
 * @param {string} userId
 * @param {'checkin'|'message_distinct_users'|'send_gift'} taskType
 * @param {object} [opts]
 * @param {string} [opts.targetUserId] - required for 'message_distinct_users' (the distinct recipient)
 * @param {import('socket.io').Server} [opts.io] - if provided, emits balance/task-completed events
 */
export const recordProgress = async (userId, taskType, opts = {}) => {
    try {
        await ensureTasksSeeded();

        const { targetUserId, io } = opts;
        const tasks = await Task.find({ type: taskType, isActive: true });
        if (tasks.length === 0) return;

        const taskDate = getISTDayStart();

        for (const task of tasks) {
            await processOneTask(userId, task, taskDate, targetUserId, io);
        }
    } catch (err) {
        logger.error(`[TASKS] recordProgress failed (userId=${userId}, type=${taskType}): ${err.message}`);
    }
};

const processOneTask = async (userId, task, taskDate, targetUserId, io) => {
    // Distinct-recipient tasks require a target
    if (task.type === 'message_distinct_users' && !targetUserId) return;

    // Find-or-create today's progress row for this task
    const progress = await UserTaskProgress.findOneAndUpdate(
        { userId, taskId: task._id, taskDate },
        {
            $setOnInsert: {
                userId,
                taskId: task._id,
                taskDate,
                progressCount: 0,
                countedTargetIds: [],
                isCompleted: false,
            },
        },
        { upsert: true, new: true }
    );

    if (progress.isCompleted) return; // already earned today

    // Build the atomic increment, re-verifying eligibility inside the filter
    // so concurrent calls can never double-count the same event.
    const filter = { _id: progress._id, isCompleted: false };
    const update = { $inc: { progressCount: 1 } };

    if (task.type === 'message_distinct_users') {
        filter.countedTargetIds = { $ne: targetUserId };
        update.$addToSet = { countedTargetIds: targetUserId };
    }

    const updated = await UserTaskProgress.findOneAndUpdate(filter, update, { new: true });
    if (!updated) return; // lost the race, already completed, or target already counted today

    if (updated.progressCount < task.targetCount) return; // not there yet

    // Atomically claim completion - only one concurrent caller can win this
    const claimed = await UserTaskProgress.findOneAndUpdate(
        { _id: updated._id, isCompleted: false },
        { $set: { isCompleted: true, completedAt: new Date(), rewardCoinsPaid: task.rewardCoins } },
        { new: true }
    );
    if (!claimed) return; // someone else already claimed it

    if (task.rewardCoins > 0) {
        const { user: updatedUser } = await relationshipManager.updateUserBalanceWithTransaction(userId, {
            userId,
            type: 'task_reward',
            direction: 'credit',
            amountCoins: task.rewardCoins,
            description: `Task completed: ${task.title}`,
            status: 'completed',
        });

        logger.info(`🎯 Task completed: user=${userId} task=${task.taskKey} reward=${task.rewardCoins}`);

        if (io) {
            emitBalanceUpdate(io, userId.toString(), updatedUser.coinBalance);
            emitTaskCompleted(io, userId.toString(), {
                taskKey: task.taskKey,
                title: task.title,
                icon: task.icon,
                rewardCoins: task.rewardCoins,
                newBalance: updatedUser.coinBalance,
            });
        }
    }
};

/**
 * Daily check-in - called once per app-load from the frontend. Idempotent:
 * only pays out the first time each IST day.
 */
export const checkin = async (userId, io) => {
    await recordProgress(userId, 'checkin', { io });
    return getTasksForUser(userId);
};

export default {
    getTasksForUser,
    recordProgress,
    checkin,
};
