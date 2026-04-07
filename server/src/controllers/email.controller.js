const SyncedEmail = require('../models/SyncedEmail');

/**
 * GET /api/emails
 * Always filters isJobRelated:true by default (unless viewing trash which shows all)
 */
const getEmails = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      status,
      company,
      search,
      starred,
      archived = 'false',
      deleted = 'false',
    } = req.query;

    const query = {
      userId: req.user._id,
      deleted: deleted === 'true',
    };

    // Always restrict to job-related emails UNLESS viewing trash
    // (trash can contain any deleted email)
    if (deleted !== 'true') {
      query['classification.isJobRelated'] = true;
    }

    if (archived === 'true') {
      query.archived = true;
    } else if (deleted !== 'true') {
      // Normal inbox: not archived
      query.archived = false;
    }

    if (status) {
      query['classification.detectedCategory'] = status;
    }

    if (starred === 'true') {
      query.starred = true;
    }

    if (company) {
      query['classification.extractedCompany'] = { $regex: new RegExp(company, 'i') };
    }

    if (search) {
      query.$or = [
        { subject:                             { $regex: new RegExp(search, 'i') } },
        { snippet:                             { $regex: new RegExp(search, 'i') } },
        { from:                                { $regex: new RegExp(search, 'i') } },
        { 'classification.extractedCompany':   { $regex: new RegExp(search, 'i') } },
        { 'classification.extractedRole':      { $regex: new RegExp(search, 'i') } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [total, emails] = await Promise.all([
      SyncedEmail.countDocuments(query),
      SyncedEmail.find(query)
        .sort({ receivedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-body -rawMetadata')
        .lean(),
    ]);

    res.json({
      emails,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('getEmails error:', error);
    res.status(500).json({ error: 'Failed to fetch emails', detail: error.message });
  }
};

const getEmailById = async (req, res) => {
  try {
    const email = await SyncedEmail.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate('applicationId');
    if (!email) return res.status(404).json({ error: 'Email not found' });
    res.json(email);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch email' });
  }
};

const toggleStar = async (req, res) => {
  try {
    const email = await SyncedEmail.findOne({ _id: req.params.id, userId: req.user._id });
    if (!email) return res.status(404).json({ error: 'Email not found' });
    email.starred = !email.starred;
    await email.save();
    res.json({ starred: email.starred });
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle star' });
  }
};

const toggleArchive = async (req, res) => {
  try {
    const email = await SyncedEmail.findOne({ _id: req.params.id, userId: req.user._id });
    if (!email) return res.status(404).json({ error: 'Email not found' });
    email.archived = !email.archived;
    await email.save();
    res.json({ archived: email.archived });
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle archive' });
  }
};

const toggleDelete = async (req, res) => {
  try {
    const email = await SyncedEmail.findOne({ _id: req.params.id, userId: req.user._id });
    if (!email) return res.status(404).json({ error: 'Email not found' });
    email.deleted = !email.deleted;
    await email.save();
    res.json({ deleted: email.deleted });
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle delete' });
  }
};

const updateClassification = async (req, res) => {
  try {
    const { detectedCategory, extractedCompany, extractedRole } = req.body;
    const email = await SyncedEmail.findOne({ _id: req.params.id, userId: req.user._id });
    if (!email) return res.status(404).json({ error: 'Email not found' });
    if (detectedCategory)          email.classification.detectedCategory = detectedCategory;
    if (extractedCompany !== undefined) email.classification.extractedCompany = extractedCompany;
    if (extractedRole !== undefined)    email.classification.extractedRole = extractedRole;
    await email.save();
    res.json(email);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update classification' });
  }
};

module.exports = { getEmails, getEmailById, toggleStar, toggleArchive, toggleDelete, updateClassification };