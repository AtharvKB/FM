const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true 
  },

  // ✅ FORGOT PASSWORD FIELDS (Security Question)
  securityQuestion: {
    type: String,
    default: 'What is your favorite color?'
  },
  securityAnswer: {
    type: String,
    lowercase: true,
    trim: true
  },

  // PREMIUM FIELDS (subscription support)
  isPremium: { 
    type: Boolean, 
    default: false 
  },
  premiumStartDate: { 
    type: Date 
  },
  premiumEndDate: { 
    type: Date 
  },
  razorpayOrderId: { 
    type: String 
  },
  razorpayPaymentId: { 
    type: String 
  },
  
  // TRANSACTION LIMIT TRACKING (for free users)
  monthlyTransactionCount: { 
    type: Number, 
    default: 0 
  },
  lastTransactionResetDate: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('User', userSchema);
