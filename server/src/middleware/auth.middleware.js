const { initializeFirebase } = require('../config/firebase');
const User = require('../models/User');

const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split('Bearer ')[1];
    const adminSdk = initializeFirebase();

    if (!adminSdk) {
      return res.status(500).json({ error: 'Firebase Admin SDK not configured' });
    }

    const decoded = await adminSdk.auth().verifyIdToken(token);

    // Attach user info from DB
    const user = await User.findOne({ firebaseUid: decoded.uid });
    if (!user) {
      return res.status(401).json({ error: 'User not found. Please login first.' });
    }

    req.user = user;
    req.firebaseUser = decoded;
    next();
  } catch (error) {
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ error: 'Token expired. Please re-authenticate.' });
    }
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = { verifyFirebaseToken };
