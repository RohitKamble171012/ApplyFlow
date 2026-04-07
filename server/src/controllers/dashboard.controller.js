const Application = require('../models/Application');
const SyncedEmail = require('../models/SyncedEmail');
const mongoose = require('mongoose');

/**
 * GET /api/dashboard/stats
 *
 * Root cause of stats not updating:
 * - Mongoose aggregate() does NOT auto-cast req.user._id to ObjectId
 * - Must explicitly wrap with new mongoose.Types.ObjectId()
 * - We also pull counts from SyncedEmail as a reliable source
 *   since some emails may not produce an Application record
 */
const getStats = async (req, res) => {
  try {
    // Critical fix: aggregate pipelines need explicit ObjectId cast
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const [
      totalApplications,
      appStatusCounts,
      recentApplications,
      totalEmails,
      emailStatusCounts,
    ] = await Promise.all([
      Application.countDocuments({ userId, deleted: false }),

      Application.aggregate([
        { $match: { userId, deleted: false } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      Application.find({ userId, deleted: false })
        .sort({ updatedAt: -1 })
        .limit(5)
        .select('company role status updatedAt starred'),

      SyncedEmail.countDocuments({ userId, deleted: false }),

      // Count classified emails by status — always saved, always reliable
      SyncedEmail.aggregate([
        {
          $match: {
            userId,
            deleted: false,
            'classification.isJobRelated': true,
            'classification.detectedCategory': { $ne: 'Unknown' },
          },
        },
        { $group: { _id: '$classification.detectedCategory', count: { $sum: 1 } } },
      ]),
    ]);

    // Build status maps
    const appStatusMap = {};
    appStatusCounts.forEach(({ _id, count }) => { if (_id) appStatusMap[_id] = count; });

    const emailStatusMap = {};
    emailStatusCounts.forEach(({ _id, count }) => { if (_id) emailStatusMap[_id] = count; });

    const ALL_STATUSES = [
      'Applied', 'Under Review', 'Next Step', 'OA / Assessment',
      'Interview', 'Rejected', 'Offer', 'Follow-up Needed',
    ];

    // Merge: use whichever count is higher — emails are ground truth
    const byStatus = {};
    for (const status of ALL_STATUSES) {
      byStatus[status] = Math.max(appStatusMap[status] || 0, emailStatusMap[status] || 0);
    }

    const totalFromEmails = emailStatusCounts.reduce((sum, { count }) => sum + count, 0);

    res.json({
      totalApplications: Math.max(totalApplications, totalFromEmails),
      totalEmails,
      byStatus,
      recentApplications,
    });
  } catch (error) {
    console.error('getStats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats', detail: error.message });
  }
};

module.exports = { getStats };