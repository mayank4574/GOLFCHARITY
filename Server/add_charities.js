require('dotenv').config();
const mongoose = require('mongoose');
const Charity = require('./models/Charity');
const connectDB = require('./db');

const newCharities = [
  {
    name: 'Gaia Roots',
    description: 'We focus on restoring complex ecosystems and planting native trees globally. Our community-led projects aim to combat deforestation and bring sustainable agricultural practices to recovering areas.',
    shortDescription: 'Restoring ecosystems and planting trees globally.',
    imageUrl: 'https://images.unsplash.com/photo-1497215848834-44abf6426462?w=800',
    website: 'https://gaiaroots.org',
    category: 'environment',
    featured: true,
  },
  {
    name: 'Blue Horizon',
    description: 'Dedicated to heavy-duty ocean cleanup and marine conservation. By establishing coastal networks of volunteers and ships, we extract plastic from the shores to the deep sea.',
    shortDescription: 'Ocean cleanup and marine conservation.',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    website: 'https://bluehorizon.io',
    category: 'environment',
    featured: true,
  },
  {
    name: 'Urban Lift',
    description: 'Empowering underprivileged communities in urban centers through education, job training, and infrastructure upliftment programs.',
    shortDescription: 'Empowering underprivileged communities.',
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
    website: 'https://urbanlift.org',
    category: 'community',
    featured: true,
  }
];

const run = async () => {
  await connectDB();
  for (const c of newCharities) {
    const existing = await Charity.findOne({ name: c.name });
    if (!existing) {
      await Charity.create(c);
      console.log(`✅ Added: ${c.name}`);
    } else {
      console.log(`ℹ️ Already exists: ${c.name}`);
    }
  }
  process.exit(0);
};

run().catch(console.error);
