const mongoose = require('mongoose');

const syncLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    syncedAt: { type: Date, default: Date.now },
    totalFetched: { type: Number, default: 0 },
    totalSaved: { type: Number, default: 0 },
    totalClassified: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['success', 'partial', 'failed'],
      default: 'success',
    },
    error: { type: String, default: '' },
    durationMs: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SyncLog', syncLogSchema);
