const express = require('express');
const router = express.Router();
const { getEmails, getEmailById, toggleStar, toggleArchive, toggleDelete, updateClassification } = require('../controllers/email.controller');
const { verifyFirebaseToken } = require('../middleware/auth.middleware');

router.use(verifyFirebaseToken);

router.get('/', getEmails);
router.get('/:id', getEmailById);
router.patch('/:id/star', toggleStar);
router.patch('/:id/archive', toggleArchive);
router.patch('/:id/delete', toggleDelete);
router.patch('/:id/classify', updateClassification);

module.exports = router;
