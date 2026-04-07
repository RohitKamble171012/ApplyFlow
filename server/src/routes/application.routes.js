const express = require('express');
const router = express.Router();
const {
  getApplications, getApplicationById, createApplication, updateStatus,
  addNote, deleteNote, toggleStar, toggleArchive, toggleDelete, updateApplication,
} = require('../controllers/application.controller');
const { verifyFirebaseToken } = require('../middleware/auth.middleware');

router.use(verifyFirebaseToken);

router.get('/', getApplications);
router.post('/', createApplication);
router.get('/:id', getApplicationById);
router.patch('/:id', updateApplication);
router.patch('/:id/status', updateStatus);
router.patch('/:id/star', toggleStar);
router.patch('/:id/archive', toggleArchive);
router.patch('/:id/delete', toggleDelete);
router.post('/:id/notes', addNote);
router.delete('/:id/notes/:noteId', deleteNote);

module.exports = router;
