import AuditLog from '../models/AuditLog.js';

const SUPER_ADMIN_EMAIL = 'matrucareai@gmail.com';

const resolveActor = (req, actorOverride) => {
  if (actorOverride) {
    const email = (actorOverride.email || 'system').trim().toLowerCase();
    const rawRole = actorOverride.role || 'system';
    return {
      userId: actorOverride.userId || actorOverride._id || null,
      name: (actorOverride.name || actorOverride.fullName || email).trim(),
      email,
      role: rawRole === 'admin' && email === SUPER_ADMIN_EMAIL ? 'super_admin' : rawRole,
    };
  }

  const user = req?.user;
  if (!user) {
    return {
      userId: null,
      name: 'System',
      email: 'system',
      role: 'system',
    };
  }

  const email = (user.email || '').trim().toLowerCase();
  const role = user.role === 'admin' && email === SUPER_ADMIN_EMAIL ? 'super_admin' : user.role || 'user';

  return {
    userId: user._id || user.id || null,
    name: (user.fullName || email || 'User').trim(),
    email,
    role,
  };
};

const extractClientIp = (req) => {
  if (!req) return '';
  const forwarded = req.headers?.['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return (req.ip || req.socket?.remoteAddress || '').toString().trim();
};

/**
 * Safely persist an immutable audit log entry without interrupting the caller's request.
 */
export const recordAuditLog = async ({
  req,
  actor,
  category,
  action,
  severity = 'info',
  target = {},
  summary,
  reason = '',
  changes = null,
}) => {
  try {
    if (!category || !action || !summary) return null;

    const resolvedActor = resolveActor(req, actor);
    const entry = await AuditLog.create({
      category,
      action,
      severity,
      actor: resolvedActor,
      target: {
        type: target.type || '',
        id: target.id ? target.id.toString() : '',
        label: target.label || '',
      },
      summary,
      reason: (reason || '').trim(),
      changes,
      ipAddress: extractClientIp(req),
    });

    return entry;
  } catch (err) {
    console.error(`[AuditLog Error] Failed to record ${action}:`, err.message);
    return null;
  }
};

