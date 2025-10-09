const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// ========================================
// GET ALL TRANSACTIONS (Protected)
// ========================================
router.get('/', protect, async (req, res) => {
  try {
    const email = req.userEmail;
    
    console.log('✅ Fetching transactions for:', email);
    
    const transactions = await Transaction.find({ email }).sort({ date: -1 });
    
    res.json({ 
      success: true, 
      data: transactions 
    });
  } catch (error) {
    console.error('❌ Get transactions error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// ========================================
// CREATE TRANSACTION (Protected)
// ========================================
router.post('/', protect, async (req, res) => {
  try {
    const email = req.userEmail;
    const { type, category, amount, description, date } = req.body;

    console.log('✅ Creating transaction for:', email);

    // Validate type
    if (!['income', 'expense', 'savings'].includes(type)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid transaction type. Must be income, expense, or savings.' 
      });
    }

    // Get user to check premium status
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check transaction limit for free users
    if (!user.isPremium) {
      const now = new Date();
      const lastReset = new Date(user.lastTransactionResetDate || now);
      
      // Reset counter if new month
      if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
        user.monthlyTransactionCount = 0;
        user.lastTransactionResetDate = now;
        await user.save();
      }
      
      const currentCount = user.monthlyTransactionCount || 0;
      
      if (currentCount >= 10) {
        return res.status(403).json({
          success: false,
          message: 'Monthly transaction limit reached (10/10). Upgrade to Premium!',
          isPremiumRequired: true,
          usageInfo: {
            used: currentCount,
            limit: 10,
            remaining: 0
          }
        });
      }
    }

    // Create transaction
    const transaction = new Transaction({
      email,
      type,
      category,
      amount,
      description,
      date: date || new Date()
    });

    await transaction.save();

    // Increment counter for free users
    if (!user.isPremium) {
      user.monthlyTransactionCount = (user.monthlyTransactionCount || 0) + 1;
      if (!user.lastTransactionResetDate) {
        user.lastTransactionResetDate = new Date();
      }
      await user.save();
    }

    res.status(201).json({ 
      success: true, 
      message: 'Transaction created successfully!',
      data: transaction,
      usageInfo: !user.isPremium ? {
        used: user.monthlyTransactionCount,
        limit: 10,
        remaining: 10 - user.monthlyTransactionCount
      } : null
    });
  } catch (error) {
    console.error('❌ Create transaction error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
});

// ========================================
// UPDATE TRANSACTION (Protected)
// ========================================
router.put('/:id', protect, async (req, res) => {
  try {
    const email = req.userEmail;
    const transaction = await Transaction.findOne({ 
      _id: req.params.id, 
      email: email
    });

    if (!transaction) {
      return res.status(404).json({ 
        success: false, 
        message: 'Transaction not found or unauthorized' 
      });
    }

    // Update fields
    const { type, category, amount, description, date } = req.body;
    
    if (type) transaction.type = type;
    if (category) transaction.category = category;
    if (amount) transaction.amount = amount;
    if (description) transaction.description = description;
    if (date) transaction.date = date;

    await transaction.save();

    res.json({ 
      success: true, 
      data: transaction 
    });
  } catch (error) {
    console.error('❌ Update transaction error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// ========================================
// DELETE TRANSACTION (Protected)
// ========================================
router.delete('/:id', protect, async (req, res) => {
  try {
    const email = req.userEmail;
    const { id } = req.params;
    
    console.log('✅ Deleting transaction:', id, 'for:', email);
    
    const transaction = await Transaction.findOne({ 
      _id: id, 
      email: email
    });

    if (!transaction) {
      return res.status(404).json({ 
        success: false, 
        message: 'Transaction not found or unauthorized' 
      });
    }

    await transaction.deleteOne();

    res.json({ 
      success: true, 
      message: 'Transaction deleted successfully!' 
    });
  } catch (error) {
    console.error('❌ Delete transaction error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
});

// ========================================
// DELETE ALL TRANSACTIONS (Protected)
// ========================================
router.delete('/all/:email', protect, async (req, res) => {
  try {
    const email = req.userEmail;
    
    // Only allow users to delete their own transactions
    if (req.params.email !== email) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized to delete other users transactions' 
      });
    }

    console.log('⚠️ Deleting all transactions for:', email);

    const result = await Transaction.deleteMany({ email });

    res.json({ 
      success: true, 
      message: `Deleted ${result.deletedCount} transactions` 
    });
  } catch (error) {
    console.error('❌ Delete all error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;
