const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const { signToken, protect } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, selectedCharity, charityContributionPct } = req.body;

    // Validation
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Full name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check duplicate email
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    // Create user
    const user = await User.create({
      fullName,
      email,
      password,
      selectedCharity: selectedCharity || null,
      charityContributionPct: charityContributionPct || 10,
    });

    const token = signToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        selectedCharity: user.selectedCharity,
        charityContributionPct: user.charityContributionPct,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Get subscription status
    const subscription = await Subscription.findOne({ userId: user._id, status: 'active' });

    const token = signToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        selectedCharity: user.selectedCharity,
        charityContributionPct: user.charityContributionPct,
        hasActiveSubscription: !!subscription,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// GET /api/auth/me — get current user profile
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('selectedCharity', 'name imageUrl description');
    const subscription = await Subscription.findOne({ userId: user._id });

    res.json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        selectedCharity: user.selectedCharity,
        charityContributionPct: user.charityContributionPct,
        phone: user.phone,
        country: user.country,
        createdAt: user.createdAt,
      },
      subscription: subscription
        ? {
            plan: subscription.plan,
            status: subscription.status,
            currentPeriodEnd: subscription.currentPeriodEnd,
          }
        : null,
    });
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/auth/update-profile
router.patch('/update-profile', protect, async (req, res) => {
  try {
    const { fullName, phone, country, selectedCharity, charityContributionPct } = req.body;
    const updates = {};

    if (fullName) updates.fullName = fullName;
    if (phone !== undefined) updates.phone = phone;
    if (country !== undefined) updates.country = country;
    if (selectedCharity !== undefined) updates.selectedCharity = selectedCharity;
    if (charityContributionPct !== undefined) {
      if (charityContributionPct < 10) return res.status(400).json({ message: 'Minimum charity contribution is 10%' });
      updates.charityContributionPct = charityContributionPct;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).populate('selectedCharity', 'name imageUrl');

    res.json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        selectedCharity: user.selectedCharity,
        charityContributionPct: user.charityContributionPct,
        phone: user.phone,
        country: user.country,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
