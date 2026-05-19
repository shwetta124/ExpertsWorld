const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: String,
  rating: { type: Number, required: true, min: 1, max: 5 },
  text:   { type: String, required: true },
}, { timestamps: true });

const expertSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true,
  },

  // Profile
  name:       { type: String, required: true },
  role:       { type: String, required: true },   // e.g. "MERN Stack Developer"
  about:      { type: String, required: true },
  location:   { type: String, default: '' },
  languages:  [{ type: String }],
  avatar:     { type: String, default: '' },

  // Expertise
  category: {
    type: String,
    enum: ['dev', 'design', 'blockchain', 'dsa', 'system', 'ai', 'other'],
    required: true,
  },
  tags: [{ type: String }],
  experience: { type: String, required: true },   // e.g. "5 years"

  // Pricing
  price: { type: Number, required: true },         // per session in INR

  // Stats
  rating:    { type: Number, default: 0 },
  reviews:   [reviewSchema],
  sessions:  { type: Number, default: 0 },
  totalEarned: { type: Number, default: 0 },

  // Status
  isOnline:  { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false },  // Admin must approve
  isActive:  { type: Boolean, default: true },

  // Documents for verification
  documents: [{
    name: String,
    url:  String,
  }],

  // Bank / payment details
  paymentDetails: {
    accountHolder: String,
    accountNumber: String,
    ifscCode:      String,
    upiId:         String,
  },

}, { timestamps: true });

// Auto-calculate average rating
expertSchema.methods.calcRating = function () {
  if (!this.reviews.length) { this.rating = 0; return; }
  const avg = this.reviews.reduce((sum, r) => sum + r.rating, 0) / this.reviews.length;
  this.rating = Math.round(avg * 10) / 10;
};

module.exports = mongoose.model('Expert', expertSchema);