const express = require('express');
const router = express.Router();
const { firebaseLogin, getMe } = require('../controllers/auth.controller');
const { verifyFirebaseToken } = require('../middleware/auth.middleware');

router.post('/firebase-login', firebaseLogin);
router.get('/me', verifyFirebaseToken, getMe);

module.exports = router;
