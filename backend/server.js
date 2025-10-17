require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// ========================================
// SECURITY MIDDLEWARE
// ========================================

// Security headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Rate limiting definitions
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const transactionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Too many transaction requests, please try again later.'
  }
});

// ========================================
// STANDARD MIDDLEWARE
// ========================================

// CORS Configuration - FIXED FOR PRODUCTION
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://fm-rfxm.onrender.com',
];

// Add Vercel frontend URL if provided
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl, server-to-server)
    if (!origin) return callback(null, true);
    
    // 🔥 Allow ALL .vercel.app domains OR whitelisted origins
    if (origin.endsWith('.vercel.app') || allowedOrigins.includes(origin)) {
      console.log('✅ CORS allowed:', origin);
      callback(null, true);
    } else {
      console.warn('⚠️ CORS blocked:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Handle preflight requests explicitly
app.options('*', cors());

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global Rate Limiter
app.use(globalLimiter);

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
    process.exit(1);
  });

// ========================================
// ROUTES
// ========================================

// Authentication Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authLimiter, authRoutes);

// Transaction Routes
const transactionRoutes = require('./routes/transactions');
app.use('/api/transactions', transactionLimiter, transactionRoutes);

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
    environment: process.env.NODE_ENV || 'development',
    security: {
      rateLimit: 'enabled',
      helmet: 'enabled',
      cors: 'enabled - ALL .vercel.app domains allowed'
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
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    memory: process.memoryUsage()
  });
});

// ========================================
// ERROR HANDLING
// ========================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`
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

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📍 Server URL: http://localhost:${PORT}`);
  console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('\n✅ Security Features:');
  console.log('   🛡️  Helmet.js - Security Headers');
  console.log('   ⏱️  Rate Limiting - Enabled');
  console.log('   🔐 CORS - Configured (ALL .vercel.app allowed)');
  console.log('   🛡️  Mongoose - Built-in NoSQL Protection');
  console.log('\n✅ Available endpoints:');
  console.log('\n   🔓 Public Routes:');
  console.log('      - POST /api/auth/register (Rate: 5/15min)');
  console.log('      - POST /api/auth/login (Rate: 5/15min)');
  console.log('      - POST /api/auth/forgot-password');
  console.log('\n   🔒 Protected Routes (JWT Required):');
  console.log('      - GET /api/transactions (Rate: 20/15min)');
  console.log('      - POST /api/transactions (Rate: 20/15min)');
  console.log('      - PUT /api/transactions/:id');
  console.log('      - DELETE /api/transactions/:id');
  console.log('\n   💳 Payment Routes:');
  console.log('      - POST /api/payment/create-order');
  console.log('      - POST /api/payment/verify-payment');
  console.log('\n   🏥 Health Check:');
  console.log('      - GET /health');
  console.log('\n');
});
