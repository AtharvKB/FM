const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // PREMIUM FIELDS (added for subscription support)
  isPremium: { type: Boolean, default: false },
  premiumStartDate: { type: Date },
  premiumEndDate: { type: Date },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
