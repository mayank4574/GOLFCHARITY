require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./db');

const app = express();

// ─── Stripe Webhook must use raw body parser (BEFORE json middleware) ─────────
const subscriptionRoutes = require('./routes/subscriptions');
app.use('/api/subscriptions/webhook', express.raw({ type: 'application/json' }));

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://golfcharity-five.vercel.app",
    /\.vercel\.app$/
  ],
  credentials: true
}));
app.use(express.json());

// ─── Static uploads folder ───────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/scores', require('./routes/scores'));
app.use('/api/charities', require('./routes/charities'));
app.use('/api/draws', require('./routes/draws'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/winners', require('./routes/winners'));

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ─── Global error handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

// ─── Auto-seed helper (runs once on startup, safe to re-run) ─────────────────
async function autoSeed() {
  try {
    const User = require('./models/User');
    const Charity = require('./models/Charity');
    const Subscription = require('./models/Subscription');

    // Only seed if no users exist
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log(`ℹ️  Database already has ${userCount} user(s), skipping seed.`);
      return;
    }

    console.log('🌱 No data found — auto-seeding initial data...');

    // Admin
    await User.create({
      fullName: 'Platform Admin',
      email: 'admin@golfcharity.com',
      password: 'Admin@123456',
      role: 'admin',
    });

    // Charities
    const charities = [
      {
        name: 'GreenLinks Foundation',
        description: 'We partner with golf courses worldwide to restore native habitats, plant trees, and protect biodiversity on and around fairways.',
        shortDescription: 'Restoring habitats on golf courses worldwide.',
        imageUrl: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=800',
        website: 'https://greenlinksfoundation.org',
        category: 'environment',
        featured: true,
        events: [{ title: 'Charity Golf Day 2026', description: 'Annual charity golf day at Wentworth Club.', eventDate: new Date('2026-06-15'), location: 'Wentworth Club, Surrey, UK' }],
      },
      {
        name: 'Par for Health',
        description: 'Using golf as therapy for veterans, people with disabilities, and those recovering from serious illness.',
        shortDescription: 'Golf therapy for veterans and people in recovery.',
        imageUrl: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800',
        website: 'https://parforhealth.org',
        category: 'health',
        featured: true,
        events: [{ title: 'Veterans Open Day', description: 'Free golf day for veterans with adaptive coaching.', eventDate: new Date('2026-09-10'), location: 'Royal Birkdale, Lancashire' }],
      },
      {
        name: 'Junior Fairways',
        description: 'We give inner-city youth access to golf coaching, equipment, and competition.',
        shortDescription: 'Bringing golf to inner-city youth communities.',
        imageUrl: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800',
        website: 'https://juniorfairways.org',
        category: 'education',
        featured: false,
      },
      {
        name: 'Ocean Links Initiative',
        description: 'Coastal golf courses are on the frontline of climate change. We protect coastal ecosystems.',
        shortDescription: 'Protecting coastal ecosystems around golf courses.',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
        category: 'environment',
        featured: false,
      },
      {
        name: 'Community Links',
        description: 'We build miniature golf courses in community parks and hospitals.',
        shortDescription: 'Community mini-golf courses in parks and hospitals.',
        imageUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800',
        category: 'community',
        featured: false,
      },
    ];

    const createdCharities = await Charity.insertMany(charities);

    // Test user with active subscription
    const testUser = await User.create({
      fullName: 'Test Golfer',
      email: 'test@golfcharity.com',
      password: 'Test@123456',
      role: 'user',
      selectedCharity: createdCharities[0]._id,
      charityContributionPct: 10,
    });

    await Subscription.create({
      userId: testUser._id,
      plan: 'monthly',
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    console.log('');
    console.log('✅ Auto-seed complete! Default accounts created:');
    console.log('   👤 Admin  : admin@golfcharity.com  / Admin@123456');
    console.log('   👤 User   : test@golfcharity.com   / Test@123456  (active subscription)');
    console.log('   💚 5 charities created');
    console.log('');
  } catch (err) {
    console.error('Auto-seed error:', err.message);
  }
}

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  autoSeed();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
  });
});
