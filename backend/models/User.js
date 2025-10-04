const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // PREMIUM FIELDS (subscription support)
  isPremium: { type: Boolean, default: false },
  premiumStartDate: { type: Date },
  premiumEndDate: { type: Date },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  
  // 🆕 TRANSACTION LIMIT TRACKING (for free users)
  monthlyTransactionCount: { type: Number, default: 0 },
  lastTransactionResetDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
