/**
 * Run ONCE to clean up stale MongoDB indexes that cause E11000 errors.
 * Usage: node src/utils/fixIndexes.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

async function fixIndexes() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection;
  console.log('Connected. Cleaning up indexes...\n');

  const toCheck = [
    { collection: 'applications', badIndexes: ['sourceMessageId_1', 'sourceEmailId_1'] },
    { collection: 'syncedemails', badIndexes: ['userId_1_gmailMessageId_1'] },
  ];

  for (const { collection, badIndexes } of toCheck) {
    try {
      const col = db.collection(collection);
      const existing = await col.indexes();
      console.log(`${collection}:`);
      for (const bad of badIndexes) {
        if (existing.find((i) => i.name === bad)) {
          await col.dropIndex(bad);
          console.log(`  ✅ Dropped: ${bad}`);
        } else {
          console.log(`  — Not found (ok): ${bad}`);
        }
      }
    } catch (e) {
      console.log(`  ⚠️  ${collection}: ${e.message}`);
    }
  }

  await mongoose.disconnect();
  console.log('\nDone! Restart your server now.');
}

fixIndexes().catch(console.error);