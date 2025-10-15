import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { TYPE_ICONS, CATEGORY_ICONS, CATEGORY_LABELS } from '../../utils/constants';
import { transactionsAPI } from '../../services/api';
import BudgetAlerts from './BudgetAlerts';

// Import your existing modals
import TransactionModal from '../modals/TransactionModal';
import BudgetModal from '../modals/BudgetModal';
import AnalyticsModal from '../modals/AnalyticsModal';
import ReportsModal from '../modals/ReportsModal';
import LimitReachedModal from '../modals/LimitReachedModal';
import ConfirmationModal from '../modals/ConfirmationModal';
import ProfileModal from '../modals/ProfileModal';
import SettingsModal from '../modals/SettingsModal';
import HelpModal from '../modals/HelpModal';
import Toast from '../common/Toast';

const Dashboard = ({ userEmail, isPremium, premiumEndDate, onBuyPremium, onLogout }) => {
  const [financialData, setFinancialData] = useState({
    totalBalance: 0,
    income: 0,
    expenses: 0,
    savings: 0,
    monthlyGrowth: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [usageInfo, setUsageInfo] = useState(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  
  // Modal states
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  
  // Budget state
  const [budgets, setBudgets] = useState({
    food: 0,
    transport: 0,
    shopping: 0,
    bills: 0,
    other: 0
  });
  
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  
  const [transactionForm, setTransactionForm] = useState({
    type: 'expense',
    amount: '',
    description: '',
    category: 'food'
  });

  // ✅ FIXED: Theme state with proper localStorage key
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('dashboard-theme');
    return saved === 'dark';
  });
  
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: '',
    message: '',
    onConfirm: null,
    isDeleting: false
  });

  const [isExporting, setIsExporting] = useState(false);

  // ✅ FIXED: Dark mode effect with proper attribute handling
  useEffect(() => {
    localStorage.setItem('dashboard-theme', isDarkMode ? 'dark' : 'light');
    
    const dashboardElement = document.querySelector('.dashboard-page');
    if (dashboardElement) {
      if (isDarkMode) {
        dashboardElement.setAttribute('data-theme', 'dark');
      } else {
        dashboardElement.setAttribute('data-theme', 'light');
      }
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  const fetchUsageInfo = async () => {
    if (!isPremium) {
      try {
        const response = await fetch(`http://localhost:5000/api/usage/${userEmail}`);
        const data = await response.json();
        if (data.success) {
          setUsageInfo(data.usageInfo);
        }
      } catch (error) {
        console.error('Error fetching usage:', error);
      }
    }
  };

  const fetchFinancialData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await transactionsAPI.getAll();
      
      if (result.success && result.data) {
        const fetchedTransactions = result.data;
        setTransactions(fetchedTransactions);

        const calculated = {
          income: 0,
          expenses: 0,
          savings: 0,
          totalBalance: 0,
          monthlyGrowth: 0
        };

        fetchedTransactions.forEach(txn => {
          const amount = parseFloat(txn.amount) || 0;
          
          if (txn.type === 'income') {
            calculated.income += amount;
            calculated.totalBalance += amount;
          } else if (txn.type === 'expense') {
            calculated.expenses += amount;
            calculated.totalBalance -= amount;
          } else if (txn.type === 'savings') {
            calculated.savings += amount;
            calculated.totalBalance -= amount;
          }
        });

        setFinancialData(calculated);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        setTimeout(() => {
          localStorage.clear();
          window.location.href = '/login';
        }, 2000);
      } else {
        setError('Unable to connect to server. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchFinancialData();
      fetchUsageInfo();
      const savedBudgets = localStorage.getItem(`budgets_${userEmail}`);
      if (savedBudgets) {
        setBudgets(JSON.parse(savedBudgets));
      }
    }
  }, [userEmail, isPremium]);

  const getFilteredTransactions = () => {
    return transactions.filter(txn => {
      const matchesSearch = txn.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            txn.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || txn.type === filterType;
      const matchesCategory = filterCategory === 'all' || txn.category === filterCategory;
      
      return matchesSearch && matchesType && matchesCategory;
    });
  };

  const filteredTransactions = getFilteredTransactions();

  const exportToCSV = () => {
    setIsExporting(true);
    
    setTimeout(() => {
      const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
      const rows = transactions.map(txn => [
        formatDate(txn.date),
        txn.type,
        txn.category,
        txn.description,
        txn.amount
      ]);
      
      let csvContent = headers.join(',') + '\n';
      rows.forEach(row => {
        csvContent += row.join(',') + '\n';
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial-data-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      
      setIsExporting(false);
      showToast('Data exported to CSV successfully! 📊', 'success');
    }, 1000);
  };

  const checkBudgetWarnings = (category, newSpent) => {
    const budget = budgets[category];
    if (budget === 0) return;

    const percentage = (newSpent / budget) * 100;
    const categoryName = CATEGORY_LABELS[category] || category.charAt(0).toUpperCase() + category.slice(1);

    if (percentage >= 100) {
      showToast(`🔴 ${categoryName} budget exceeded!`, 'error');
    } else if (percentage >= 80) {
      showToast(`⚠️ ${categoryName} budget at ${Math.round(percentage)}%`, 'warning');
    }
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    
    if (!transactionForm.amount || !transactionForm.description) {
      showToast('Please fill all fields', 'error');
      return;
    }

    try {
      const result = await transactionsAPI.create({
        email: userEmail,
        type: transactionForm.type,
        category: transactionForm.category,
        amount: parseFloat(transactionForm.amount),
        description: transactionForm.description,
        date: new Date()
      });
      
      if (result.success && result.data) {
        const newTransaction = result.data;
        const amountNum = parseFloat(transactionForm.amount);

        setFinancialData(prev => {
          const newData = { ...prev };
          
          if (transactionForm.type === 'income') {
            newData.income += amountNum;
            newData.totalBalance += amountNum;
          } else if (transactionForm.type === 'expense') {
            newData.expenses += amountNum;
            newData.totalBalance -= amountNum;
          } else if (transactionForm.type === 'savings') {
            newData.savings += amountNum;
            newData.totalBalance -= amountNum;
          }
          
          return newData;
        });

        setTransactions(prev => [newTransaction, ...prev]);

        if (transactionForm.type === 'expense') {
          const category = transactionForm.category;
          const currentSpent = transactions
            .filter(t => t.type === 'expense' && t.category === category)
            .reduce((sum, t) => sum + t.amount, 0);
          
          checkBudgetWarnings(category, currentSpent + amountNum);
        }
        
        setTransactionForm({ type: 'expense', amount: '', description: '', category: 'food' });
        setShowTransactionModal(false);
        showToast('Transaction saved successfully! 💰', 'success');
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      
      if (error.response?.status === 401) {
        showToast('Session expired. Please login again.', 'error');
        setTimeout(() => {
          localStorage.clear();
          window.location.href = '/login';
        }, 2000);
      } else if (error.response?.data?.isPremiumRequired) {
        setShowLimitModal(true);
        setShowTransactionModal(false);
      } else {
        showToast('Failed to add transaction: ' + (error.response?.data?.message || 'Server error'), 'error');
      }
    }
  };

  const showConfirmation = (title, message, onConfirm) => {
    setConfirmModal({
      show: true,
      title,
      message,
      onConfirm,
      isDeleting: false
    });
  };

  const handleDeleteTransaction = (index) => {
    const txn = transactions[index];
    
    showConfirmation(
      'Delete Transaction',
      `Are you sure you want to delete "${txn.description}"?`,
      async () => {
        setConfirmModal(prev => ({ ...prev, isDeleting: true }));
        
        if (!txn._id) {
          showToast('Cannot delete transaction - missing ID', 'error');
          setConfirmModal({ show: false, title: '', message: '', onConfirm: null, isDeleting: false });
          return;
        }

        try {
          const result = await transactionsAPI.delete(txn._id);
          
          if (result.success) {
            const amountNum = txn.amount;

            setFinancialData(prev => {
              const newData = { ...prev };
              
              if (txn.type === 'income') {
                newData.income -= amountNum;
                newData.totalBalance -= amountNum;
              } else if (txn.type === 'expense') {
                newData.expenses -= amountNum;
                newData.totalBalance += amountNum;
              } else if (txn.type === 'savings') {
                newData.savings -= amountNum;
                newData.totalBalance += amountNum;
              }
              
              return newData;
            });

            setTransactions(prev => prev.filter((_, i) => i !== index));
            showToast('Transaction deleted successfully!', 'success');
          }
        } catch (error) {
          console.error('Error deleting transaction:', error);
          
          if (error.response?.status === 401) {
            showToast('Session expired. Please login again.', 'error');
            setTimeout(() => {
              localStorage.clear();
              window.location.href = '/login';
            }, 2000);
          } else {
            showToast('Failed to delete: ' + (error.response?.data?.message || 'Server error'), 'error');
          }
        } finally {
          setConfirmModal({ show: false, title: '', message: '', onConfirm: null, isDeleting: false });
        }
      }
    );
  };

  const handleSetBudget = () => {
    localStorage.setItem(`budgets_${userEmail}`, JSON.stringify(budgets));
    showToast('Budgets updated successfully! 🎯', 'success');
    setShowBudgetModal(false);
  };

  const calculateBudgetProgress = () => {
    const progress = {};
    Object.keys(budgets).forEach(category => {
      const spent = transactions
        .filter(t => t.type === 'expense' && t.category === category)
        .reduce((sum, t) => sum + t.amount, 0);
      progress[category] = {
        spent,
        budget: budgets[category],
        percentage: budgets[category] > 0 ? (spent / budgets[category]) * 100 : 0
      };
    });
    return progress;
  };

  const budgetProgress = calculateBudgetProgress();

  const calculateAnalytics = () => {
    if (transactions.length === 0) return null;

    const categoryTotals = {};
    let totalExpenses = 0;

    transactions.forEach(txn => {
      if (txn.type === 'expense') {
        categoryTotals[txn.category] = (categoryTotals[txn.category] || 0) + txn.amount;
        totalExpenses += txn.amount;
      }
    });

    const categoryPercentages = Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      percentage: ((amount / totalExpenses) * 100).toFixed(1)
    }));

    return categoryPercentages;
  };

  const analytics = calculateAnalytics();

  if (isLoading) {
    return (
      <div className="dashboard-page" data-theme={isDarkMode ? 'dark' : 'light'}>
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <h2>Loading your financial data... 💰</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page" data-theme={isDarkMode ? 'dark' : 'light'}>
      {/* NAVBAR */}
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <h2>💰 PFM Dashboard</h2>
        </div>
        
        <div className="nav-actions">
          {isPremium && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              color: '#78350f',
              borderRadius: '20px',
              fontWeight: 600,
              fontSize: '0.9rem',
              marginRight: '1rem'
            }}>
              <span>👑</span>
              <span>Premium</span>
            </div>
          )}
          
          {!isPremium && (
            <button 
              onClick={onBuyPremium}
              style={{
                padding: '0.6rem 1.2rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                marginRight: '1rem'
              }}
            >
              ⭐ Upgrade to Premium
            </button>
          )}
          
          <button 
            className="theme-toggle" 
            onClick={toggleTheme}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          
          <div className="user-menu-container">
            <button 
              className="user-menu-btn" 
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="user-avatar">
                {userEmail.charAt(0).toUpperCase()}
              </div>
              <span className="user-email">{userEmail}</span>
              <span className="dropdown-arrow">{showUserMenu ? '▲' : '▼'}</span>
            </button>
            
            {showUserMenu && (
              <div className="user-dropdown">
                <div className="dropdown-header">
                  <div className="user-info">
                    <div className="user-avatar-large">
                      {userEmail.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="user-name">{userEmail.split('@')[0]}</p>
                      <p className="user-email-small">{userEmail}</p>
                    </div>
                  </div>
                </div>
                
                <div className="dropdown-divider"></div>
                
                <button className="dropdown-item" onClick={() => {
                  setShowProfileModal(true);
                  setShowUserMenu(false);
                }}>
                  <span>👤</span> Profile
                </button>
                <button className="dropdown-item" onClick={() => {
                  setShowSettingsModal(true);
                  setShowUserMenu(false);
                }}>
                  <span>⚙️</span> Settings
                </button>
                <button className="dropdown-item" onClick={() => {
                  setShowHelpModal(true);
                  setShowUserMenu(false);
                }}>
                  <span>❓</span> Help & Support
                </button>
                
                <div className="dropdown-divider"></div>
                
                <button className="dropdown-item logout-item" onClick={onLogout}>
                  <span>🚪</span> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="dashboard-container">
        {error && (
          <div className="error-banner">
            ⚠️ {error}
          </div>
        )}

        <div className="welcome-section">
          <h1>Welcome back! 👋</h1>
          <p>Here's your financial overview</p>
        </div>

        {!isPremium && usageInfo && (
          <div style={{
            padding: '1rem',
            background: '#fef3c7',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>
              📊 Free Tier: {usageInfo.used}/{usageInfo.limit} transactions this month
              ({usageInfo.remaining} remaining)
            </span>
            <button 
              onClick={onBuyPremium}
              style={{
                padding: '0.5rem 1rem',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              ⭐ Upgrade
            </button>
          </div>
        )}

        {transactions.length === 0 ? (
          <div className="empty-state">
            <h2>📊 No transactions yet</h2>
            <p>Start by adding your first income, expense, or savings transaction!</p>
            <button 
              className="action-btn"
              onClick={() => setShowTransactionModal(true)}
            >
              ➕ Add Your First Transaction
            </button>
          </div>
        ) : (
          <>
            <div className="balance-card">
              <h3>Total Balance</h3>
              <h1 className="balance-amount">{formatCurrency(financialData.totalBalance)}</h1>
              <p className="growth-indicator">
                Based on {transactions.length} transaction{transactions.length > 1 ? 's' : ''}
              </p>
            </div>

            <BudgetAlerts 
              budgetProgress={budgetProgress}
              onViewBudget={() => setShowBudgetModal(true)}
            />

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">💵</div>
                <div className="stat-info">
                  <p className="stat-label">Income</p>
                  <h3>{formatCurrency(financialData.income)}</h3>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">💳</div>
                <div className="stat-info">
                  <p className="stat-label">Expenses</p>
                  <h3>{formatCurrency(financialData.expenses)}</h3>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <p className="stat-label">Savings</p>
                  <h3>{formatCurrency(financialData.savings)}</h3>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="features-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <button 
              className="action-btn"
              onClick={() => setShowAnalytics(true)}
            >
              📊 View Analytics
            </button>
            <button 
              className="action-btn"
              onClick={() => setShowTransactionModal(true)}
            >
              ➕ Add Transaction
            </button>
            <button 
              className="action-btn"
              onClick={() => setShowBudgetModal(true)}
            >
              🎯 Set Budget
            </button>
            <button 
              className="action-btn"
              onClick={() => setShowReports(true)}
            >
              📈 Reports
            </button>
          </div>
        </div>

        {transactions.length > 0 && (
          <div className="transactions-section">
            <div className="transactions-header">
              <h2>Recent Transactions</h2>
              <div className="transaction-actions">
                <button 
                  className="export-btn"
                  onClick={exportToCSV}
                  disabled={isExporting}
                >
                  {isExporting ? '⏳ Exporting...' : '📥 Export CSV'}
                </button>
              </div>
            </div>

            <div className="search-filter-bar">
              <div className="search-box">
                <input
                  type="text"
                  className="search-input"
                  placeholder="🔍 Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="filter-controls">
                <select 
                  className="filter-select"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="income">💵 Income</option>
                  <option value="expense">💳 Expense</option>
                  <option value="savings">💰 Savings</option>
                </select>

                <select 
                  className="filter-select"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="food">{CATEGORY_ICONS.food} {CATEGORY_LABELS.food}</option>
                  <option value="transport">{CATEGORY_ICONS.transport} {CATEGORY_LABELS.transport}</option>
                  <option value="shopping">{CATEGORY_ICONS.shopping} {CATEGORY_LABELS.shopping}</option>
                  <option value="bills">{CATEGORY_ICONS.bills} {CATEGORY_LABELS.bills}</option>
                  <option value="salary">{CATEGORY_ICONS.salary} {CATEGORY_LABELS.salary}</option>
                  <option value="other">{CATEGORY_ICONS.other} {CATEGORY_LABELS.other}</option>
                </select>

                {(searchQuery || filterType !== 'all' || filterCategory !== 'all') && (
                  <button 
                    className="clear-filters-btn"
                    onClick={() => {
                      setSearchQuery('');
                      setFilterType('all');
                      setFilterCategory('all');
                    }}
                  >
                    ✕ Clear
                  </button>
                )}
              </div>
            </div>

            {filteredTransactions.length === 0 ? (
              <div className="no-results">
                <p>No transactions match your filters</p>
              </div>
            ) : (
              <>
                <p className="results-info">
                  Showing {filteredTransactions.length} of {transactions.length} transactions
                </p>
                <div className="transactions-list">
                  {filteredTransactions.map((txn, index) => (
                    <div key={txn._id || index} className={`transaction-item ${txn.type}`}>
                      <div className="txn-icon">
                        {txn.type === 'expense' ? CATEGORY_ICONS[txn.category] || '📦' : TYPE_ICONS[txn.type]}
                      </div>
                      <div className="txn-details">
                        <h4>{txn.description}</h4>
                        <p>
                          {txn.type === 'expense' 
                            ? (CATEGORY_LABELS[txn.category] || txn.category)
                            : txn.category
                          } • {formatDate(txn.date)}
                        </p>
                      </div>
                      <div className={`txn-amount ${txn.type}`}>
                        {txn.type === 'income' && '+'}
                        {txn.type === 'expense' && '-'}
                        {txn.type === 'savings' && '→'}
                        {formatCurrency(txn.amount)}
                      </div>
                      <button 
                        className="delete-btn" 
                        onClick={() => handleDeleteTransaction(index)}
                        title="Delete transaction"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <footer className="dashboard-footer">
          <div className="footer-content">
            <p className="footer-text">
              © {new Date().getFullYear()} PFM Dashboard. All rights reserved.
            </p>
            <div className="footer-links">
              <a href="#help" className="footer-link">Help</a>
              <a href="#privacy" className="footer-link">Privacy</a>
              <a href="#terms" className="footer-link">Terms</a>
            </div>
          </div>
        </footer>
      </div>

      {/* MODALS */}
      <Toast 
        show={toast.show}
        message={toast.message}
        type={toast.type}
      />

      <LimitReachedModal
        show={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        onUpgrade={onBuyPremium}
      />

      <ConfirmationModal
        show={confirmModal.show}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ show: false, title: '', message: '', onConfirm: null, isDeleting: false })}
        isDeleting={confirmModal.isDeleting}
      />

      <TransactionModal
        show={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        transactionForm={transactionForm}
        setTransactionForm={setTransactionForm}
        onSubmit={handleTransactionSubmit}
      />

      <BudgetModal
        show={showBudgetModal}
        onClose={() => setShowBudgetModal(false)}
        budgets={budgets}
        setBudgets={setBudgets}
        budgetProgress={budgetProgress}
        onSave={handleSetBudget}
      />

      <AnalyticsModal
        show={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        analytics={analytics}
        financialData={financialData}
        transactionsCount={transactions.length}
        transactions={transactions}
      />

      <ReportsModal
        show={showReports}
        onClose={() => setShowReports(false)}
        financialData={financialData}
        transactionsCount={transactions.length}
        onDownloadPDF={() => showToast('PDF download coming soon!', 'success')}
      />

      <ProfileModal
        show={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        userEmail={userEmail}
        isPremium={isPremium}
      />

      <SettingsModal
        show={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />

      <HelpModal
        show={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
    </div>
  );
};

export default Dashboard;
