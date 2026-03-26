const mongoose = require('mongoose');

const charityEventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  eventDate: { type: Date },
  location: { type: String, trim: true },
  imageUrl: { type: String },
  isUpcoming: { type: Boolean, default: true },
});

const charitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Charity name is required'],
      unique: true,
      trim: true,
      maxlength: [150, 'Name too long'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: [200, 'Short description too long'],
    },
    imageUrl: { type: String, default: null },
    website: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/, 'Please enter a valid URL'],
      default: null,
    },
    category: {
      type: String,
      enum: ['environment', 'health', 'education', 'community', 'sports', 'other'],
      default: 'other',
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    registrationNumber: {
      type: String,
      trim: true,
      default: null,
    },
    totalContributions: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSubscribers: {
      type: Number,
      default: 0,
      min: 0,
    },
    events: [charityEventSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// ── Text search index ──────────────────────────────────────────────────────────
charitySchema.index(
  { name: 'text', description: 'text', shortDescription: 'text' },
  { weights: { name: 10, shortDescription: 5, description: 1 }, name: 'charity_text_search' }
);

charitySchema.index({ category: 1, featured: -1, isActive: 1 });
charitySchema.index({ featured: 1, isActive: 1 });

module.exports = mongoose.model('Charity', charitySchema);
