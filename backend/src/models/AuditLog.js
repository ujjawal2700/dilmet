/**
 * Audit Log Model - Admin Action Tracking
 * @owner: Sujal (Admin Domain)
 * @purpose: Track all admin actions for security and compliance
 */

import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    adminName: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    actionType: {
      type: String,
      enum: [
        'create',
        'update',
        'delete',
        'approve',
        'reject',
        'block',
        'unblock',
        'verify',
        'settings_update',
      ],
      required: true,
    },
    targetUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    targetUserName: String,
    // Details of the action
    details: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
    // Before and after state (for updates)
    beforeState: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
    afterState: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
    // IP address
    ipAddress: String,
    // User agent
    userAgent: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
auditLogSchema.index({ adminId: 1, createdAt: -1 });
auditLogSchema.index({ actionType: 1, createdAt: -1 });
auditLogSchema.index({ targetUserId: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;

