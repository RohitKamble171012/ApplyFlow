const Application = require('../models/Application');
const SyncedEmail = require('../models/SyncedEmail');

const VALID_STATUSES = ['Applied', 'Under Review', 'Next Step', 'OA / Assessment', 'Interview', 'Rejected', 'Offer', 'Follow-up Needed'];

const getApplications = async (req, res) => {
  try {
    const {
      page = 1, limit = 50, status, company, search,
      starred, archived = 'false', deleted = 'false',
      sortBy = 'updatedAt', sortOrder = 'desc',
    } = req.query;

    const query = { userId: req.user._id, deleted: deleted === 'true' };
    if (archived !== 'all') query.archived = archived === 'true';
    if (status) query.status = status;
    if (starred === 'true') query.starred = true;
    if (company) query.company = { $regex: new RegExp(company, 'i') };
    if (search) {
      query.$or = [
        { company: { $regex: new RegExp(search, 'i') } },
        { role: { $regex: new RegExp(search, 'i') } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Application.countDocuments(query);
    const applications = await Application.find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('sourceEmailId', 'subject snippet receivedAt from classification')
      .lean();

    res.json({
      applications,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    console.error('getApplications error:', error);
    res.status(500).json({ error: 'Failed to fetch applications', detail: error.message });
  }
};

const getApplicationById = async (req, res) => {
  try {
    const app = await Application.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('sourceEmailId');
    if (!app) return res.status(404).json({ error: 'Application not found' });

    const emails = await SyncedEmail.find({ applicationId: app._id, userId: req.user._id })
      .sort({ receivedAt: -1 })
      .select('subject snippet from receivedAt classification starred');

    res.json({ application: app, relatedEmails: emails });
  } catch (error) {
    console.error('getApplicationById error:', error);
    res.status(500).json({ error: 'Failed to fetch application', detail: error.message });
  }
};

/**
 * POST /api/applications
 * Fixed: log the actual validation error instead of swallowing it
 */
const createApplication = async (req, res) => {
  try {
    const { company, role, status = 'Applied' } = req.body;

    if (!company || !company.trim()) {
      return res.status(400).json({ error: 'Company name is required' });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    const app = await Application.create({
      userId: req.user._id,
      company: company.trim(),
      role: role?.trim() || 'Unknown Role',
      status,
      timeline: [{ status, note: 'Manually added' }],
      notes: [],
      labels: [],
      starred: false,
      archived: false,
      deleted: false,
    });

    res.status(201).json(app);
  } catch (error) {
    // Log the REAL error so you can see what's failing
    console.error('createApplication error:', error.message, error.errors);
    res.status(500).json({
      error: 'Failed to create application',
      detail: error.message,
      // Return validation errors in dev
      ...(process.env.NODE_ENV !== 'production' && { validationErrors: error.errors }),
    });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status, note = '' } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Invalid status', valid: VALID_STATUSES });
    }
    const app = await Application.findOne({ _id: req.params.id, userId: req.user._id });
    if (!app) return res.status(404).json({ error: 'Application not found' });

    if (app.status !== status) {
      app.timeline.push({ status, note: note || `Status changed to ${status}` });
    }
    app.status = status;
    await app.save();
    res.json(app);
  } catch (error) {
    console.error('updateStatus error:', error);
    res.status(500).json({ error: 'Failed to update status', detail: error.message });
  }
};

const addNote = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Note content is required' });
    const app = await Application.findOne({ _id: req.params.id, userId: req.user._id });
    if (!app) return res.status(404).json({ error: 'Application not found' });
    app.notes.push({ content: content.trim() });
    await app.save();
    res.json(app.notes[app.notes.length - 1]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add note', detail: error.message });
  }
};

const deleteNote = async (req, res) => {
  try {
    const app = await Application.findOne({ _id: req.params.id, userId: req.user._id });
    if (!app) return res.status(404).json({ error: 'Application not found' });
    app.notes = app.notes.filter((n) => n._id.toString() !== req.params.noteId);
    await app.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
};

const toggleStar = async (req, res) => {
  try {
    const app = await Application.findOne({ _id: req.params.id, userId: req.user._id });
    if (!app) return res.status(404).json({ error: 'Application not found' });
    app.starred = !app.starred;
    await app.save();
    res.json({ starred: app.starred });
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle star' });
  }
};

const toggleArchive = async (req, res) => {
  try {
    const app = await Application.findOne({ _id: req.params.id, userId: req.user._id });
    if (!app) return res.status(404).json({ error: 'Application not found' });
    app.archived = !app.archived;
    await app.save();
    res.json({ archived: app.archived });
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle archive' });
  }
};

const toggleDelete = async (req, res) => {
  try {
    const app = await Application.findOne({ _id: req.params.id, userId: req.user._id });
    if (!app) return res.status(404).json({ error: 'Application not found' });
    app.deleted = !app.deleted;
    await app.save();
    res.json({ deleted: app.deleted });
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle delete' });
  }
};

const updateApplication = async (req, res) => {
  try {
    const { company, role, labels } = req.body;
    const app = await Application.findOne({ _id: req.params.id, userId: req.user._id });
    if (!app) return res.status(404).json({ error: 'Application not found' });
    if (company !== undefined) app.company = company;
    if (role !== undefined) app.role = role;
    if (labels !== undefined) app.labels = labels;
    await app.save();
    res.json(app);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update application', detail: error.message });
  }
};

module.exports = {
  getApplications, getApplicationById, createApplication, updateStatus,
  addNote, deleteNote, toggleStar, toggleArchive, toggleDelete, updateApplication,
};