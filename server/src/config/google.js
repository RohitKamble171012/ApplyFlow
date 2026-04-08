const { google } = require('googleapis');

const getOAuthClient = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
};

/**
 * Scopes explanation:
 * - gmail.readonly: Read emails from inbox (required for sync)
 * - userinfo.email + profile: Get user's name and email for their profile
 *
 * We removed gmail.modify — we store email data in our own DB,
 * we don't need to modify labels/archive in Gmail itself.
 * This reduces scope sensitivity for Google verification.
 */
const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

module.exports = { getOAuthClient, GMAIL_SCOPES };
