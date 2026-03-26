require('dotenv').config();
const connectDB = require('./db');
const User = require('./models/User');
const Charity = require('./models/Charity');
const Subscription = require('./models/Subscription');

const seed = async () => {
  await connectDB();

  console.log('🌱 Seeding database...');

  // ── Create Admin ──────────────────────────────────────────────────────────
  const existingAdmin = await User.findOne({ email: 'admin@golfcharity.com' });
  if (!existingAdmin) {
    await User.create({
      fullName: 'Platform Admin',
      email: 'admin@golfcharity.com',
      password: 'Admin@123456',
      role: 'admin',
    });
    console.log('✅ Admin created: admin@golfcharity.com / Admin@123456');
  } else {
    console.log('ℹ️  Admin already exists');
  }

  // ── Create Sample Charities ───────────────────────────────────────────────
  const charities = [
    {
      name: 'GreenLinks Foundation',
      description:
        'We partner with golf courses worldwide to restore native habitats, plant trees, and protect biodiversity on and around fairways. Every match played funds ecological restoration.',
      shortDescription: 'Restoring habitats on golf courses worldwide.',
      imageUrl: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=800',
      website: 'https://greenlinksfoundation.org',
      category: 'environment',
      featured: true,
      events: [
        {
          title: 'Charity Golf Day 2026',
          description: 'Annual charity golf day at Wentworth Club in aid of habitat restoration.',
          eventDate: new Date('2026-06-15'),
          location: 'Wentworth Club, Surrey, UK',
        },
      ],
    },
    {
      name: 'Par for Health',
      description:
        'Using golf as therapy and physical rehabilitation for veterans, people with disabilities, and those recovering from serious illness. We fund adaptive golf equipment and professional coaching.',
      shortDescription: 'Golf therapy for veterans and people in recovery.',
      imageUrl: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800',
      website: 'https://parforhealth.org',
      category: 'health',
      featured: true,
      events: [
        {
          title: 'Veterans Open Day',
          description: 'Free golf day for veterans with adaptive coaching sessions.',
          eventDate: new Date('2026-09-10'),
          location: 'Royal Birkdale, Lancashire',
        },
      ],
    },
    {
      name: 'Junior Fairways',
      description:
        'We give inner-city youth access to golf coaching, equipment, and competition. Our programmes have produced 3 national junior champions and countless scholarship recipients.',
      shortDescription: 'Bringing golf to inner-city youth communities.',
      imageUrl: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800',
      website: 'https://juniorfairways.org',
      category: 'education',
      featured: false,
      events: [
        {
          title: 'Junior Championship 2026',
          description: 'Annual junior golf championship open to our programme graduates.',
          eventDate: new Date('2026-08-20'),
          location: 'St Andrews, Scotland',
        },
      ],
    },
    {
      name: 'Ocean Links Initiative',
      description:
        'Coastal golf courses are on the frontline of climate change. We work with course owners to implement sustainable drainage, reduce chemical use, and protect coastal ecosystems.',
      shortDescription: 'Protecting coastal ecosystems around golf courses.',
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
      website: 'https://oceanlinks.io',
      category: 'environment',
      featured: false,
    },
    {
      name: 'Community Links',
      description:
        'We build miniature golf courses in community parks and hospitals to bring joy and physical activity to those who need it most — from children in hospital to elderly residents in care homes.',
      shortDescription: 'Community mini-golf courses in parks and hospitals.',
      imageUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800',
      category: 'community',
      featured: false,
    },
  ];

  for (const c of charities) {
    const existing = await Charity.findOne({ name: c.name });
    if (!existing) {
      await Charity.create(c);
      console.log(`✅ Charity created: ${c.name}`);
    }
  }

  // ── Create Test User ──────────────────────────────────────────────────────
  const existingUser = await User.findOne({ email: 'test@golfcharity.com' });
  if (!existingUser) {
    const firstCharity = await Charity.findOne({ featured: true });
    const testUser = await User.create({
      fullName: 'Test Golfer',
      email: 'test@golfcharity.com',
      password: 'Test@123456',
      role: 'user',
      selectedCharity: firstCharity?._id || null,
      charityContributionPct: 10,
    });

    // Give test user an active subscription
    await Subscription.create({
      userId: testUser._id,
      plan: 'monthly',
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    console.log('✅ Test user created: test@golfcharity.com / Test@123456 (has active subscription)');
  } else {
    console.log('ℹ️  Test user already exists');
  }

  console.log('\n📋 Seed complete!');
  console.log('   Admin: admin@golfcharity.com / Admin@123456');
  console.log('   User:  test@golfcharity.com / Test@123456');
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
