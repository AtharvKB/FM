const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  email: { type: String, required: true },
  type: { 
    type: String, 
    required: true, 
    enum: ['income', 'expense', 'savings'] // Added 'savings'
  },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
