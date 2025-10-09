const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true,
    index: true, // ✅ ADD INDEX for faster queries by email
    lowercase: true, // ✅ Store emails in lowercase
    trim: true // ✅ Remove whitespace
  },
  type: { 
    type: String, 
    required: true, 
    enum: ['income', 'expense', 'savings'] // ✅ Already has savings - Good!
  },
  amount: { 
    type: Number, 
    required: true,
    min: [0, 'Amount must be positive'] // ✅ ADD validation for positive amounts
  },
  description: { 
    type: String, 
    required: true,
    trim: true // ✅ Remove extra whitespace
  },
  category: { 
    type: String, 
    required: true,
    trim: true // ✅ Remove extra whitespace
  },
  date: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  timestamps: true // ✅ Already has this - Good!
});

// ✅ ADD COMPOUND INDEX for better query performance
transactionSchema.index({ email: 1, date: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
