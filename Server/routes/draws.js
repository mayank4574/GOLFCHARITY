const express = require('express');
const router = express.Router();
const Draw = require('../models/Draw');
const DrawResult = require('../models/DrawResult');
const Score = require('../models/Score');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// ─── Helper: Generate random draw numbers ─────────────────────────────────────
function generateRandomNumbers(count = 5, min = 1, max = 45) {
  const nums = new Set();
  while (nums.size < count) {
    nums.add(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return Array.from(nums).sort((a, b) => a - b);
}

// ─── Helper: Algorithmic draw (weighted by score frequency) ───────────────────
async function generateAlgorithmicNumbers() {
  // Get all scores from active subscribers
  const activeSubs = await Subscription.find({ status: 'active' }).select('userId');
  const userIds = activeSubs.map((s) => s.userId);
  const allScores = await Score.find({ userId: { $in: userIds } });

  // Count frequency of each score value
  const freq = {};
  allScores.forEach((s) => {
    freq[s.score] = (freq[s.score] || 0) + 1;
  });

  if (Object.keys(freq).length < 5) {
    // Not enough data — fall back to random
    return generateRandomNumbers();
  }

  // Weight: less frequent scores have higher weight (rarer = more interesting)
  const scores = Object.keys(freq).map(Number);
  const maxFreq = Math.max(...Object.values(freq));
  const weights = scores.map((s) => maxFreq - freq[s] + 1);
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  const selected = new Set();
  let attempts = 0;
  while (selected.size < 5 && attempts < 1000) {
    let rand = Math.random() * totalWeight;
    for (let i = 0; i < scores.length; i++) {
      rand -= weights[i];
      if (rand <= 0 && !selected.has(scores[i])) {
        selected.add(scores[i]);
        break;
      }
    }
    attempts++;
  }

  // Fallback if not enough unique selected
  if (selected.size < 5) return generateRandomNumbers();
  return Array.from(selected).sort((a, b) => a - b);
}

// ─── Helper: Check user scores for matches ────────────────────────────────────
function countMatches(userScores, winningNumbers) {
  const winSet = new Set(winningNumbers);
  const matched = userScores.filter((s) => winSet.has(s));
  return { count: matched.length, matched };
}

// ─── Helper: Calculate prize pool from subscriptions ─────────────────────────
async function calculatePrizePool(rolloverAmount = 0) {
  const monthlyPrice = 29; // £29/month
  const yearlyMonthlyEquivalent = Math.round(249 / 12); // £249/year → ~£20.75/month
  const prizePoolPct = 0.5; // 50% goes to prize pool (rest: charity + ops)

  const monthlySubs = await Subscription.countDocuments({ plan: 'monthly', status: 'active' });
  const yearlySubs = await Subscription.countDocuments({ plan: 'yearly', status: 'active' });

  const totalMonthlyRevenue = monthlySubs * monthlyPrice + yearlySubs * yearlyMonthlyEquivalent;
  const prizePool = Math.floor(totalMonthlyRevenue * prizePoolPct) + rolloverAmount;

  return {
    prizePool,
    jackpot: Math.floor(prizePool * 0.4),     // 40%
    fourMatch: Math.floor(prizePool * 0.35),   // 35%
    threeMatch: Math.floor(prizePool * 0.25),  // 25%
  };
}

// ─── GET /api/draws — list past published draws ───────────────────────────────
router.get('/', async (req, res) => {
  try {
    const draws = await Draw.find({ status: 'published' }).sort({ year: -1, month: -1 }).limit(12);
    res.json({ draws });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── GET /api/draws/current — current or upcoming draw info ──────────────────
router.get('/current', async (req, res) => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    let draw = await Draw.findOne({ month, year });
    const poolData = await calculatePrizePool();

    if (!draw) {
      // Return upcoming draw info without creating it yet
      return res.json({
        draw: null,
        month, year,
        prizePool: poolData.prizePool,
        jackpot: poolData.jackpot,
        fourMatch: poolData.fourMatch,
        threeMatch: poolData.threeMatch,
        activeSubscribers: await Subscription.countDocuments({ status: 'active' }),
      });
    }

    res.json({
      draw,
      prizePool: poolData.prizePool,
      jackpot: poolData.jackpot,
      fourMatch: poolData.fourMatch,
      threeMatch: poolData.threeMatch,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── POST /api/draws/simulate — [Admin] simulate draw ────────────────────────
router.post('/simulate', protect, adminOnly, async (req, res) => {
  try {
    const { month, year, drawType = 'random' } = req.body;
    const m = month || new Date().getMonth() + 1;
    const y = year || new Date().getFullYear();

    // Calculate prize pool
    const poolData = await calculatePrizePool();

    // Generate winning numbers
    const winningNumbers =
      drawType === 'algorithmic'
        ? await generateAlgorithmicNumbers()
        : generateRandomNumbers();

    // Check all active subscribers for matches
    const activeSubs = await Subscription.find({ status: 'active' }).select('userId');
    const userIds = activeSubs.map((s) => s.userId);

    const results = { five: [], four: [], three: [] };

    for (const userId of userIds) {
      const userScores = await Score.find({ userId }).select('score');
      const scoreValues = userScores.map((s) => s.score);
      const { count, matched } = countMatches(scoreValues, winningNumbers);

      if (count >= 3) {
        const tier = count >= 5 ? 'five' : count === 4 ? 'four' : 'three';
        results[tier].push({ userId, matchedNumbers: matched, matchType: count });
      }
    }

    // Calculate prize per winner in each tier
    const fiveWinners = results.five.length;
    const fourWinners = results.four.length;
    const threeWinners = results.three.length;

    const prizePerFive = fiveWinners > 0 ? Math.floor(poolData.jackpot / fiveWinners) : 0;
    const prizePerFour = fourWinners > 0 ? Math.floor(poolData.fourMatch / fourWinners) : 0;
    const prizePerThree = threeWinners > 0 ? Math.floor(poolData.threeMatch / threeWinners) : 0;

    res.json({
      simulation: true,
      month: m,
      year: y,
      drawType,
      winningNumbers,
      prizePool: poolData.prizePool,
      jackpot: poolData.jackpot,
      jackpotRollover: fiveWinners === 0,
      winners: {
        fiveMatch: results.five.map((r) => ({ ...r, prizeAmount: prizePerFive })),
        fourMatch: results.four.map((r) => ({ ...r, prizeAmount: prizePerFour })),
        threeMatch: results.three.map((r) => ({ ...r, prizeAmount: prizePerThree })),
      },
      activeSubscribers: userIds.length,
    });
  } catch (err) {
    console.error('Simulate error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── POST /api/draws/publish — [Admin] publish official draw ──────────────────
router.post('/publish', protect, adminOnly, async (req, res) => {
  try {
    const { month, year, drawType = 'random', winningNumbers: providedNumbers } = req.body;
    const m = month || new Date().getMonth() + 1;
    const y = year || new Date().getFullYear();

    // Check if already published
    const existing = await Draw.findOne({ month: m, year: y, status: 'published' });
    if (existing) {
      return res.status(400).json({ message: 'Draw already published for this month' });
    }

    // Check for rollover from previous month
    const prevMonth = m === 1 ? 12 : m - 1;
    const prevYear = m === 1 ? y - 1 : y;
    const previousDraw = await Draw.findOne({ month: prevMonth, year: prevYear, jackpotRolledOver: true });
    const rolloverAmount = previousDraw ? previousDraw.jackpotAmount : 0;

    const poolData = await calculatePrizePool(rolloverAmount);
    const jkp = poolData.jackpot + rolloverAmount;

    // Generate numbers
    const winningNumbers =
      providedNumbers && providedNumbers.length === 5
        ? providedNumbers
        : drawType === 'algorithmic'
        ? await generateAlgorithmicNumbers()
        : generateRandomNumbers();

    // Active subscribers
    const activeSubs = await Subscription.find({ status: 'active' }).select('userId');
    const userIds = activeSubs.map((s) => s.userId);

    const results = { five: [], four: [], three: [] };

    for (const userId of userIds) {
      const userScores = await Score.find({ userId }).select('score');
      const scoreValues = userScores.map((s) => s.score);
      const { count, matched } = countMatches(scoreValues, winningNumbers);
      if (count >= 3) {
        const tier = count >= 5 ? 'five' : count === 4 ? 'four' : 'three';
        results[tier].push({ userId, matchedNumbers: matched, matchType: count });
      }
    }

    const fiveWinners = results.five.length;
    const jackpotWon = fiveWinners > 0;
    const prizePerFive = jackpotWon ? Math.floor(jkp / fiveWinners) : 0;
    const prizePerFour = results.four.length > 0 ? Math.floor(poolData.fourMatch / results.four.length) : 0;
    const prizePerThree = results.three.length > 0 ? Math.floor(poolData.threeMatch / results.three.length) : 0;

    // Create/Update draw document
    const draw = await Draw.findOneAndUpdate(
      { month: m, year: y },
      {
        month: m, year: y, drawType,
        status: 'published',
        winningNumbers,
        totalPrizePool: poolData.prizePool + rolloverAmount,
        jackpotAmount: jkp,
        fourMatchAmount: poolData.fourMatch,
        threeMatchAmount: poolData.threeMatch,
        jackpotRolledOver: !jackpotWon,
        rolledOverFromDrawId: previousDraw?._id || null,
        activeSubscribers: userIds.length,
        publishedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Create DrawResult records for all winners
    const allWinners = [
      ...results.five.map((r) => ({ ...r, prizeAmount: prizePerFive, matchType: 5 })),
      ...results.four.map((r) => ({ ...r, prizeAmount: prizePerFour, matchType: 4 })),
      ...results.three.map((r) => ({ ...r, prizeAmount: prizePerThree, matchType: 3 })),
    ];

    for (const winner of allWinners) {
      await DrawResult.findOneAndUpdate(
        { drawId: draw._id, userId: winner.userId },
        {
          drawId: draw._id,
          userId: winner.userId,
          matchType: winner.matchType,
          matchedNumbers: winner.matchedNumbers,
          prizeAmount: winner.prizeAmount,
          verificationStatus: 'pending',
        },
        { upsert: true }
      );
    }

    res.json({
      draw,
      winners: {
        fiveMatch: results.five.map((r) => ({ ...r, prizeAmount: prizePerFive })),
        fourMatch: results.four.map((r) => ({ ...r, prizeAmount: prizePerFour })),
        threeMatch: results.three.map((r) => ({ ...r, prizeAmount: prizePerThree })),
      },
      jackpotRolledOver: !jackpotWon,
    });
  } catch (err) {
    console.error('Publish draw error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── GET /api/draws/:id/winners — winners of a specific draw ─────────────────
router.get('/:id/winners', async (req, res) => {
  try {
    const winners = await DrawResult.find({ drawId: req.params.id })
      .populate('userId', 'fullName email')
      .sort({ matchType: -1 });
    res.json({ winners });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
