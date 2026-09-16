/**
 * SupportTicket Model - User Support Conversations
 * @purpose: Track a support conversation between a male/female user and the admin team
 */

import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userRole: {
      type: String,
      enum: ['male', 'female'],
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: 150,
    },
    category: {
      type: String,
      enum: ['account', 'payment', 'technical', 'report_user', 'other'],
      default: 'other',
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
      index: true,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    lastMessagePreview: {
      type: String,
      default: '',
    },
    lastMessageBySenderRole: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    unreadCountForUser: {
      type: Number,
      default: 0,
    },
    unreadCountForAdmin: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true },
);

supportTicketSchema.index({ status: 1, lastMessageAt: -1 });
supportTicketSchema.index({ userId: 1, lastMessageAt: -1 });

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);

export default SupportTicket;
