// src/utils/constants.js

/**
 * API Base URL
 */
// 🔥 CORRECT - Use environment variable
// src/utils/constants.js

// src/utils/constants.js (lines 9-13)

const isDev = window.location.hostname === 'localhost' || 
              window.location.hostname === '127.0.0.1' ||
              window.location.hostname === '';

export const API_URL = isDev
  ? 'http://localhost:5000/api'
  : 'https://fm-rfxm.onrender.com/api';

console.log('🔥 API_URL:', API_URL); // Debug line





/**
 * Transaction types
 */
export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
  SAVINGS: 'savings'
};

/**
 * Category icons - Enhanced with more expressive emojis
 */
export const CATEGORY_ICONS = {
  food: '🍔',
  transport: '🚗',
  shopping: '🛍️',
  bills: '💡',
  salary: '💰',
  other: '📦'
};

/**
 * Category labels - Enhanced with better descriptions
 */
export const CATEGORY_LABELS = {
  food: 'Food & Dining',
  transport: 'Transportation',
  shopping: 'Shopping',
  bills: 'Bills & Utilities',
  salary: 'Salary',
  other: 'Other'
};

/**
 * Transaction type icons
 */
export const TYPE_ICONS = {
  income: '💵',
  expense: '💳',
  savings: '💰'
};

/**
 * 🆕 Category colors for charts and visual elements
 */
export const CATEGORY_COLORS = {
  food: '#ef4444',       // Red
  transport: '#3b82f6',  // Blue
  shopping: '#8b5cf6',   // Purple
  bills: '#f59e0b',      // Orange
  salary: '#10b981',     // Green
  other: '#64748b'       // Gray
};

/**
 * 🆕 Budget status thresholds
 */
export const BUDGET_STATUS = {
  EXCELLENT: 0,    // 0-49% used
  ON_TRACK: 50,    // 50-79% used
  WARNING: 80,     // 80-99% used
  EXCEEDED: 100    // 100%+ used
};

/**
 * 🆕 Budget status configurations
 */
export const BUDGET_STATUS_CONFIG = {
  EXCELLENT: {
    color: '#10b981',
    bgColor: '#d1fae5',
    icon: '✅',
    text: 'Great!'
  },
  ON_TRACK: {
    color: '#3b82f6',
    bgColor: '#dbeafe',
    icon: '💙',
    text: 'On Track'
  },
  WARNING: {
    color: '#f59e0b',
    bgColor: '#fef3c7',
    icon: '⚠️',
    text: 'Warning'
  },
  EXCEEDED: {
    color: '#ef4444',
    bgColor: '#fee2e2',
    icon: '🔴',
    text: 'Over Budget'
  }
};

/**
 * Premium plan limits
 */
export const LIMITS = {
  FREE_TRANSACTIONS: 10,
  PREMIUM_TRANSACTIONS: Infinity
};

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  THEME: 'theme',
  USER_EMAIL: 'userEmail',
  AUTH_TOKEN: 'authToken',
  BUDGETS: 'budgets' // 🆕 Added for budget storage
};

/**
 * 🆕 Date formats
 */
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  API: 'YYYY-MM-DD',
  FULL: 'MMMM DD, YYYY h:mm A'
};

/**
 * 🆕 Currency settings
 */
export const CURRENCY = {
  SYMBOL: '₹',
  CODE: 'INR',
  LOCALE: 'en-IN'
};

/**
 * 🆕 Toast notification types
 */
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

/**
 * 🆕 Modal animation durations (in ms)
 */
export const ANIMATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500
};
