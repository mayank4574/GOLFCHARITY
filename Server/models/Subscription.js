const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ['monthly', 'yearly'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'past_due', 'trialing'],
      default: 'inactive',
      index: true,
    },
    // Stripe fields
    stripeCustomerId: { type: String, default: null, index: true },
    stripeSubscriptionId: { type: String, default: null, index: true },
    stripePaymentIntentId: { type: String, default: null },

    // UPI / Manual payment fields
    paymentMethod: {
      type: String,
      enum: ['stripe', 'upi', 'qr', 'manual'],
      default: 'stripe',
    },
    upiTransactionId: { type: String, default: null },
    upiSenderVpa: { type: String, default: null }, // e.g. user@okicici
    manualPaymentNote: { type: String, default: null },
    manualPaymentVerified: { type: Boolean, default: false },
    manualPaymentVerifiedAt: { type: Date, default: null },
    manualPaymentVerifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // Period tracking
    currentPeriodStart: { type: Date, default: null },
    currentPeriodEnd: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },

    // Amount paid
    amountPaid: { type: Number, default: 0 }, // in pence/paisa
    currency: { type: String, default: 'gbp' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// ── Compound indexes ───────────────────────────────────────────────────────────
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ userId: 1, createdAt: -1 });
subscriptionSchema.index({ status: 1, currentPeriodEnd: 1 });

// ── Virtual: is currently active ──────────────────────────────────────────────
subscriptionSchema.virtual('isCurrentlyActive').get(function () {
  if (this.status !== 'active') return false;
  if (!this.currentPeriodEnd) return true;
  return new Date() < this.currentPeriodEnd;
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
