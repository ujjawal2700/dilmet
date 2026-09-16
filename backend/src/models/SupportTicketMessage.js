/**
 * SupportTicketMessage Model - Individual messages within a support ticket
 */

import mongoose from 'mongoose';

const supportTicketMessageSchema = new mongoose.Schema(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SupportTicket',
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderRole: {
      type: String,
      enum: ['user', 'admin'],
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      maxlength: 2000,
    },
  },
  { timestamps: true },
);

supportTicketMessageSchema.index({ ticketId: 1, createdAt: 1 });

const SupportTicketMessage = mongoose.model('SupportTicketMessage', supportTicketMessageSchema);

export default SupportTicketMessage;
