const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/dashboard.controller');
const { verifyFirebaseToken } = require('../middleware/auth.middleware');

router.use(verifyFirebaseToken);
router.get('/stats', getStats);

module.exports = router;
