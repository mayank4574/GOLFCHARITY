const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Score = require('../models/Score');
const Charity = require('../models/Charity');
const Draw = require('../models/Draw');
const DrawResult = require('../models/DrawResult');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes require auth + admin role
router.use(protect, adminOnly);

// ─── GET /api/admin/users — list all users with subscription info ─────────────
router.get('/users', async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .populate('selectedCharity', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Attach subscription status to each user
    const userIds = users.map((u) => u._id);
    const subs = await Subscription.find({ userId: { $in: userIds } });
    const subMap = {};
    subs.forEach((s) => { subMap[s.userId.toString()] = s; });

    const enriched = users.map((u) => ({
      ...u.toObject(),
      subscription: subMap[u._id.toString()] || null,
    }));

    res.json({ users: enriched, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── GET /api/admin/users/:id — single user detail ───────────────────────────
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('selectedCharity', 'name imageUrl');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const subscription = await Subscription.findOne({ userId: user._id });
    const scores = await Score.find({ userId: user._id }).sort({ scoreDate: -1 }).limit(5);
    const wins = await DrawResult.find({ userId: user._id })
      .populate('drawId', 'month year winningNumbers')
      .sort({ createdAt: -1 });

    res.json({ user, subscription, scores, wins });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── PATCH /api/admin/users/:id — edit user ────────────────────────────────
router.patch('/users/:id', async (req, res) => {
  try {
    const { fullName, email, role, selectedCharity, charityContributionPct } = req.body;
    const updates = {};
    if (fullName) updates.fullName = fullName;
    if (email) updates.email = email;
    if (role) updates.role = role;
    if (selectedCharity !== undefined) updates.selectedCharity = selectedCharity;
    if (charityContributionPct !== undefined) updates.charityContributionPct = charityContributionPct;

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── PATCH /api/admin/users/:id/scores/:scoreId — edit user score ─────────────
router.patch('/users/:id/scores/:scoreId', async (req, res) => {
  try {
    const { score, scoreDate } = req.body;
    const updates = {};
    if (score !== undefined) {
      if (score < 1 || score > 45) return res.status(400).json({ message: 'Score must be 1–45' });
      updates.score = score;
    }
    if (scoreDate) updates.scoreDate = new Date(scoreDate);

    const updated = await Score.findOneAndUpdate(
      { _id: req.params.scoreId, userId: req.params.id },
      updates,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Score not found' });
    res.json({ score: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── DELETE /api/admin/users/:id — delete user ────────────────────────────────
router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Subscription.deleteMany({ userId: req.params.id });
    await Score.deleteMany({ userId: req.params.id });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── PATCH /api/admin/winners/:id/verify — approve or reject winner ──────────
router.patch('/winners/:id/verify', async (req, res) => {
  try {
    const { action, adminNote } = req.body; // action: 'approve' | 'reject'
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Action must be approve or reject' });
    }

    const result = await DrawResult.findByIdAndUpdate(
      req.params.id,
      {
        verificationStatus: action === 'approve' ? 'verified' : 'rejected',
        adminNote: adminNote || '',
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
      },
      { new: true }
    ).populate('userId', 'fullName email');

    if (!result) return res.status(404).json({ message: 'Winner record not found' });
    res.json({ result });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── PATCH /api/admin/winners/:id/payout — mark winner as paid ───────────────
router.patch('/winners/:id/payout', async (req, res) => {
  try {
    const result = await DrawResult.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: 'paid', paidAt: new Date() },
      { new: true }
    ).populate('userId', 'fullName email');

    if (!result) return res.status(404).json({ message: 'Winner record not found' });
    res.json({ result });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── GET /api/admin/winners — all winners list ────────────────────────────────
router.get('/winners', async (req, res) => {
  try {
    const { status, drawId } = req.query;
    const filter = {};
    if (status) filter.verificationStatus = status;
    if (drawId) filter.drawId = drawId;

    const winners = await DrawResult.find(filter)
      .populate('userId', 'fullName email')
      .populate('drawId', 'month year winningNumbers')
      .sort({ createdAt: -1 });

    res.json({ winners });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── GET /api/admin/reports — analytics dashboard ────────────────────────────
router.get('/reports', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
    const monthlySubscriptions = await Subscription.countDocuments({ plan: 'monthly', status: 'active' });
    const yearlySubscriptions = await Subscription.countDocuments({ plan: 'yearly', status: 'active' });
    const totalCharities = await Charity.countDocuments();
    const totalDraws = await Draw.countDocuments({ status: 'published' });

    // Prize pool (simplified estimate)
    const monthlyRevenue = monthlySubscriptions * 29 + yearlySubscriptions * Math.round(249 / 12);
    const estimatedPrizePool = Math.floor(monthlyRevenue * 0.5);
    const estimatedCharityFund = Math.floor(monthlyRevenue * 0.1); // at minimum 10%

    // Recent winners
    const recentWinners = await DrawResult.find()
      .populate('userId', 'fullName')
      .populate('drawId', 'month year')
      .sort({ createdAt: -1 })
      .limit(5);

    // Draws by month (last 6)
    const recentDraws = await Draw.find({ status: 'published' })
      .sort({ year: -1, month: -1 })
      .limit(6);

    res.json({
      totalUsers,
      totalAdmins,
      activeSubscriptions,
      monthlySubscriptions,
      yearlySubscriptions,
      totalCharities,
      totalDraws,
      estimatedPrizePool,
      estimatedCharityFund,
      monthlyRevenue,
      recentWinners,
      recentDraws,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
