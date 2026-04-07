const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    photoURL: { type: String, default: '' },
    gmailConnected: { type: Boolean, default: false },
    gmailTokens: {
      access_token: String,
      refresh_token: String,
      token_type: String,
      expiry_date: Number,
    },
    gmailEmail: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
