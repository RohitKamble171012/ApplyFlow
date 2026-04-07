const express = require('express');
const router = express.Router();
const { getEvents, createEvent, updateEvent, deleteEvent, extractFromEmails } = require('../controllers/calendar.controller');
const { verifyFirebaseToken } = require('../middleware/auth.middleware');

router.use(verifyFirebaseToken);
router.get('/events', getEvents);
router.post('/events', createEvent);
router.patch('/events/:id', updateEvent);
router.delete('/events/:id', deleteEvent);
router.post('/extract', extractFromEmails);

module.exports = router;