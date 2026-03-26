const mongoose = require('mongoose');

const drawResultSchema = new mongoose.Schema(
  {
    drawId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Draw',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      default: null,
    },

    // What the winner matched
    matchedNumbers: { type: [Number], default: [] },
    matchCount: { type: Number, enum: [3, 4, 5], required: true },
    prizeTier: { type: String, enum: ['3-match', '4-match', '5-match'], required: true },

    // Prize amount
    prizeAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'gbp' },

    // Winner verification workflow
    status: {
      type: String,
      enum: ['pending', 'proof_submitted', 'verified', 'rejected', 'paid'],
      default: 'pending',
      index: true,
    },

    // Proof upload (screenshot of payment confirmation)
    proofUrl: { type: String, default: null },
    proofUploadedAt: { type: Date, default: null },

    // Admin verification
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    verifiedAt: { type: Date, default: null },
    verificationNote: { type: String, default: null },

    // Payment
    paidAt: { type: Date, default: null },
    paymentReference: { type: String, default: null },
    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'upi', 'stripe', 'cheque', 'other'],
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// ── Indexes ────────────────────────────────────────────────────────────────────
drawResultSchema.index({ drawId: 1, userId: 1 }, { unique: true }); // One result per user per draw
drawResultSchema.index({ userId: 1, status: 1 });
drawResultSchema.index({ drawId: 1, status: 1 });
drawResultSchema.index({ status: 1, createdAt: -1 });
drawResultSchema.index({ matchCount: -1, prizeAmount: -1 });

module.exports = mongoose.model('DrawResult', drawResultSchema);
