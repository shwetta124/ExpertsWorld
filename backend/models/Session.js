const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true },
  expert: { type: mongoose.Schema.Types.ObjectId, ref: 'Expert', required: true },

  topic:    { type: String, required: true },
  amount:   { type: Number, required: true },
  duration: { type: Number, default: 0 },  // minutes

  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'active', 'completed', 'cancelled'],
    default: 'pending',
  },

  // Payment
  paymentId:    { type: String },  // Razorpay payment ID
  orderId:      { type: String },  // Razorpay order ID
  isPaid:       { type: Boolean, default: false },

  // Rating after session
  userRating:   { type: Number, min: 1, max: 5 },
  userReview:   { type: String },

  // Timestamps
  requestedAt:  { type: Date, default: Date.now },
  acceptedAt:   Date,
  startedAt:    Date,
  completedAt:  Date,

}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);