const { getOAuthClient, GMAIL_SCOPES } = require('../config/google');
const User = require('../models/User');
const { google } = require('googleapis');

/**
 * GET /api/google/connect
 * Initiate Gmail OAuth flow
 */
const connectGmail = (req, res) => {
  try {
    const userId = req.user._id.toString();
    const oauth2Client = getOAuthClient();

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: GMAIL_SCOPES,
      prompt: 'consent',
      state: userId, // pass userId through state
    });

    res.json({ authUrl });
  } catch (error) {
    console.error('Connect Gmail error:', error);
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
};

/**
 * GET /api/google/callback
 * Handle OAuth callback, exchange code for tokens
 */
const handleCallback = async (req, res) => {
  const { code, state: userId, error } = req.query;

  if (error) {
    return res.redirect(`${process.env.FRONTEND_URL}/settings?gmailError=${error}`);
  }

  if (!code || !userId) {
    return res.redirect(`${process.env.FRONTEND_URL}/settings?gmailError=missing_params`);
  }

  try {
    const oauth2Client = getOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user's Gmail profile
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: profile } = await oauth2.userinfo.get();

    // Save tokens to user
    await User.findByIdAndUpdate(userId, {
      gmailConnected: true,
      gmailTokens: tokens,
      gmailEmail: profile.email,
    });

    res.redirect(`${process.env.FRONTEND_URL}/dashboard?gmailConnected=true`);
  } catch (err) {
    console.error('OAuth callback error:', err);
    res.redirect(`${process.env.FRONTEND_URL}/settings?gmailError=token_exchange_failed`);
  }
};

/**
 * POST /api/google/disconnect
 * Remove Gmail tokens and mark disconnected
 */
const disconnectGmail = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      gmailConnected: false,
      gmailTokens: null,
      gmailEmail: '',
    });
    res.json({ success: true, message: 'Gmail disconnected' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to disconnect Gmail' });
  }
};

/**
 * GET /api/google/status
 * Check if Gmail is connected
 */
const getStatus = (req, res) => {
  res.json({
    gmailConnected: req.user.gmailConnected,
    gmailEmail: req.user.gmailEmail || '',
  });
};

module.exports = { connectGmail, handleCallback, disconnectGmail, getStatus };

/**
 * GET /api/google/debug-redirect
 * Shows exactly what redirect_uri the server is sending to Google.
 * Use this to find the mismatch. Remove after fixing.
 */
const debugRedirect = (req, res) => {
  res.json({
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || '❌ NOT SET',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '✅ set' : '❌ NOT SET',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '✅ set' : '❌ NOT SET',
    FRONTEND_URL: process.env.FRONTEND_URL || '❌ NOT SET',
    NODE_ENV: process.env.NODE_ENV,
  });
};

module.exports = { connectGmail, handleCallback, disconnectGmail, getStatus, debugRedirect };
