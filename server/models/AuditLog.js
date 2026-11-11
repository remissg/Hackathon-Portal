import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ['rbac', 'submissions', 'evaluation', 'gate', 'problems', 'auth'],
      index: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      default: 'info',
      index: true,
    },
    actor: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
      name: {
        type: String,
        trim: true,
        default: 'System',
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
        default: 'system',
        index: true,
      },
      role: {
        type: String,
        trim: true,
        default: 'system',
      },
    },
    target: {
      type: {
        type: String,
        trim: true,
        default: '',
      },
      id: {
        type: String,
        trim: true,
        default: '',
      },
      label: {
        type: String,
        trim: true,
        default: '',
      },
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    reason: {
      type: String,
      trim: true,
      default: '',
    },
    changes: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    ipAddress: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ category: 1, createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;

