const express = require('express');
const router = express.Router();
const { getSyncLogs } = require('../controllers/sync.controller');
const { verifyFirebaseToken } = require('../middleware/auth.middleware');

router.use(verifyFirebaseToken);
router.get('/logs', getSyncLogs);

module.exports = router;
