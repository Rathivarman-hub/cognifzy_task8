import Log from '../models/logModel.js';

// GET /api/logs
export const getLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, level, method, statusCode } = req.query;
    const filter = {};

    if (level) filter.level = level;
    if (method) filter.method = method.toUpperCase();
    if (statusCode) filter.statusCode = parseInt(statusCode);

    const [logs, total] = await Promise.all([
      Log.find(filter)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .lean(),
      Log.countDocuments(filter),
    ]);

    // Aggregate stats
    const stats = await Log.aggregate([
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 },
          avgResponseTime: { $avg: '$responseTime' },
        },
      },
    ]);

    const statsMap = {};
    stats.forEach((s) => { statsMap[s._id] = { count: s.count, avgResponseTime: Math.round(s.avgResponseTime) }; });

    res.json({
      success: true,
      data: logs,
      stats: statsMap,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/logs/clear
export const clearLogs = async (req, res, next) => {
  try {
    const { before } = req.query;
    const filter = {};

    if (before) {
      filter.createdAt = { $lt: new Date(before) };
    }

    const result = await Log.deleteMany(filter);

    res.json({
      success: true,
      message: `Cleared ${result.deletedCount} log entries`,
      deleted: result.deletedCount,
    });
  } catch (error) {
    next(error);
  }
};

export default { getLogs, clearLogs };
