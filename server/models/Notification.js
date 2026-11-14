import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    recipientEmail: {
      type: String,
      required: [true, 'Recipient email is required'],
      lowercase: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: [
        'info',
        'success',
        'warning',
        'invite',
        'status',
        'pass',
        'evaluation',
        'role',
        'system',
      ],
      default: 'info',
    },
    link: {
      type: String,
      default: '/dashboard',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for rapid lookups and sorting
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipientEmail: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipientEmail: 1, isRead: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;

