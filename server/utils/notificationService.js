import Notification from '../models/Notification.js';
import User from '../models/User.js';

/**
 * Non-blocking helper to create a persistent database notification.
 * Never throws — failures are logged so calling operations continue uninterrupted.
 */
export const createNotification = async ({
  recipient = null,
  recipientEmail = '',
  title,
  message,
  type = 'info',
  link = '/dashboard',
  metadata = {},
}) => {
  try {
    const cleanEmail = (recipientEmail || '').trim().toLowerCase();

    let resolvedRecipient = recipient;
    let resolvedEmail = cleanEmail;

    // If recipient ObjectId was passed but no email, look up user's email
    if (resolvedRecipient && !resolvedEmail) {
      const u = await User.findById(resolvedRecipient).select('email');
      if (u) resolvedEmail = u.email;
    }

    // If recipient email was passed but no ObjectId, look up user ID if account exists
    if (!resolvedRecipient && resolvedEmail) {
      const u = await User.findOne({ email: resolvedEmail }).select('_id');
      if (u) resolvedRecipient = u._id;
    }

    if (!resolvedEmail) {
      console.warn('[Notification] Skipping notification: No recipient email provided.');
      return null;
    }

    const doc = await Notification.create({
      recipient: resolvedRecipient || null,
      recipientEmail: resolvedEmail,
      title,
      message,
      type,
      link,
      metadata,
    });

    return doc;
  } catch (err) {
    console.error('[Notification Creation Error]:', err.message);
    return null;
  }
};

/**
 * Seed a personalized welcome notification for a newly verified or empty user
 * so their notification window has genuine platform context.
 */
export const seedWelcomeNotificationIfEmpty = async (user) => {
  try {
    if (!user || !user.email) return;

    const email = user.email.trim().toLowerCase();
    const count = await Notification.countDocuments({
      $or: [{ recipient: user._id }, { recipientEmail: email }],
    });

    if (count === 0) {
      await createNotification({
        recipient: user._id,
        recipientEmail: email,
        title: `👋 Welcome to HackSphere 2026, ${user.fullName || 'Innovator'}!`,
        message:
          'Your account is active. Browse official problem statements, form or join a team, and prepare your project submission.',
        type: 'info',
        link: '/problems',
        metadata: { isWelcome: true },
      });
    }
  } catch (err) {
    console.error('[Seed Welcome Notification Error]:', err.message);
  }
};
