import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = ({ userEmail, onLogout }) => {
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
  
  // Modal states
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  
  // Budget state
  const [budgets, setBudgets] = useState({
    food: 0,
    transport: 0,
    shopping: 0,
    bills: 0,
    other: 0
  });
  
  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  
  // Transaction form state
  const [transactionForm, setTransactionForm] = useState({
    type: 'expense',
    amount: '',
    description: '',
    category: 'food'
  });

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });
  
  const [showUserMenu, setShowUserMenu] = useState(false);

  // 🆕 NEW FEATURES STATE
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: '',
    message: '',
    onConfirm: null,
    isDeleting: false
  });

  // Loading states
  const [isExporting, setIsExporting] = useState(false);

  // Dark mode effect
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Toast notification function
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  const fetchFinancialData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5000/api/financial-data/${userEmail}`);
      const result = await response.json();
      
      if (result.success) {
        setFinancialData(result.data);
        if (result.transactions) {
          setTransactions(result.transactions);
        }
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Unable to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchFinancialData();
      const savedBudgets = localStorage.getItem(`budgets_${userEmail}`);
      if (savedBudgets) {
        setBudgets(JSON.parse(savedBudgets));
      }
    }
  }, [userEmail]);

  // 🆕 FILTER AND SEARCH FUNCTION
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

  // 🆕 EXPORT TO CSV
  const exportToCSV = () => {
    setIsExporting(true);
    
    setTimeout(() => {
      const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
      const rows = transactions.map(txn => [
        txn.date,
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

  // Handle 3 types of transactions
  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    
    if (!transactionForm.amount || !transactionForm.description) {
      showToast('Please fill all fields', 'error');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          ...transactionForm,
          amount: parseFloat(transactionForm.amount)
        })
      });

      const result = await response.json();
      
      if (result.success) {
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

        if (result.transaction) {
          setTransactions(prev => [result.transaction, ...prev]);
        }
        
        setTransactionForm({ type: 'expense', amount: '', description: '', category: 'food' });
        setShowTransactionModal(false);
        showToast('Transaction saved successfully! 💰', 'success');
      } else {
        showToast('Failed: ' + result.message, 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Failed to add transaction', 'error');
    }
  };

  // 🆕 SHOW CONFIRMATION MODAL
  const showConfirmation = (title, message, onConfirm) => {
    setConfirmModal({
      show: true,
      title,
      message,
      onConfirm,
      isDeleting: false
    });
  };

  // 🆕 UPDATED DELETE WITH CONFIRMATION
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
          const response = await fetch(`http://localhost:5000/api/transactions/${txn._id}`, {
            method: 'DELETE',
          });

          const result = await response.json();
          
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
          } else {
            showToast('Failed to delete: ' + result.message, 'error');
          }
        } catch (error) {
          console.error('Error deleting transaction:', error);
          showToast('Failed to delete transaction', 'error');
        } finally {
          setConfirmModal({ show: false, title: '', message: '', onConfirm: null, isDeleting: false });
        }
      }
    );
  };

  // Handle budget save
  const handleSetBudget = () => {
    localStorage.setItem(`budgets_${userEmail}`, JSON.stringify(budgets));
    showToast('Budgets updated successfully! 🎯', 'success');
    setShowBudgetModal(false);
  };

  // Calculate budget progress
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

  // Calculate analytics from actual data
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
      <div className="dashboard-page">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <h2>Loading your financial data... 💰</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* NAVBAR */}
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <h2>💰 PFM Dashboard</h2>
        </div>
        
        <div className="nav-actions">
          <button 
            className="theme-toggle" 
            onClick={toggleTheme} 
            title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
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
                
                <button className="dropdown-item" onClick={() => { setShowUserMenu(false); showToast('Profile feature coming soon!', 'success'); }}>
                  <span>👤</span> Profile
                </button>
                <button className="dropdown-item" onClick={() => { setShowUserMenu(false); showToast('Settings feature coming soon!', 'success'); }}>
                  <span>⚙️</span> Settings
                </button>
                <button className="dropdown-item" onClick={() => { setShowUserMenu(false); showToast('Help center coming soon!', 'success'); }}>
                  <span>❓</span> Help & Support
                </button>
                
                <div className="dropdown-divider"></div>
                
                <button className="dropdown-item logout-item" onClick={() => { setShowUserMenu(false); onLogout(); }}>
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

        {transactions.length === 0 ? (
          <div className="empty-state">
            <h2>📊 No transactions yet</h2>
            <p>Start by adding your first income, expense, or savings transaction!</p>
            <button className="action-btn" onClick={() => setShowTransactionModal(true)}>
              ➕ Add Your First Transaction
            </button>
          </div>
        ) : (
          <>
            <div className="balance-card">
              <h3>Total Balance</h3>
              <h1 className="balance-amount">₹{financialData.totalBalance.toLocaleString()}</h1>
              <p className="growth-indicator">
                Based on {transactions.length} transaction{transactions.length > 1 ? 's' : ''}
              </p>
            </div>

            <div className="stats-grid">
              <div className="stat-card income">
                <div className="stat-icon">💵</div>
                <div className="stat-info">
                  <p className="stat-label">Income</p>
                  <h3>₹{financialData.income.toLocaleString()}</h3>
                </div>
              </div>

              <div className="stat-card expenses">
                <div className="stat-icon">💳</div>
                <div className="stat-info">
                  <p className="stat-label">Expenses</p>
                  <h3>₹{financialData.expenses.toLocaleString()}</h3>
                </div>
              </div>

              <div className="stat-card savings">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <p className="stat-label">Savings</p>
                  <h3>₹{financialData.savings.toLocaleString()}</h3>
                </div>
              </div>
            </div>

            {/* Budget Overview */}
            {Object.values(budgets).some(b => b > 0) && (
              <div className="budget-overview">
                <div className="budget-header-section">
                  <h2>📊 Budget Tracking</h2>
                  <button className="edit-budget-btn" onClick={() => setShowBudgetModal(true)}>
                    ✏️ Edit Budgets
                  </button>
                </div>
                <div className="budget-cards">
                  {Object.keys(budgets).filter(cat => budgets[cat] > 0).map(category => {
                    const progress = budgetProgress[category];
                    const isOverBudget = progress.percentage > 100;
                    return (
                      <div key={category} className={`budget-card ${isOverBudget ? 'over-budget' : ''}`}>
                        <div className="budget-card-header">
                          <span className="budget-category">
                            {category === 'food' && '🍔 Food'}
                            {category === 'transport' && '🚗 Transport'}
                            {category === 'shopping' && '🛍️ Shopping'}
                            {category === 'bills' && '💡 Bills'}
                            {category === 'other' && '📦 Other'}
                          </span>
                          <span className={`budget-status ${isOverBudget ? 'over' : 'under'}`}>
                            {progress.percentage.toFixed(0)}%
                          </span>
                        </div>
                        <div className="budget-amounts">
                          <span>₹{progress.spent.toLocaleString()} / ₹{progress.budget.toLocaleString()}</span>
                        </div>
                        <div className="budget-progress-bar">
                          <div 
                            className="budget-fill"
                            style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                          ></div>
                        </div>
                        {isOverBudget && (
                          <div className="over-budget-warning">
                            ⚠️ Over budget by ₹{(progress.spent - progress.budget).toLocaleString()}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        <div className="features-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <button className="action-btn" onClick={() => setShowAnalytics(true)}>
              📊 View Analytics
            </button>
            <button className="action-btn" onClick={() => setShowTransactionModal(true)}>
              ➕ Add Transaction
            </button>
            <button className="action-btn" onClick={() => setShowBudgetModal(true)}>
              🎯 Set Budget
            </button>
            <button className="action-btn" onClick={() => setShowReports(true)}>
              📈 Reports
            </button>
          </div>
        </div>

        {/* 🆕 UPDATED TRANSACTIONS SECTION WITH SEARCH & FILTER */}
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

            {/* 🆕 SEARCH & FILTER BAR */}
            <div className="search-filter-bar">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="🔍 Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
              
              <div className="filter-controls">
                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Types</option>
                  <option value="income">💵 Income</option>
                  <option value="expense">💳 Expense</option>
                  <option value="savings">💰 Savings</option>
                </select>

                <select 
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Categories</option>
                  <option value="food">🍔 Food</option>
                  <option value="transport">🚗 Transport</option>
                  <option value="shopping">🛍️ Shopping</option>
                  <option value="bills">💡 Bills</option>
                  <option value="salary">💰 Salary</option>
                  <option value="other">📦 Other</option>
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

            {/* 🆕 RESULTS INFO */}
            {filteredTransactions.length !== transactions.length && (
              <div className="results-info">
                Showing {filteredTransactions.length} of {transactions.length} transactions
              </div>
            )}

            {/* 🆕 FILTERED TRANSACTIONS LIST */}
            {filteredTransactions.length === 0 ? (
              <div className="no-results">
                <p>No transactions found matching your filters.</p>
              </div>
            ) : (
              <div className="transactions-list">
                {filteredTransactions.map((txn, index) => {
                  const originalIndex = transactions.findIndex(t => t._id === txn._id);
                  return (
                    <div key={txn._id || index} className={`transaction-item ${txn.type}`}>
                      <div className="txn-icon">
                        {txn.type === 'income' && '💰'}
                        {txn.type === 'expense' && '💳'}
                        {txn.type === 'savings' && '🏦'}
                      </div>
                      <div className="txn-details">
                        <h4>{txn.description}</h4>
                        <p>{txn.category} • {txn.date}</p>
                      </div>
                      <div className={`txn-amount ${txn.type}`}>
                        {txn.type === 'income' && '+'}
                        {txn.type === 'expense' && '-'}
                        {txn.type === 'savings' && '→'}
                        ₹{txn.amount.toLocaleString()}
                      </div>
                      <button 
                        className="delete-btn" 
                        onClick={() => handleDeleteTransaction(originalIndex)}
                        title="Delete transaction"
                      >
                        🗑️
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <footer style={{
          backgroundColor: 'var(--bg-secondary)',
          padding: '20px 0',
          marginTop: '60px',
          borderTop: '1px solid var(--border-color)',
          textAlign: 'center'
        }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            <p>© {new Date().getFullYear()} PFM Dashboard. All rights reserved.</p>
            <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
              <a href="#help" style={{ color: '#667eea', textDecoration: 'none' }}>Help</a>
              <a href="#privacy" style={{ color: '#667eea', textDecoration: 'none' }}>Privacy</a>
              <a href="#terms" style={{ color: '#667eea', textDecoration: 'none' }}>Terms</a>
            </div>
          </div>
        </footer>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'success' && '✅ '}
          {toast.type === 'error' && '❌ '}
          {toast.message}
        </div>
      )}

      {/* 🆕 CONFIRMATION MODAL */}
      {confirmModal.show && (
        <div className="modal-overlay">
          <div className="modal-content confirmation-modal">
            <div className="modal-header">
              <h2>{confirmModal.title}</h2>
            </div>
            <div className="confirmation-body">
              <div className="warning-icon">⚠️</div>
              <p>{confirmModal.message}</p>
            </div>
            <div className="confirmation-actions">
              <button 
                className="cancel-btn" 
                onClick={() => setConfirmModal({ show: false, title: '', message: '', onConfirm: null, isDeleting: false })}
                disabled={confirmModal.isDeleting}
              >
                Cancel
              </button>
              <button 
                className="confirm-btn danger" 
                onClick={confirmModal.onConfirm}
                disabled={confirmModal.isDeleting}
              >
                {confirmModal.isDeleting ? '⏳ Deleting...' : '🗑️ Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      {showTransactionModal && (
        <div className="modal-overlay" onClick={() => setShowTransactionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Transaction</h2>
              <button className="close-btn" onClick={() => setShowTransactionModal(false)}>×</button>
            </div>
            <form onSubmit={handleTransactionSubmit}>
              <div className="form-group">
                <label>Type</label>
                <div className="type-selector-three">
                  <button
                    type="button"
                    className={`type-btn ${transactionForm.type === 'income' ? 'active income' : ''}`}
                    onClick={() => setTransactionForm({...transactionForm, type: 'income'})}
                  >
                    💵 Income
                  </button>
                  <button
                    type="button"
                    className={`type-btn ${transactionForm.type === 'expense' ? 'active expense' : ''}`}
                    onClick={() => setTransactionForm({...transactionForm, type: 'expense'})}
                  >
                    💳 Expense
                  </button>
                  <button
                    type="button"
                    className={`type-btn ${transactionForm.type === 'savings' ? 'active savings' : ''}`}
                    onClick={() => setTransactionForm({...transactionForm, type: 'savings'})}
                  >
                    💰 Savings
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Amount (₹)</label>
                <input
                  type="number"
                  value={transactionForm.amount}
                  onChange={(e) => setTransactionForm({...transactionForm, amount: e.target.value})}
                  placeholder="Enter amount"
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  value={transactionForm.category}
                  onChange={(e) => setTransactionForm({...transactionForm, category: e.target.value})}
                >
                  <option value="food">🍔 Food</option>
                  <option value="transport">🚗 Transport</option>
                  <option value="shopping">🛍️ Shopping</option>
                  <option value="bills">💡 Bills</option>
                  <option value="salary">💰 Salary</option>
                  <option value="other">📦 Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={transactionForm.description}
                  onChange={(e) => setTransactionForm({...transactionForm, description: e.target.value})}
                  placeholder="What was this for?"
                  required
                />
              </div>

              <button type="submit" className="submit-btn">Add Transaction</button>
            </form>
          </div>
        </div>
      )}

      {/* Budget Modal */}
      {showBudgetModal && (
        <div className="modal-overlay" onClick={() => setShowBudgetModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🎯 Set Monthly Budget</h2>
              <button className="close-btn" onClick={() => setShowBudgetModal(false)}>×</button>
            </div>
            
            <div className="budget-form">
              <p className="budget-description">
                Set spending limits for each category to track your expenses better.
              </p>

              {Object.keys(budgets).map(category => (
                <div key={category} className="budget-item">
                  <div className="budget-header">
                    <label>
                      {category === 'food' && '🍔 Food'}
                      {category === 'transport' && '🚗 Transport'}
                      {category === 'shopping' && '🛍️ Shopping'}
                      {category === 'bills' && '💡 Bills'}
                      {category === 'other' && '📦 Other'}
                    </label>
                    <span className="budget-spent">
                      Spent: ₹{budgetProgress[category]?.spent.toLocaleString() || 0}
                    </span>
                  </div>
                  <input
                    type="number"
                    value={budgets[category]}
                    onChange={(e) => setBudgets({
                      ...budgets,
                      [category]: parseFloat(e.target.value) || 0
                    })}
                    placeholder="Enter budget limit"
                    className="budget-input"
                  />
                  {budgets[category] > 0 && (
                    <div className="budget-progress">
                      <div 
                        className={`budget-bar ${budgetProgress[category]?.percentage > 100 ? 'over-budget' : ''}`}
                        style={{ width: `${Math.min(budgetProgress[category]?.percentage || 0, 100)}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              ))}

              <button onClick={handleSetBudget} className="submit-btn">
                Save Budgets
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalytics && (
        <div className="modal-overlay" onClick={() => setShowAnalytics(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📊 Financial Analytics</h2>
              <button className="close-btn" onClick={() => setShowAnalytics(false)}>×</button>
            </div>
            <div className="analytics-content">
              {!analytics || analytics.length === 0 ? (
                <div className="empty-analytics">
                  <h3>No expense data yet</h3>
                  <p>Add some expense transactions to see analytics!</p>
                </div>
              ) : (
                <div className="analytics-grid">
                  <div className="analytics-card">
                    <h3>Expense Breakdown</h3>
                    <div className="pie-chart-placeholder">
                      {analytics.map((item, idx) => (
                        <p key={idx}>
                          {item.category === 'food' && '🍔'}
                          {item.category === 'transport' && '🚗'}
                          {item.category === 'shopping' && '🛍️'}
                          {item.category === 'bills' && '💡'}
                          {item.category === 'other' && '📦'}
                          {' '}{item.category.charAt(0).toUpperCase() + item.category.slice(1)}: {item.percentage}%
                        </p>
                      ))}
                    </div>
                  </div>
                  <div className="analytics-card">
                    <h3>Summary</h3>
                    <p>📊 Total Transactions: {transactions.length}</p>
                    <p>💰 Total Income: ₹{financialData.income.toLocaleString()}</p>
                    <p>💳 Total Expenses: ₹{financialData.expenses.toLocaleString()}</p>
                    <p>🏦 Total Savings: ₹{financialData.savings.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reports Modal */}
      {showReports && (
        <div className="modal-overlay" onClick={() => setShowReports(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📈 Financial Reports</h2>
              <button className="close-btn" onClick={() => setShowReports(false)}>×</button>
            </div>
            <div className="reports-content">
              {transactions.length === 0 ? (
                <div className="empty-analytics">
                  <h3>No transaction data</h3>
                  <p>Add transactions to generate reports!</p>
                </div>
              ) : (
                <>
                  <h3>Current Month Summary</h3>
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>Income</th>
                        <th>Expenses</th>
                        <th>Savings</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>October 2025</td>
                        <td className="income">₹{financialData.income.toLocaleString()}</td>
                        <td className="expense">₹{financialData.expenses.toLocaleString()}</td>
                        <td className="savings">₹{financialData.savings.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                  <button className="download-btn" onClick={() => showToast('PDF download coming soon!', 'success')}>
                    📥 Download Report (PDF)
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
