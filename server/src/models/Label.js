const mongoose = require('mongoose');

const labelSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: { type: String, required: true },
    color: { type: String, default: '#3b82f6' },
  },
  { timestamps: true }
);

labelSchema.index({ userId: 1 });

module.exports = mongoose.model('Label', labelSchema);
