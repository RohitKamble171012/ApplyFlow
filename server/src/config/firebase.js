const admin = require('firebase-admin');

let initialized = false;

const initializeFirebase = () => {
  if (initialized) return admin;

  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  if (!process.env.FIREBASE_PROJECT_ID || !privateKey || !process.env.FIREBASE_CLIENT_EMAIL) {
    console.warn('⚠️  Firebase Admin SDK not fully configured. Auth middleware will be disabled.');
    return null;
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });

  initialized = true;
  console.log('✅ Firebase Admin SDK initialized');
  return admin;
};

module.exports = { initializeFirebase, admin };
