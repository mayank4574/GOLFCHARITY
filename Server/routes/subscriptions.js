const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Initialize Stripe only if key is real
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
const stripeEnabled = STRIPE_KEY && !STRIPE_KEY.includes('your_stripe_key');
const stripe = stripeEnabled ? require('stripe')(STRIPE_KEY) : null;

// Monthly and Yearly price amounts in pence
const PLANS = {
  monthly: { amount: 2900, currency: 'gbp', interval: 'month', label: 'Monthly Plan' },
  yearly: { amount: 24900, currency: 'gbp', interval: 'year', label: 'Yearly Plan' },
};

// ─── POST /api/subscriptions/create-checkout ─────────────────────────────────
// Creates a Stripe checkout session
router.post('/create-checkout', protect, async (req, res) => {
  try {
    if (!stripeEnabled) {
      return res.status(503).json({
        message: 'Stripe is not configured. Use UPI or QR payment instead.',
      });
    }

    const { plan } = req.body;
    if (!['monthly', 'yearly'].includes(plan)) {
      return res.status(400).json({ message: 'Invalid plan. Choose monthly or yearly.' });
    }

    const planData = PLANS[plan];

    // Block if already subscribed
    const existing = await Subscription.findOne({ userId: req.user._id, status: 'active' });
    if (existing) {
      return res.status(400).json({ message: 'You already have an active subscription.' });
    }

    // Create/reuse Stripe customer
    let stripeCustomerId = null;
    const existingSub = await Subscription.findOne({ userId: req.user._id });
    if (existingSub?.stripeCustomerId) {
      stripeCustomerId = existingSub.stripeCustomerId;
    } else {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.fullName,
        metadata: { userId: req.user._id.toString() },
      });
      stripeCustomerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: planData.currency,
            unit_amount: planData.amount,
            recurring: { interval: planData.interval },
            product_data: {
              name: `GolfCharity — ${planData.label}`,
              description: 'Golf charity subscription with monthly prize draws',
            },
          },
          quantity: 1,
        },
      ],
      metadata: { userId: req.user._id.toString(), plan },
      success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`,
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('Stripe checkout error:', err.message);
    res.status(500).json({ message: 'Failed to create checkout session', error: err.message });
  }
});

// ─── POST /api/subscriptions/upi-request ─────────────────────────────────────
// Saves a UPI payment request (pending manual verification by admin)
router.post('/upi-request', protect, async (req, res) => {
  try {
    const { plan, upiSenderVpa, upiTransactionId, note } = req.body;

    if (!['monthly', 'yearly'].includes(plan)) {
      return res.status(400).json({ message: 'Invalid plan.' });
    }
    if (!upiSenderVpa || !upiSenderVpa.includes('@')) {
      return res.status(400).json({ message: 'A valid UPI VPA is required (e.g. name@upi).' });
    }

    // Check if already active
    const existing = await Subscription.findOne({ userId: req.user._id, status: 'active' });
    if (existing) {
      return res.status(400).json({ message: 'You already have an active subscription.' });
    }

    const planData = PLANS[plan];

    // Upsert: save pending UPI subscription request to Atlas
    const sub = await Subscription.findOneAndUpdate(
      { userId: req.user._id, status: { $in: ['inactive', 'cancelled'] } },
      {
        userId: req.user._id,
        plan,
        status: 'inactive', // Will be activated after admin verifies
        paymentMethod: 'upi',
        upiSenderVpa: upiSenderVpa.toLowerCase().trim(),
        upiTransactionId: upiTransactionId?.trim() || null,
        manualPaymentNote: note || `UPI payment of ${planData.label} submitted by user`,
        manualPaymentVerified: false,
        amountPaid: planData.amount,
        currency: planData.currency,
        currentPeriodStart: null,
        currentPeriodEnd: null,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`💰 UPI subscription request: ${req.user.email} → ${upiSenderVpa} (${plan})`);

    res.json({
      message: 'UPI payment request received! We will verify and activate within 2–6 hours.',
      subscriptionId: sub._id,
      referenceId: `UPI-${sub._id.toString().slice(-8).toUpperCase()}`,
    });
  } catch (err) {
    console.error('UPI request error:', err.message);
    res.status(500).json({ message: 'Server error saving UPI request.' });
  }
});

// ─── POST /api/subscriptions/webhook ─────────────────────────────────────────
// Stripe webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripeEnabled) return res.json({ received: true });

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { userId, plan } = session.metadata;
        const stripeSubId = session.subscription;
        const stripeSub = await stripe.subscriptions.retrieve(stripeSubId);

        await Subscription.findOneAndUpdate(
          { userId },
          {
            userId,
            plan,
            status: 'active',
            paymentMethod: 'stripe',
            stripeCustomerId: session.customer,
            stripeSubscriptionId: stripeSubId,
            amountPaid: PLANS[plan]?.amount || 0,
            currency: 'gbp',
            currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
          },
          { upsert: true, new: true }
        );
        console.log(`✅ Stripe webhook: subscription activated for userId ${userId}`);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const stripeSubId = invoice.subscription;
        const stripeSub = await stripe.subscriptions.retrieve(stripeSubId);
        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: stripeSubId },
          {
            status: 'active',
            currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
          }
        );
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: invoice.subscription },
          { status: 'past_due' }
        );
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: sub.id },
          { status: 'cancelled', cancelledAt: new Date() }
        );
        break;
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err.message);
  }

  res.json({ received: true });
});

// ─── GET /api/subscriptions/status ───────────────────────────────────────────
router.get('/status', protect, async (req, res) => {
  try {
    const sub = await Subscription.findOne({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    if (!sub) {
      return res.json({ subscription: null, hasActiveSubscription: false });
    }

    // Auto-expire if period ended
    if (sub.status === 'active' && sub.currentPeriodEnd && new Date() > sub.currentPeriodEnd) {
      await Subscription.findByIdAndUpdate(sub._id, { status: 'inactive' });
      sub.status = 'inactive';
    }

    res.json({
      subscription: {
        _id: sub._id,
        plan: sub.plan,
        status: sub.status,
        paymentMethod: sub.paymentMethod,
        currentPeriodEnd: sub.currentPeriodEnd,
        currentPeriodStart: sub.currentPeriodStart,
        manualPaymentVerified: sub.manualPaymentVerified,
      },
      hasActiveSubscription: sub.status === 'active',
    });
  } catch (err) {
    console.error('Status error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── POST /api/subscriptions/cancel ──────────────────────────────────────────
router.post('/cancel', protect, async (req, res) => {
  try {
    const sub = await Subscription.findOne({ userId: req.user._id, status: 'active' });
    if (!sub) return res.status(404).json({ message: 'No active subscription found.' });

    if (sub.stripeSubscriptionId && stripeEnabled) {
      await stripe.subscriptions.cancel(sub.stripeSubscriptionId);
    }

    sub.status = 'cancelled';
    sub.cancelledAt = new Date();
    await sub.save();

    res.json({ message: 'Subscription cancelled successfully.' });
  } catch (err) {
    console.error('Cancel error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
