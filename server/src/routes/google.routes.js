const express = require('express');
const router = express.Router();
const { connectGmail, handleCallback, disconnectGmail, getStatus } = require('../controllers/google.controller');
const { verifyFirebaseToken } = require('../middleware/auth.middleware');

router.get('/connect', verifyFirebaseToken, connectGmail);
router.get('/callback', handleCallback);
router.post('/disconnect', verifyFirebaseToken, disconnectGmail);
router.get('/status', verifyFirebaseToken, getStatus);

module.exports = router;
