require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri = process.env.MONGO_URI;
mongoose.connect(uri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Import Models
const User = require('./models/User');
const Transaction = require('./models/Transaction');

// Authentication Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Payment Routes
const paymentRoutes = require('./routes/payment');
app.use('/api/payment', paymentRoutes);

// Get user's financial data with transactions
app.get('/api/financial-data/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    console.log('Fetching financial data for:', email);
    
    // Get all transactions for this user
    const transactions = await Transaction.find({ email }).sort({ date: -1 });
    
    // Calculate totals from actual transactions (3 types now)
    let income = 0;
    let expenses = 0;
    let savings = 0;
    
    transactions.forEach(txn => {
      if (txn.type === 'income') {
        income += txn.amount;
      } else if (txn.type === 'expense') {
        expenses += txn.amount;
      } else if (txn.type === 'savings') {
        savings += txn.amount;
      }
    });
    
    // Total Balance = Income - Expenses - Savings
    const totalBalance = income - expenses - savings;
    const monthlyGrowth = 0;
    
    const financialData = {
      totalBalance,
      income,
      expenses,
      savings,
      monthlyGrowth
    };
    
    res.json({ 
      success: true, 
      data: financialData,
      transactions: transactions.map(t => ({
        _id: t._id.toString(),
        type: t.type,
        amount: t.amount,
        description: t.description,
        category: t.category,
        date: new Date(t.date).toLocaleDateString()
      }))
    });
  } catch (error) {
    console.error('Error fetching financial data:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 🆕 Get user's usage info (transaction limits)
app.get('/api/usage/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Reset counter if new month
    const now = new Date();
    const lastReset = new Date(user.lastTransactionResetDate || now);
    
    if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
      user.monthlyTransactionCount = 0;
      user.lastTransactionResetDate = now;
      await user.save();
    }
    
    res.json({
      success: true,
      isPremium: user.isPremium,
      usageInfo: !user.isPremium ? {
        used: user.monthlyTransactionCount || 0,
        limit: 10,
        remaining: 10 - (user.monthlyTransactionCount || 0)
      } : null
    });
  } catch (error) {
    console.error('Error fetching usage:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Save transaction with premium limit check
app.post('/api/transactions', async (req, res) => {
  try {
    const { email, type, amount, description, category } = req.body;
    
    console.log('Saving transaction:', { email, type, amount, description, category });
    
    // Validate type
    if (!['income', 'expense', 'savings'].includes(type)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid transaction type. Must be income, expense, or savings.' 
      });
    }
    
    // 🆕 Get user to check premium status and limits
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // 🆕 Check if free user has reached monthly limit
    if (!user.isPremium) {
      // Reset counter if new month
      const now = new Date();
      const lastReset = new Date(user.lastTransactionResetDate || now);
      
      if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
        user.monthlyTransactionCount = 0;
        user.lastTransactionResetDate = now;
        await user.save();
      }
      
      // Check transaction limit (10 for free users)
      const currentCount = user.monthlyTransactionCount || 0;
      
      if (currentCount >= 10) {
        return res.status(403).json({
          success: false,
          message: 'Monthly transaction limit reached (10/10). Upgrade to Premium for unlimited transactions!',
          isPremiumRequired: true,
          usageInfo: {
            used: currentCount,
            limit: 10,
            remaining: 0
          }
        });
      }
    }
    
    // Create and save transaction
    const transaction = new Transaction({
      email,
      type,
      amount,
      description,
      category
    });
    
    await transaction.save();
    
    // 🆕 Increment transaction count for free users
    if (!user.isPremium) {
      user.monthlyTransactionCount = (user.monthlyTransactionCount || 0) + 1;
      if (!user.lastTransactionResetDate) {
        user.lastTransactionResetDate = new Date();
      }
      await user.save();
    }
    
    res.json({ 
      success: true, 
      message: 'Transaction saved successfully!',
      transaction: {
        _id: transaction._id.toString(),
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        category: transaction.category,
        date: new Date(transaction.date).toLocaleDateString()
      },
      // 🆕 Send usage info
      usageInfo: !user.isPremium ? {
        used: user.monthlyTransactionCount,
        limit: 10,
        remaining: 10 - user.monthlyTransactionCount
      } : null
    });
  } catch (error) {
    console.error('Error saving transaction:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
});

// Delete transaction
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Deleting transaction with ID:', id);
    
    const result = await Transaction.findByIdAndDelete(id);
    
    if (!result) {
      return res.status(404).json({ 
        success: false, 
        message: 'Transaction not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Transaction deleted successfully!' 
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
});

// TEMPORARY - Delete all transactions for a user (for testing/cleanup)
app.delete('/api/transactions/all/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    console.log('Deleting all transactions for:', email);
    
    const result = await Transaction.deleteMany({ email });
    
    res.json({ 
      success: true, 
      message: `Deleted ${result.deletedCount} transactions!` 
    });
  } catch (error) {
    console.error('Error deleting all transactions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'PFM Backend Server is running!',
    endpoints: {
      auth: '/api/auth/login, /api/auth/register',
      payment: '/api/payment/create-order, /api/payment/verify-payment',
      financialData: '/api/financial-data/:email',
      usage: '/api/usage/:email', // 🆕 Added
      transactions: {
        getAll: '/api/financial-data/:email',
        create: 'POST /api/transactions (types: income, expense, savings)',
        delete: 'DELETE /api/transactions/:id',
        deleteAll: 'DELETE /api/transactions/all/:email'
      }
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Available endpoints:');
  console.log('  - POST /api/auth/register');
  console.log('  - POST /api/auth/login');
  console.log('  - POST /api/payment/create-order');
  console.log('  - POST /api/payment/verify-payment');
  console.log('  - GET /api/payment/premium-status/:email');
  console.log('  - GET /api/financial-data/:email');
  console.log('  - GET /api/usage/:email'); // 🆕 Added
  console.log('  - POST /api/transactions (types: income, expense, savings)');
  console.log('  - DELETE /api/transactions/:id');
  console.log('  - DELETE /api/transactions/all/:email');
});
