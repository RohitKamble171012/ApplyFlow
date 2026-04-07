const CalendarEvent = require('../models/CalendarEvent');
const SyncedEmail = require('../models/SyncedEmail');
const { extractCalendarEvents } = require('../utils/dateExtractor');
const mongoose = require('mongoose');

/** GET /api/calendar/events?month=2025-01 */
const getEvents = async (req, res) => {
  try {
    const { month, from, to } = req.query;
    const userId = req.user._id;
    const query = { userId };

    if (month) {
      // e.g. "2025-01" → filter dates starting with "2025-01"
      query.date = { $regex: `^${month}` };
    } else if (from && to) {
      query.date = { $gte: from, $lte: to };
    }

    const events = await CalendarEvent.find(query).sort({ date: 1, time: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events', detail: err.message });
  }
};

/** POST /api/calendar/events — manual event */
const createEvent = async (req, res) => {
  try {
    const { title, date, time, type = 'custom', company, role, notes, color } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: 'Title is required' });
    if (!date) return res.status(400).json({ error: 'Date is required' });

    const event = await CalendarEvent.create({
      userId: req.user._id,
      title: title.trim(),
      date,
      time: time || null,
      type,
      company: company || '',
      role: role || '',
      notes: notes || '',
      color: color || '',
    });
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create event', detail: err.message });
  }
};

/** PATCH /api/calendar/events/:id */
const updateEvent = async (req, res) => {
  try {
    const event = await CalendarEvent.findOne({ _id: req.params.id, userId: req.user._id });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const fields = ['title','date','time','type','company','role','notes','color','completed'];
    fields.forEach(f => { if (req.body[f] !== undefined) event[f] = req.body[f]; });
    await event.save();
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update event', detail: err.message });
  }
};

/** DELETE /api/calendar/events/:id */
const deleteEvent = async (req, res) => {
  try {
    await CalendarEvent.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
};

/** POST /api/calendar/extract — scan all emails and extract dates */
const extractFromEmails = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const emails = await SyncedEmail.find({
      userId,
      deleted: false,
      'classification.isJobRelated': true,
      'classification.detectedCategory': { $in: ['Interview','OA / Assessment','Follow-up Needed','Offer'] },
    }).limit(200);

    let created = 0;
    let skipped = 0;

    for (const email of emails) {
      const events = extractCalendarEvents(email);
      for (const ev of events) {
        // Avoid duplicates: same user + title + date
        const exists = await CalendarEvent.findOne({
          userId: req.user._id,
          title: ev.title,
          date: ev.date,
        });
        if (exists) { skipped++; continue; }

        await CalendarEvent.create({
          userId: req.user._id,
          ...ev,
          sourceEmailId: email._id,
          applicationId: email.applicationId || null,
        });
        created++;
      }
    }

    res.json({ created, skipped, message: `Extracted ${created} calendar events from your emails` });
  } catch (err) {
    res.status(500).json({ error: 'Extraction failed', detail: err.message });
  }
};

module.exports = { getEvents, createEvent, updateEvent, deleteEvent, extractFromEmails };