const mongoose = require('mongoose');

const timelineEntrySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    note: { type: String, default: '' },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const noteSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const applicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    company: { type: String, default: 'Unknown Company' },
    role: { type: String, default: 'Unknown Role' },
    status: {
      type: String,
      enum: ['Applied', 'Under Review', 'Next Step', 'OA / Assessment', 'Interview', 'Rejected', 'Offer', 'Follow-up Needed'],
      default: 'Applied',
    },
    sourceEmailId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SyncedEmail',
      default: null,
    },
    timeline: [timelineEntrySchema],
    notes: [noteSchema],
    labels: [String],
    starred: { type: Boolean, default: false },
    archived: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

applicationSchema.index({ userId: 1, status: 1 });
applicationSchema.index({ userId: 1, company: 1 });

module.exports = mongoose.model('Application', applicationSchema);
