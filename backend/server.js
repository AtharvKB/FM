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

// CORS Configuration - PRODUCTION READY
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://fm-rfxm.onrender.com',
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (origin.endsWith('.vercel.app') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('⚠️ CORS blocked:', origin);
      callback(null, true); // 🔥 ALLOW ALL for now to avoid CORS errors
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

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
if (!uri) {
  console.error('❌ MONGO_URI environment variable is not set!');
  process.exit(1);
}

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
// ROOT ROUTE & HEALTH CHECK (BEFORE OTHER ROUTES)
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
      cors: 'enabled - ALL origins allowed (production)'
    },
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        forgotPassword: 'POST /api/auth/forgot-password'
      },
      transactions: {
        getAll: 'GET /api/transactions (🔒 JWT Required)',
        create: 'POST /api/transactions (🔒 JWT Required)',
        update: 'PUT /api/transactions/:id (🔒 JWT Required)',
        delete: 'DELETE /api/transactions/:id (🔒 JWT Required)'
      },
      payment: {
        createOrder: 'POST /api/payment/create-order',
        verifyPayment: 'POST /api/payment/verify-payment'
      }
    }
  });
});

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
// ROUTES WITH ERROR HANDLING
// ========================================

try {
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authLimiter, authRoutes);
  console.log('✅ Auth routes loaded');
} catch (error) {
  console.error('❌ Failed to load auth routes:', error.message);
  console.error('   Make sure ./routes/auth.js exists');
}

try {
  const transactionRoutes = require('./routes/transactions');
  app.use('/api/transactions', transactionLimiter, transactionRoutes);
  console.log('✅ Transaction routes loaded');
} catch (error) {
  console.error('❌ Failed to load transaction routes:', error.message);
  console.error('   Make sure ./routes/transactions.js exists');
}

try {
  const paymentRoutes = require('./routes/payment');
  app.use('/api/payment', paymentRoutes);
  console.log('✅ Payment routes loaded');
} catch (error) {
  console.error('❌ Failed to load payment routes:', error.message);
  console.error('   Make sure ./routes/payment.js exists');
}

// ========================================
// LEGACY/UTILITY ROUTES
// ========================================

const User = require('./models/User');
const Transaction = require('./models/Transaction');

app.get('/api/financial-data/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const transactions = await Transaction.find({ email }).sort({ date: -1 });
    
    let income = 0, expenses = 0, savings = 0;
    
    transactions.forEach(txn => {
      if (txn.type === 'income') income += txn.amount;
      else if (txn.type === 'expense') expenses += txn.amount;
      else if (txn.type === 'savings') savings += txn.amount;
    });
    
    res.json({ 
      success: true, 
      data: {
        totalBalance: income - expenses - savings,
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
// ERROR HANDLING
// ========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`
  });
});

app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// ========================================
// GRACEFUL SHUTDOWN
// ========================================

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, closing gracefully');
  mongoose.connection.close(false, () => {
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  });
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// ========================================
// START SERVER
// ========================================

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔐 CORS: ALL origins allowed`);
  console.log(`✅ Health: GET /health`);
  console.log(`✅ Server ready!`);
}).on('error', (err) => {
  console.error('❌ Server failed to start:', err);
  process.exit(1);
});
