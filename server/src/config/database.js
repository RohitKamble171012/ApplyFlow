const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    await dropStaleIndexes(conn.connection);
    await ensureIndexes();
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Drop old bad indexes that cause E11000 errors
const dropStaleIndexes = async (connection) => {
  const stale = [
    { collection: 'applications', index: 'sourceMessageId_1' },
    { collection: 'applications', index: 'sourceEmailId_1' },
  ];
  for (const { collection, index } of stale) {
    try {
      const col = connection.collection(collection);
      const existing = await col.indexes();
      if (existing.find(i => i.name === index)) {
        await col.dropIndex(index);
        console.log(`🗑️  Dropped stale index: ${collection}.${index}`);
      }
    } catch (err) {
      if (!err.message.includes('index not found') && !err.message.includes('ns not found')) {
        console.warn(`⚠️  Could not drop ${index}:`, err.message);
      }
    }
  }
};

// Ensure all model indexes exist (idempotent)
const ensureIndexes = async () => {
  try {
    const SyncedEmail  = require('../models/SyncedEmail');
    const Application  = require('../models/Application');
    await SyncedEmail.ensureIndexes();
    await Application.ensureIndexes();
    console.log('✅ DB indexes ready');
  } catch (err) {
    console.warn('⚠️  ensureIndexes:', err.message);
  }
};

module.exports = connectDB;