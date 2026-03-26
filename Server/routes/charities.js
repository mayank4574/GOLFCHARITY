const express = require('express');
const router = express.Router();
const Charity = require('../models/Charity');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/charities — list all charities (public)
router.get('/', async (req, res) => {
  try {
    const { search, category, featured } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) filter.category = category;
    if (featured === 'true') filter.featured = true;

    const charities = await Charity.find(filter).sort({ featured: -1, createdAt: -1 });
    res.json({ charities });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/charities/:id — single charity profile
router.get('/:id', async (req, res) => {
  try {
    const charity = await Charity.findById(req.params.id);
    if (!charity) return res.status(404).json({ message: 'Charity not found' });

    // Count subscribers
    const subscriberCount = await User.countDocuments({ selectedCharity: charity._id });
    res.json({ charity: { ...charity.toObject(), subscriberCount } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/charities — [Admin] create charity
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, description, shortDescription, imageUrl, website, category, featured, events } = req.body;
    if (!name || !description) {
      return res.status(400).json({ message: 'Name and description are required' });
    }
    const charity = await Charity.create({
      name, description, shortDescription, imageUrl, website, category, featured, events,
    });
    res.status(201).json({ charity });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/charities/:id — [Admin] update charity
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const charity = await Charity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!charity) return res.status(404).json({ message: 'Charity not found' });
    res.json({ charity });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/charities/:id — [Admin] delete charity
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const charity = await Charity.findByIdAndDelete(req.params.id);
    if (!charity) return res.status(404).json({ message: 'Charity not found' });
    res.json({ message: 'Charity deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
