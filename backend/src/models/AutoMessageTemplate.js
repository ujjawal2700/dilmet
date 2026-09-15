/**
 * AutoMessageTemplate Model - Female Auto Message Templates
 * @owner: Sujal (User Domain)
 * @purpose: Store auto-message templates created by female users
 */

import mongoose from 'mongoose';

const autoMessageTemplateSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: [true, 'Template name is required'],
            trim: true,
            maxlength: [100, 'Template name cannot exceed 100 characters'],
        },
        content: {
            type: String,
            required: [true, 'Template content is required'],
            trim: true,
            maxlength: [500, 'Template content cannot exceed 500 characters'],
        },
        isEnabled: {
            type: Boolean,
            default: false, // Only one can be active at a time
            index: true,
        },
        isDefault: {
            type: Boolean,
            default: false, // Marks system-created default templates
        },
        // Statistics
        stats: {
            sentCount: {
                type: Number,
                default: 0,
                min: 0,
            },
            lastSentAt: Date,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes for performance
autoMessageTemplateSchema.index({ userId: 1, isEnabled: 1 });
autoMessageTemplateSchema.index({ userId: 1, createdAt: -1 });

// Ensure only one template is enabled per user
autoMessageTemplateSchema.pre('save', async function (next) {
    if (this.isEnabled && this.isModified('isEnabled')) {
        // Disable all other templates for this user
        await mongoose.model('AutoMessageTemplate').updateMany(
            {
                userId: this.userId,
                _id: { $ne: this._id },
                isEnabled: true
            },
            { isEnabled: false }
        );
    }
    next();
});

// Instance method: Increment sent count
autoMessageTemplateSchema.methods.incrementSentCount = function () {
    this.stats.sentCount += 1;
    this.stats.lastSentAt = new Date();
};

const AutoMessageTemplate = mongoose.model('AutoMessageTemplate', autoMessageTemplateSchema);

export default AutoMessageTemplate;
