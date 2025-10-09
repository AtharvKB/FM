require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet'); // ✅ Security headers
const rateLimit = require('express-rate-limit'); // ✅ Rate limiting
const mongoSanitize = require('express-mongo-sanitize'); // ✅ Prevent NoSQL injection

const app = express();

// ========================================
// SECURITY MIDDLEWARE (Add BEFORE other middleware)
// ========================================

// ✅ Security headers (helmet)
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development (enable in production)
  crossOriginEmbedderPolicy: false
}));

// ✅ Rate limiting - Global (100 requests per 15 minutes)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per 15 minutes per IP
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ Strict rate limiting for auth routes (5 attempts per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 login/register attempts per 15 minutes
  skipSuccessfulRequests: true, // Don't count successful requests
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ Medium rate limiting for transactions (20 per 15 minutes)
const transactionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Too many transaction requests, please try again later.'
  }
});

// Apply global rate limiter to all routes
app.use(globalLimiter);

// ✅ Prevent NoSQL injection
app.use(mongoSanitize());

// ========================================
// STANDARD MIDDLEWARE
// ========================================

// CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' })); // ✅ Limit payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ========================================
// DATABASE CONNECTION
// ========================================

const uri = process.env.MONGO_URI;
mongoose.connect(uri, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1); // Exit if DB connection fails
  });

// ========================================
// ROUTES
// ========================================

// Authentication Routes (Public) - With strict rate limiting
const authRoutes = require('./routes/auth');
app.use('/api/auth', authLimiter, authRoutes); // ✅ Add rate limiter

// Transaction Routes (Protected with JWT) - With medium rate limiting
const transactionRoutes = require('./routes/transactions');
app.use('/api/transactions', transactionLimiter, transactionRoutes); // ✅ Add rate limiter

// Payment Routes
const paymentRoutes = require('./routes/payment');
app.use('/api/payment', paymentRoutes);

// ========================================
// LEGACY/UTILITY ROUTES
// ========================================

const User = require('./models/User');
const Transaction = require('./models/Transaction');

// Get financial data (legacy route)
app.get('/api/financial-data/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    console.log('⚠️ Using legacy route for:', email);
    
    const transactions = await Transaction.find({ email }).sort({ date: -1 });
    
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
    
    const totalBalance = income - expenses - savings;
    
    res.json({ 
      success: true, 
      data: {
        totalBalance,
        income,
        expenses,
        savings,
        monthlyGrowth: 0
      },
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

// Get usage info
app.get('/api/usage/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
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

// ========================================
// ROOT ROUTE & HEALTH CHECK
// ========================================

app.get('/', (req, res) => {
  res.json({ 
    message: '💰 PFM Backend Server is running!',
    status: 'active',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    security: {
      rateLimit: 'enabled',
      helmet: 'enabled',
      cors: 'enabled',
      mongoSanitize: 'enabled'
    },
    endpoints: {
      auth: {
        register: 'POST /api/auth/register (Rate limit: 5/15min)',
        login: 'POST /api/auth/login (Rate limit: 5/15min)',
        forgotPassword: 'POST /api/auth/forgot-password',
        verifyAnswer: 'POST /api/auth/verify-security-answer',
        resetPassword: 'POST /api/auth/reset-password'
      },
      transactions: {
        getAll: 'GET /api/transactions (🔒 JWT Required, Rate limit: 20/15min)',
        create: 'POST /api/transactions (🔒 JWT Required)',
        update: 'PUT /api/transactions/:id (🔒 JWT Required)',
        delete: 'DELETE /api/transactions/:id (🔒 JWT Required)',
        deleteAll: 'DELETE /api/transactions/all/:email (🔒 JWT Required)'
      },
      payment: {
        createOrder: 'POST /api/payment/create-order',
        verifyPayment: 'POST /api/payment/verify-payment',
        premiumStatus: 'GET /api/payment/premium-status/:email'
      },
      legacy: {
        financialData: 'GET /api/financial-data/:email',
        usage: 'GET /api/usage/:email'
      }
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// ========================================
// ERROR HANDLING
// ========================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ========================================
// GRACEFUL SHUTDOWN
// ========================================

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, closing server gracefully');
  mongoose.connection.close(false, () => {
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  });
});

// ========================================
// START SERVER
// ========================================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📍 Server URL: http://localhost:${PORT}`);
  console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('\n✅ Security Features:');
  console.log('   🛡️  Helmet.js - Security Headers');
  console.log('   ⏱️  Rate Limiting - Enabled');
  console.log('   🚫 NoSQL Injection Protection - Enabled');
  console.log('   🔐 CORS - Configured');
  console.log('\n✅ Available endpoints:');
  console.log('\n   🔓 Public Routes:');
  console.log('      - POST /api/auth/register (Rate: 5/15min)');
  console.log('      - POST /api/auth/login (Rate: 5/15min)');
  console.log('      - POST /api/auth/forgot-password');
  console.log('      - POST /api/auth/verify-security-answer');
  console.log('      - POST /api/auth/reset-password');
  console.log('\n   🔒 Protected Routes (JWT Required):');
  console.log('      - GET /api/transactions (Rate: 20/15min)');
  console.log('      - POST /api/transactions (Rate: 20/15min)');
  console.log('      - PUT /api/transactions/:id');
  console.log('      - DELETE /api/transactions/:id');
  console.log('      - DELETE /api/transactions/all/:email');
  console.log('\n   💳 Payment Routes:');
  console.log('      - POST /api/payment/create-order');
  console.log('      - POST /api/payment/verify-payment');
  console.log('      - GET /api/payment/premium-status/:email');
  console.log('\n   📊 Legacy/Utility Routes:');
  console.log('      - GET /api/financial-data/:email');
  console.log('      - GET /api/usage/:email');
  console.log('\n   🏥 Health Check:');
  console.log('      - GET /health');
  console.log('\n');
});
