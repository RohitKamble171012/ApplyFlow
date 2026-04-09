const { syncGmailInbox } = require('../services/gmail.service');
const User = require('../models/User');

/**
 * POST /api/gmail/sync
 * Trigger Gmail inbox sync for current user.
 *
 * Fix: GaxiosError stores the actual error in response.data.error,
 * not in error.message. We check both to catch invalid_grant properly.
 */
const syncInbox = async (req, res) => {
  try {
    if (!req.user.gmailConnected || !req.user.gmailTokens) {
      return res.status(400).json({
        error: 'Gmail not connected. Please connect your Gmail account first.',
        action: 'reconnect',
      });
    }

    const { maxResults = 100 } = req.body;
    const result = await syncGmailInbox(req.user._id, Math.min(maxResults, 500));

    res.json({
      success: true,
      message: `Synced ${result.totalSaved} new job-related emails from ${result.totalFetched} fetched`,
      ...result,
    });
  } catch (error) {
    // GaxiosError: check BOTH error.message AND error.response.data.error
    const gaxiosError = error.response?.data?.error;
    const isInvalidGrant =
      gaxiosError === 'invalid_grant' ||
      error.message?.includes('invalid_grant') ||
      error.message?.includes('Token has been expired') ||
      error.message?.includes('Token has been revoked');

    if (isInvalidGrant) {
      // Auto-clear the dead token so the user sees "not connected" state
      // instead of stuck in a broken connected state
      await User.findByIdAndUpdate(req.user._id, {
        gmailConnected: false,
        gmailTokens: null,
        gmailEmail: '',
      });

      return res.status(401).json({
        error: 'Your Gmail connection has expired or was revoked. Please reconnect Gmail in Settings.',
        action: 'reconnect',
        tokenCleared: true,
      });
    }

    console.error('Gmail sync error:', error.message || error);
    res.status(500).json({
      error: 'Sync failed',
      detail: error.message,
    });
  }
};

module.exports = { syncInbox };
