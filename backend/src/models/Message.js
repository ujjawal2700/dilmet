/**
 * Message Model - Individual Messages in Chats
 * @owner: Harsh (Chat Domain)
 * @purpose: Store individual messages sent in chat conversations
 */

import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
      index: true,
    },
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
    content: {
      type: String,
      required: function () {
        return !this.attachments || this.attachments.length === 0;
      },
      maxlength: [5000, 'Message content cannot exceed 5000 characters'],
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'gift', 'video_call'],
      default: 'text',
    },
    attachments: [
      {
        type: {
          type: String,
          enum: ['image', 'video', 'audio'],
        },
        url: String,
        thumbnail: String,
        size: Number,
        mimeType: String,
      },
    ],
    // Gift-specific fields
    gifts: [
      {
        giftId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Gift',
        },
        giftName: String,
        giftCost: Number,
        giftImage: String,
      },
    ],
    // Video call fields
    videoCall: {
      callId: String,
      duration: Number, // in seconds
      status: {
        type: String,
        enum: ['initiated', 'answered', 'rejected', 'ended', 'missed'],
      },
      cost: Number, // coins deducted
    },
    // Coin transaction reference (linked to Transaction model)
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
    },
    // Message status
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read', 'failed'],
      default: 'sent',
    },
    deliveredAt: Date,
    readAt: Date,
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, createdAt: -1 });
messageSchema.index({ status: 1 });
messageSchema.index({ messageType: 1 });

// Instance method: Mark as delivered
messageSchema.methods.markAsDelivered = function () {
  this.status = 'delivered';
  this.deliveredAt = Date.now();
};

// Instance method: Mark as read
messageSchema.methods.markAsRead = function () {
  this.status = 'read';
  this.readAt = Date.now();
};

const Message = mongoose.model('Message', messageSchema);

export default Message;

