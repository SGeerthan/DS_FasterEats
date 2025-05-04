const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  discountAmount: {
    type: Number,
    required: true
  },
  valid: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 604800 // Coupon will expire after 7 days (optional)
  }
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
