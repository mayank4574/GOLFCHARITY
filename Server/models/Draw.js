const mongoose = require('mongoose');

const prizeSchema = new mongoose.Schema({
  tier: { type: Number, enum: [3, 4, 5], required: true }, // 3=three-match, 4=four-match, 5=jackpot
  percentage: { type: Number, required: true },
  amount: { type: Number, default: 0 },
  winnerCount: { type: Number, default: 0 },
  amountPerWinner: { type: Number, default: 0 },
});

const drawSchema = new mongoose.Schema(
  {
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
      min: 2024,
    },
    monthLabel: {
      type: String, // e.g. "March 2026"
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'simulated', 'published', 'cancelled'],
      default: 'pending',
      index: true,
    },
    drawType: {
      type: String,
      enum: ['random', 'algorithmic'],
      default: 'random',
    },

    // The 5 winning numbers drawn
    winningNumbers: {
      type: [Number],
      default: [],
      validate: {
        validator: (v) => v.length === 0 || v.length === 5,
        message: 'Winning numbers must be exactly 5 or empty',
      },
    },

    // Prize pool
    prizePool: { type: Number, default: 0, min: 0 },
    rolloverAmount: { type: Number, default: 0, min: 0 }, // carried from last month
    prizes: [prizeSchema],

    // Participation
    activeSubscribers: { type: Number, default: 0 },
    totalEntries: { type: Number, default: 0 },

    // Charity contributions this month
    totalCharityAmount: { type: Number, default: 0 },

    // Admin who ran the draw
    runBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    publishedAt: { type: Date, default: null },
    notes: { type: String, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// ── Compound unique index: one draw per month/year ────────────────────────────
drawSchema.index({ month: 1, year: 1 }, { unique: true });
drawSchema.index({ status: 1, year: -1, month: -1 });
drawSchema.index({ publishedAt: -1 });

module.exports = mongoose.model('Draw', drawSchema);
