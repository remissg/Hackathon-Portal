import Notification from '../models/Notification.js';
import { seedWelcomeNotificationIfEmpty } from '../utils/notificationService.js';

/**
 * @desc    Get current user's database notifications with unread count
 * @route   GET /api/notifications
 * @access  Private (JWT Protected)
 */
export const getMyNotifications = async (req, res) => {
  try {
    const userEmail = (req.user.email || '').trim().toLowerCase();
    const userId = req.user._id;

    // Seed welcome alert if user has zero notifications in DB
    await seedWelcomeNotificationIfEmpty(req.user);

    const filter = {
      $or: [{ recipient: userId }, { recipientEmail: userEmail }],
    };

    const limit = Math.min(parseInt(req.query.limit, 10) || 30, 100);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ ...filter, isRead: false }),
    ]);

    return res.status(200).json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    console.error('[Get Notifications Error]:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to retrieve notifications',
    });
  }
};

/**
 * @desc    Mark a single notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private (JWT Protected)
 */
export const markAsRead = async (req, res) => {
  try {
    const userEmail = (req.user.email || '').trim().toLowerCase();
    const userId = req.user._id;
    const { id } = req.params;

    const notif = await Notification.findOne({
      _id: id,
      $or: [{ recipient: userId }, { recipientEmail: userEmail }],
    });

    if (!notif) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found or access denied',
      });
    }

    if (!notif.isRead) {
      notif.isRead = true;
      notif.readAt = new Date();
      await notif.save();
    }

    return res.status(200).json({
      success: true,
      notification: notif,
    });
  } catch (err) {
    console.error('[Mark Read Error]:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to mark notification as read',
    });
  }
};

/**
 * @desc    Mark all unread notifications as read for current user
 * @route   PATCH /api/notifications/mark-all-read
 * @access  Private (JWT Protected)
 */
export const markAllAsRead = async (req, res) => {
  try {
    const userEmail = (req.user.email || '').trim().toLowerCase();
    const userId = req.user._id;

    const filter = {
      $or: [{ recipient: userId }, { recipientEmail: userEmail }],
      isRead: false,
    };

    const result = await Notification.updateMany(filter, {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      updatedCount: result.modifiedCount || 0,
    });
  } catch (err) {
    console.error('[Mark All Read Error]:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to mark all notifications as read',
    });
  }
};

/**
 * @desc    Delete a single notification
 * @route   DELETE /api/notifications/:id
 * @access  Private (JWT Protected)
 */
export const deleteNotification = async (req, res) => {
  try {
    const userEmail = (req.user.email || '').trim().toLowerCase();
    const userId = req.user._id;
    const { id } = req.params;

    const notif = await Notification.findOneAndDelete({
      _id: id,
      $or: [{ recipient: userId }, { recipientEmail: userEmail }],
    });

    if (!notif) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found or access denied',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (err) {
    console.error('[Delete Notification Error]:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to delete notification',
    });
  }
};

/**
 * @desc    Clear all notifications for the current user
 * @route   DELETE /api/notifications/clear-all
 * @access  Private (JWT Protected)
 */
export const clearAllNotifications = async (req, res) => {
  try {
    const userEmail = (req.user.email || '').trim().toLowerCase();
    const userId = req.user._id;

    const result = await Notification.deleteMany({
      $or: [{ recipient: userId }, { recipientEmail: userEmail }],
    });

    return res.status(200).json({
      success: true,
      message: 'All notifications cleared',
      deletedCount: result.deletedCount || 0,
    });
  } catch (err) {
    console.error('[Clear All Notifications Error]:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to clear notifications',
    });
  }
};
