const express = require('express');
const router = express.Router();
const { syncInbox } = require('../controllers/gmail.controller');
const { verifyFirebaseToken } = require('../middleware/auth.middleware');

router.post('/sync', verifyFirebaseToken, syncInbox);

module.exports = router;
