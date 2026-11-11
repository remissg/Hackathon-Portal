import AuditLog from '../models/AuditLog.js';

const ALLOWED_CATEGORIES = ['rbac', 'submissions', 'evaluation', 'gate', 'problems', 'auth'];
const ALLOWED_SEVERITIES = ['info', 'warning', 'critical'];

const escapeRegex = (val) => val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * @desc    Retrieve immutable audit logs with filtering and pagination (Admin Only)
 * @route   GET /api/audit-logs
 * @access  Private / Admin
 */
export const getAuditLogs = async (req, res) => {
  try {
    const { category = 'all', severity = 'all', search = '', page = '1', limit = '40' } = req.query;

    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 40, 1), 100);
    const skip = (parsedPage - 1) * parsedLimit;

    const filter = {};
    if (category !== 'all' && ALLOWED_CATEGORIES.includes(category)) {
      filter.category = category;
    }
    if (severity !== 'all' && ALLOWED_SEVERITIES.includes(severity)) {
      filter.severity = severity;
    }

    if (search && search.trim()) {
      const regex = new RegExp(escapeRegex(search.trim()), 'i');
      filter.$or = [
        { action: regex },
        { summary: regex },
        { reason: regex },
        { 'actor.name': regex },
        { 'actor.email': regex },
        { 'target.label': regex },
      ];
    }

    const [logs, total, categoryStats] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .lean(),
      AuditLog.countDocuments(filter),
      AuditLog.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
    ]);

    const categoryCounts = ALLOWED_CATEGORIES.reduce((acc, cat) => {
      acc[cat] = 0;
      return acc;
    }, {});
    let overallTotal = 0;
    for (const row of categoryStats) {
      if (row._id && categoryCounts[row._id] !== undefined) {
        categoryCounts[row._id] = row.count;
      }
      overallTotal += row.count;
    }

    return res.status(200).json({
      success: true,
      logs,
      totalOverall: overallTotal,
      categoryCounts,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total,
        totalPages: Math.max(Math.ceil(total / parsedLimit), 1),
      },
    });
  } catch (error) {
    console.error('[Get Audit Logs Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve audit logs',
    });
  }
};

