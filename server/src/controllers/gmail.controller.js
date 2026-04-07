const { syncGmailInbox } = require('../services/gmail.service');

/**
 * POST /api/gmail/sync
 * Trigger Gmail inbox sync for current user
 */
const syncInbox = async (req, res) => {
  try {
    if (!req.user.gmailConnected || !req.user.gmailTokens) {
      return res.status(400).json({ error: 'Gmail not connected. Please connect your Gmail account first.' });
    }

    const { maxResults = 100 } = req.body;

    const result = await syncGmailInbox(req.user._id, Math.min(maxResults, 500));

    res.json({
      success: true,
      message: `Synced ${result.totalSaved} new job-related emails from ${result.totalFetched} fetched`,
      ...result,
    });
  } catch (error) {
    console.error('Gmail sync error:', error);
    if (error.message?.includes('invalid_grant') || error.message?.includes('Token has been expired')) {
      return res.status(401).json({ error: 'Gmail token expired. Please reconnect your Gmail account.' });
    }
    res.status(500).json({ error: 'Sync failed', detail: error.message });
  }
};

module.exports = { syncInbox };
