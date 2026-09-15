/**
 * Task Model - Admin-configurable Daily Tasks catalog
 * @purpose: Defines the tasks male users can complete each day to earn coins.
 *           Per-user daily progress against these is tracked separately in
 *           UserTaskProgress.
 */

import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
    {
        // Stable machine key, e.g. 'daily_checkin', 'say_hi_1'. Not shown to users.
        taskKey: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: '',
            trim: true,
        },
        // What kind of user action this task tracks. Determines which
        // backend hook increments its progress.
        type: {
            type: String,
            enum: ['checkin', 'message_distinct_users', 'send_gift'],
            required: true,
        },
        // How many times the action must occur before the task completes.
        // For 'message_distinct_users', this counts distinct recipients.
        targetCount: {
            type: Number,
            required: true,
            min: 1,
            default: 1,
        },
        rewardCoins: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
        // Material Symbol icon name shown on the task card
        icon: {
            type: String,
            default: 'task_alt',
        },
        // Frontend route the task card deep-links to
        deepLink: {
            type: String,
            default: '/male/dashboard',
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
        displayOrder: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

taskSchema.index({ isActive: 1, displayOrder: 1 });

const Task = mongoose.model('Task', taskSchema);

export default Task;
