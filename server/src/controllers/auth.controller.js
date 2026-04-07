const { initializeFirebase } = require('../config/firebase');
const User = require('../models/User');

/**
 * POST /api/auth/firebase-login
 * Verify Firebase ID token and create/update user in DB
 */
const firebaseLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'idToken is required' });
    }

    const adminSdk = initializeFirebase();
    if (!adminSdk) {
      return res.status(500).json({ error: 'Firebase Admin not configured' });
    }

    const decoded = await adminSdk.auth().verifyIdToken(idToken);

    const { uid, name, email, picture } = decoded;

    // Upsert user
    const user = await User.findOneAndUpdate(
      { firebaseUid: uid },
      {
        $set: {
          name: name || email,
          email,
          photoURL: picture || '',
        },
        $setOnInsert: {
          firebaseUid: uid,
          gmailConnected: false,
        },
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      user: {
        id: user._id,
        firebaseUid: user.firebaseUid,
        name: user.name,
        email: user.email,
        photoURL: user.photoURL,
        gmailConnected: user.gmailConnected,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Firebase login error:', error);
    res.status(401).json({ error: 'Authentication failed', detail: error.message });
  }
};

/**
 * GET /api/auth/me
 * Return current authenticated user
 */
const getMe = async (req, res) => {
  const user = req.user;
  res.json({
    id: user._id,
    firebaseUid: user.firebaseUid,
    name: user.name,
    email: user.email,
    photoURL: user.photoURL,
    gmailConnected: user.gmailConnected,
    gmailEmail: user.gmailEmail,
    createdAt: user.createdAt,
  });
};

module.exports = { firebaseLogin, getMe };
