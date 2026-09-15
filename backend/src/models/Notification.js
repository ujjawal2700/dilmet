/**
 * Notification Model - User Notifications
 * @owner: Sujal (Shared - Both create notifications)
 * @purpose: Store notifications for users (earnings, messages, withdrawals, etc.)
 */

import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'message', // New message received
        'video_call', // Video call request
        'gift', // Gift received
        'earnings', // Earnings update
        'withdrawal', // Withdrawal status update
        'payment', // Payment success/failure
        'match', // New match
        'profile_view', // Profile viewed
        'system', // System notification
        'admin', // Admin notification
      ],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: Date,
    // Action URL (for navigation)
    actionUrl: String,
    // Related entities
    relatedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    relatedChatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
    },
    relatedTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
    },
    // Metadata
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1, createdAt: -1 });

// Instance method: Mark as read
notificationSchema.methods.markAsRead = function () {
  this.isRead = true;
  this.readAt = Date.now();
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;

