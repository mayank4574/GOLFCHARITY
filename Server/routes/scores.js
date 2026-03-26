const express = require('express');
const router = express.Router();
const Score = require('../models/Score');
const { protect, requireSubscription } = require('../middleware/auth');

// GET /api/scores — get current user's last 5 scores (most recent first)
router.get('/', protect, requireSubscription, async (req, res) => {
  try {
    const scores = await Score.find({ userId: req.user._id })
      .sort({ scoreDate: -1, createdAt: -1 })
      .limit(5);
    res.json({ scores });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/scores — add a new score (rolling 5-score logic)
router.post('/', protect, requireSubscription, async (req, res) => {
  try {
    const { score, scoreDate } = req.body;

    // Validate
    if (!score || score < 1 || score > 45) {
      return res.status(400).json({ message: 'Score must be between 1 and 45 (Stableford format)' });
    }
    if (!scoreDate) {
      return res.status(400).json({ message: 'Score date is required' });
    }

    // Count existing scores
    const count = await Score.countDocuments({ userId: req.user._id });

    // If already 5 scores, delete the oldest
    if (count >= 5) {
      const oldest = await Score.find({ userId: req.user._id })
        .sort({ scoreDate: 1, createdAt: 1 })
        .limit(1);
      if (oldest.length > 0) {
        await Score.findByIdAndDelete(oldest[0]._id);
      }
    }

    // Create new score
    const newScore = await Score.create({
      userId: req.user._id,
      score: Number(score),
      scoreDate: new Date(scoreDate),
    });

    // Return all 5 scores
    const allScores = await Score.find({ userId: req.user._id })
      .sort({ scoreDate: -1, createdAt: -1 })
      .limit(5);

    res.status(201).json({ score: newScore, scores: allScores });
  } catch (err) {
    console.error('Add score error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/scores/:id — delete a specific score
router.delete('/:id', protect, requireSubscription, async (req, res) => {
  try {
    const score = await Score.findOne({ _id: req.params.id, userId: req.user._id });
    if (!score) {
      return res.status(404).json({ message: 'Score not found' });
    }
    await Score.findByIdAndDelete(req.params.id);
    res.json({ message: 'Score deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/scores/all/:userId — admin can view any user's scores
router.get('/all/:userId', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const scores = await Score.find({ userId: req.params.userId })
      .sort({ scoreDate: -1 })
      .limit(5);
    res.json({ scores });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
