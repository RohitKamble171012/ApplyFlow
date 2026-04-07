const express = require('express');
const router = express.Router();
const { getLabels, createLabel, updateLabel, deleteLabel } = require('../controllers/label.controller');
const { verifyFirebaseToken } = require('../middleware/auth.middleware');

router.use(verifyFirebaseToken);
router.get('/', getLabels);
router.post('/', createLabel);
router.patch('/:id', updateLabel);
router.delete('/:id', deleteLabel);

module.exports = router;
