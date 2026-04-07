const { google } = require('googleapis');
const { getOAuthClient } = require('../config/google');
const { classifyEmail } = require('./classifier.service');
const SyncedEmail = require('../models/SyncedEmail');
const Application = require('../models/Application');
const SyncLog = require('../models/SyncLog');
const User = require('../models/User');

const getGmailClient = (tokens) => {
  const auth = getOAuthClient();
  auth.setCredentials(tokens);
  return google.gmail({ version: 'v1', auth });
};

const decodeBase64 = (data) => {
  if (!data) return '';
  const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
  try {
    return Buffer.from(base64, 'base64').toString('utf-8');
  } catch {
    return '';
  }
};

const stripHtml = (html) => {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

const extractBodyFromParts = (parts) => {
  if (!parts) return '';
  let textContent = '';
  let htmlContent = '';

  for (const part of parts) {
    if (part.mimeType === 'text/plain' && part.body?.data) {
      textContent += decodeBase64(part.body.data);
    } else if (part.mimeType === 'text/html' && part.body?.data) {
      htmlContent += decodeBase64(part.body.data);
    } else if (part.parts) {
      const nested = extractBodyFromParts(part.parts);
      if (nested) htmlContent = htmlContent || nested;
    }
  }

  if (htmlContent) return stripHtml(htmlContent);
  return textContent;
};

const parseGmailMessage = (message) => {
  const headers = message.payload?.headers || [];
  const getHeader = (name) =>
    headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

  const from = getHeader('From');
  const subject = getHeader('Subject');
  const date = getHeader('Date');

  const fromMatch = from.match(/^(.*?)\s*<(.+?)>$/) || from.match(/^(.+)$/);
  const fromName = fromMatch ? fromMatch[1].trim().replace(/['"]/g, '') : from;
  const fromEmail = fromMatch && fromMatch[2] ? fromMatch[2].trim() : from;

  let body = '';
  if (message.payload?.body?.data) {
    const rawBody = decodeBase64(message.payload.body.data);
    body = message.payload.mimeType === 'text/html' ? stripHtml(rawBody) : rawBody;
  } else if (message.payload?.parts) {
    body = extractBodyFromParts(message.payload.parts);
  }

  body = body.slice(0, 5000);

  return {
    gmailMessageId: message.id,
    threadId: message.threadId,
    from,
    fromName,
    fromEmail,
    subject,
    snippet: message.snippet || '',
    body,
    receivedAt: date ? new Date(date) : new Date(parseInt(message.internalDate)),
    labels: message.labelIds || [],
  };
};

/**
 * Main sync — fetch emails and classify them
 */
const syncGmailInbox = async (userId, maxResults = 100) => {
  const startTime = Date.now();
  const user = await User.findById(userId);

  if (!user || !user.gmailTokens) {
    throw new Error('Gmail not connected for this user');
  }

  const gmail = getGmailClient(user.gmailTokens);
  let totalFetched = 0;
  let totalSaved = 0;
  let totalClassified = 0;

  try {
    const listResponse = await gmail.users.messages.list({
      userId: 'me',
      maxResults,
      q: 'in:inbox OR in:spam',
    });

    const messages = listResponse.data.messages || [];
    totalFetched = messages.length;

    const BATCH_SIZE = 10;
    for (let i = 0; i < messages.length; i += BATCH_SIZE) {
      const batch = messages.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (msg) => {
          try {
            const existing = await SyncedEmail.findOne({ gmailMessageId: msg.id });
            if (existing) return;

            const fullMsg = await gmail.users.messages.get({
              userId: 'me',
              id: msg.id,
              format: 'full',
            });

            const parsed = parseGmailMessage(fullMsg.data);

            const classification = classifyEmail({
              subject: parsed.subject,
              snippet: parsed.snippet,
              body: parsed.body,
              from: parsed.from,
            });

            if (!classification.isJobRelated) return;

            const syncedEmail = await SyncedEmail.create({
              userId,
              ...parsed,
              classification,
              rawMetadata: {
                labelIds: fullMsg.data.labelIds,
                historyId: fullMsg.data.historyId,
              },
            });

            totalClassified++;

            await upsertApplication(userId, syncedEmail, classification);

            totalSaved++;
          } catch (err) {
            console.error(`Error processing message ${msg.id}:`, err.message);
          }
        })
      );
    }

    const durationMs = Date.now() - startTime;
    await SyncLog.create({ userId, totalFetched, totalSaved, totalClassified, status: 'success', durationMs });

    return { totalFetched, totalSaved, totalClassified };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    await SyncLog.create({ userId, totalFetched, totalSaved, totalClassified, status: 'failed', error: error.message, durationMs });
    throw error;
  }
};

/**
 * Create or update an Application record.
 *
 * Fix: old code matched by company name with a loose regex which could
 * mismatch. Now we match on company + role together when possible,
 * and always create a new Application if no match found.
 */
const upsertApplication = async (userId, syncedEmail, classification) => {
  if (!classification.isJobRelated) return null;

  const company = (classification.extractedCompany || syncedEmail.fromName || 'Unknown Company').trim();
  const role = (classification.extractedRole || 'Unknown Role').trim();
  const status = classification.detectedCategory;

  try {
    // Escape special regex chars in company name
    const escapedCompany = company.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Try to find existing: match company AND (role or same thread)
    let application = null;

    if (role && role !== 'Unknown Role') {
      // Try exact company + role match first
      const escapedRole = role.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      application = await Application.findOne({
        userId,
        deleted: false,
        company: { $regex: new RegExp(`^${escapedCompany}$`, 'i') },
        role:    { $regex: new RegExp(escapedRole, 'i') },
      });
    }

    if (!application) {
      // Try company-only match (same company, pick most recent)
      application = await Application.findOne({
        userId,
        deleted: false,
        company: { $regex: new RegExp(`^${escapedCompany}$`, 'i') },
      }).sort({ updatedAt: -1 });
    }

    if (application) {
      // Only add timeline if status actually changed
      if (application.status !== status) {
        application.timeline.push({
          status,
          note: `Auto-updated from email: "${syncedEmail.subject}"`,
        });
        application.status = status;
        await application.save();
      }
    } else {
      // Create brand new Application
      application = await Application.create({
        userId,
        company,
        role,
        status,
        sourceEmailId: syncedEmail._id,
        timeline: [{
          status,
          note: `Auto-detected from email: "${syncedEmail.subject}"`,
        }],
      });
    }

    // Link email → application
    await SyncedEmail.findByIdAndUpdate(syncedEmail._id, { applicationId: application._id });

    return application;
  } catch (err) {
    console.error('upsertApplication error:', err.message);
    return null;
  }
};

module.exports = { syncGmailInbox, getGmailClient };