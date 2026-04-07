const mongoose = require('mongoose');

const classificationSchema = new mongoose.Schema(
  {
    detectedCategory: {
      type: String,
      enum: ['Applied','Under Review','Next Step','OA / Assessment',
             'Interview','Rejected','Offer','Follow-up Needed','Unknown'],
      default: 'Unknown',
    },
    confidenceScore:    { type: Number, default: 0 },
    matchedKeywords:    [String],
    extractedCompany:   { type: String, default: '' },
    extractedRole:      { type: String, default: '' },
    extractedStatus:    { type: String, default: '' },
    extractedActionItems: [String],
    isJobRelated:       { type: Boolean, default: false },
  },
  { _id: false }
);

const syncedEmailSchema = new mongoose.Schema(
  {
    userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    gmailMessageId:{ type: String, required: true, unique: true },
    threadId:      { type: String, default: '' },
    from:          { type: String, default: '' },
    fromName:      { type: String, default: '' },
    fromEmail:     { type: String, default: '' },
    subject:       { type: String, default: '' },
    snippet:       { type: String, default: '' },
    body:          { type: String, default: '' },
    receivedAt:    { type: Date, default: Date.now },
    labels:        [String],
    starred:       { type: Boolean, default: false },
    archived:      { type: Boolean, default: false },
    deleted:       { type: Boolean, default: false },
    classification: classificationSchema,
    rawMetadata:   { type: mongoose.Schema.Types.Mixed },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', default: null },
  },
  { timestamps: true }
);

// ── Indexes for fast queries ──────────────────────────────────────────────────
// Main inbox query: userId + deleted + isJobRelated + sort by receivedAt
syncedEmailSchema.index({ userId: 1, deleted: 1, 'classification.isJobRelated': 1, receivedAt: -1 });

// Status filter query
syncedEmailSchema.index({ userId: 1, deleted: 1, 'classification.detectedCategory': 1, receivedAt: -1 });

// Starred filter
syncedEmailSchema.index({ userId: 1, starred: 1, receivedAt: -1 });

// Thread lookup
syncedEmailSchema.index({ userId: 1, threadId: 1 });

module.exports = mongoose.model('SyncedEmail', syncedEmailSchema);