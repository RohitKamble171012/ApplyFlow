const SyncLog = require('../models/SyncLog');

/**
 * GET /api/sync/logs
 */
const getSyncLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      SyncLog.find({ userId: req.user._id })
        .sort({ syncedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      SyncLog.countDocuments({ userId: req.user._id }),
    ]);

    res.json({
      logs,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sync logs' });
  }
};

module.exports = { getSyncLogs };
