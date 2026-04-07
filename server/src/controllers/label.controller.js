const Label = require('../models/Label');

const getLabels = async (req, res) => {
  try {
    const labels = await Label.find({ userId: req.user._id }).sort({ name: 1 });
    res.json(labels);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch labels' });
  }
};

const createLabel = async (req, res) => {
  try {
    const { name, color = '#3b82f6' } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Label name is required' });

    const existing = await Label.findOne({ userId: req.user._id, name: name.trim() });
    if (existing) return res.status(400).json({ error: 'Label with this name already exists' });

    const label = await Label.create({ userId: req.user._id, name: name.trim(), color });
    res.status(201).json(label);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create label' });
  }
};

const updateLabel = async (req, res) => {
  try {
    const { name, color } = req.body;
    const label = await Label.findOne({ _id: req.params.id, userId: req.user._id });
    if (!label) return res.status(404).json({ error: 'Label not found' });

    if (name) label.name = name.trim();
    if (color) label.color = color;
    await label.save();
    res.json(label);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update label' });
  }
};

const deleteLabel = async (req, res) => {
  try {
    const label = await Label.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!label) return res.status(404).json({ error: 'Label not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete label' });
  }
};

module.exports = { getLabels, createLabel, updateLabel, deleteLabel };
