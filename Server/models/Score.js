const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    score: {
      type: Number,
      required: [true, 'Score is required'],
      min: [1, 'Stableford score must be at least 1'],
      max: [45, 'Stableford score cannot exceed 45'],
    },
    datePlayed: {
      type: Date,
      required: [true, 'Date played is required'],
      default: Date.now,
    },
    courseName: {
      type: String,
      trim: true,
      maxlength: [100, 'Course name too long'],
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [300, 'Notes too long'],
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true, // false = replaced by newer score in rolling 5
      index: true,
    },
    drawMonth: {
      type: String, // Format: "2026-03" — which month's draw this score contributed to
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ────────────────────────────────────────────────────────────────────
scoreSchema.index({ userId: 1, isActive: 1, datePlayed: -1 });
scoreSchema.index({ userId: 1, datePlayed: -1 });
scoreSchema.index({ drawMonth: 1, userId: 1 });

module.exports = mongoose.model('Score', scoreSchema);
