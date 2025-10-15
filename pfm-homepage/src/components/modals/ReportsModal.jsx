import React from 'react';
import { formatCurrency } from '../../utils/formatters';
import { CATEGORY_ICONS, CATEGORY_LABELS, CATEGORY_COLORS } from '../../utils/constants';

const ReportsModal = ({ 
  show, 
  onClose, 
  financialData, 
  transactionsCount,
  transactions,
  onDownloadPDF 
}) => {
  if (!show) return null;

  // Get theme from dashboard
  const isDarkMode = document.querySelector('.dashboard-page')?.getAttribute('data-theme') === 'dark';

  // Theme colors
  const themeStyles = {
    modalBg: isDarkMode ? '#1e293b' : '#ffffff',
    cardBg: isDarkMode ? '#2d3748' : '#f8f9fa',
    textPrimary: isDarkMode ? '#f1f5f9' : '#1a202c',
    textSecondary: isDarkMode ? '#94a3b8' : '#64748b',
    borderColor: isDarkMode ? '#334155' : '#e2e8f0',
    tableBg: isDarkMode ? '#1e293b' : '#ffffff',
    tableHeaderBg: isDarkMode ? '#334155' : '#e2e8f0',
  };

  // Calculate category breakdown
  const getCategoryBreakdown = () => {
    if (!transactions || transactions.length === 0) return [];

    const categoryTotals = {};
    
    transactions.forEach(txn => {
      if (txn.type === 'expense') {
        categoryTotals[txn.category] = (categoryTotals[txn.category] || 0) + txn.amount;
      }
    });

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: ((amount / financialData.expenses) * 100).toFixed(1),
        icon: CATEGORY_ICONS[category] || '📦',
        label: CATEGORY_LABELS[category] || category.charAt(0).toUpperCase() + category.slice(1),
        color: CATEGORY_COLORS[category] || '#64748b'
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  const categoryBreakdown = getCategoryBreakdown();

  // Calculate key metrics
  const netBalance = financialData.totalBalance;
  const savingsRate = financialData.income > 0 
    ? ((financialData.savings / financialData.income) * 100).toFixed(1)
    : 0;
  const expenseRate = financialData.income > 0
    ? ((financialData.expenses / financialData.income) * 100).toFixed(1)
    : 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content large" 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: themeStyles.modalBg,
          color: themeStyles.textPrimary
        }}
      >
        <div className="modal-header" style={{ color: themeStyles.textPrimary }}>
          <h2 style={{ color: themeStyles.textPrimary }}>📈 Financial Reports</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="reports-content">
          {transactionsCount === 0 ? (
            <div className="empty-analytics" style={{ color: themeStyles.textSecondary }}>
              <div className="empty-icon">📈</div>
              <h3 style={{ color: themeStyles.textPrimary }}>No transaction data</h3>
              <p style={{ color: themeStyles.textSecondary }}>Add transactions to generate detailed financial reports!</p>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="report-summary-grid">
                <div className="report-summary-card" style={{ background: themeStyles.cardBg, borderColor: themeStyles.borderColor }}>
                  <div className="summary-icon income">💵</div>
                  <div className="summary-info">
                    <span className="summary-label" style={{ color: themeStyles.textSecondary }}>Total Income</span>
                    <h3 className="summary-value income">{formatCurrency(financialData.income)}</h3>
                  </div>
                </div>

                <div className="report-summary-card" style={{ background: themeStyles.cardBg, borderColor: themeStyles.borderColor }}>
                  <div className="summary-icon expense">💳</div>
                  <div className="summary-info">
                    <span className="summary-label" style={{ color: themeStyles.textSecondary }}>Total Expenses</span>
                    <h3 className="summary-value expense">{formatCurrency(financialData.expenses)}</h3>
                    <span className="summary-percentage" style={{ color: themeStyles.textSecondary }}>{expenseRate}% of income</span>
                  </div>
                </div>

                <div className="report-summary-card" style={{ background: themeStyles.cardBg, borderColor: themeStyles.borderColor }}>
                  <div className="summary-icon savings">💰</div>
                  <div className="summary-info">
                    <span className="summary-label" style={{ color: themeStyles.textSecondary }}>Total Savings</span>
                    <h3 className="summary-value savings">{formatCurrency(financialData.savings)}</h3>
                    <span className="summary-percentage" style={{ color: themeStyles.textSecondary }}>{savingsRate}% savings rate</span>
                  </div>
                </div>

                <div className="report-summary-card highlight" style={{ background: themeStyles.cardBg, borderColor: themeStyles.borderColor }}>
                  <div className="summary-icon balance">🏦</div>
                  <div className="summary-info">
                    <span className="summary-label" style={{ color: themeStyles.textSecondary }}>Net Balance</span>
                    <h3 className={`summary-value ${netBalance >= 0 ? 'positive' : 'negative'}`}>
                      {formatCurrency(netBalance)}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Monthly Summary Table */}
              <div className="report-section" style={{ background: themeStyles.cardBg, borderColor: themeStyles.borderColor }}>
                <h3 style={{ color: themeStyles.textPrimary }}>📊 Monthly Summary</h3>
                <table className="report-table" style={{ background: themeStyles.tableBg }}>
                  <thead style={{ background: themeStyles.tableHeaderBg }}>
                    <tr>
                      <th style={{ color: themeStyles.textPrimary }}>Month</th>
                      <th style={{ color: themeStyles.textPrimary }}>Transactions</th>
                      <th style={{ color: themeStyles.textPrimary }}>Income</th>
                      <th style={{ color: themeStyles.textPrimary }}>Expenses</th>
                      <th style={{ color: themeStyles.textPrimary }}>Savings</th>
                      <th style={{ color: themeStyles.textPrimary }}>Net Balance</th>
                    </tr>
                  </thead>
                  <tbody style={{ background: themeStyles.tableBg }}>
                    <tr style={{ background: themeStyles.tableBg }}>
                      <td style={{ color: themeStyles.textPrimary }}>
                        <strong>{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</strong>
                      </td>
                      <td style={{ color: themeStyles.textPrimary }}>{transactionsCount}</td>
                      <td className="income">{formatCurrency(financialData.income)}</td>
                      <td className="expense">{formatCurrency(financialData.expenses)}</td>
                      <td className="savings">{formatCurrency(financialData.savings)}</td>
                      <td className={netBalance >= 0 ? 'positive' : 'negative'}>
                        {formatCurrency(netBalance)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Category Breakdown */}
              {categoryBreakdown.length > 0 && (
                <div className="report-section" style={{ background: themeStyles.cardBg, borderColor: themeStyles.borderColor }}>
                  <h3 style={{ color: themeStyles.textPrimary }}>🍔 Expense Breakdown by Category</h3>
                  <table className="report-table category-table" style={{ background: themeStyles.tableBg }}>
                    <thead style={{ background: themeStyles.tableHeaderBg }}>
                      <tr>
                        <th style={{ color: themeStyles.textPrimary }}>Category</th>
                        <th style={{ color: themeStyles.textPrimary }}>Amount</th>
                        <th style={{ color: themeStyles.textPrimary }}>% of Total Expenses</th>
                        <th style={{ color: themeStyles.textPrimary }}>Visual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryBreakdown.map((cat, index) => (
                        <tr key={index} style={{ background: themeStyles.tableBg }}>
                          <td>
                            <div className="category-cell">
                              <span 
                                className="category-icon-badge"
                                style={{ 
                                  background: cat.color,
                                  opacity: 0.15 
                                }}
                              >
                                <span style={{ opacity: 1 }}>{cat.icon}</span>
                              </span>
                              <strong style={{ color: themeStyles.textPrimary }}>{cat.label}</strong>
                            </div>
                          </td>
                          <td className="amount-cell">
                            <strong style={{ color: themeStyles.textPrimary }}>{formatCurrency(cat.amount)}</strong>
                          </td>
                          <td className="percentage-cell" style={{ color: themeStyles.textSecondary }}>
                            {cat.percentage}%
                          </td>
                          <td>
                            <div className="category-bar-container" style={{ background: isDarkMode ? '#1e293b' : '#e2e8f0' }}>
                              <div 
                                className="category-bar"
                                style={{ 
                                  width: `${cat.percentage}%`,
                                  background: cat.color
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Key Insights */}
              <div className="report-section insights-section" style={{ background: themeStyles.cardBg, borderColor: themeStyles.borderColor }}>
                <h3 style={{ color: themeStyles.textPrimary }}>💡 Key Insights</h3>
                <div className="insights-grid">
                  <div className={`insight-card ${savingsRate >= 20 ? 'positive' : 'warning'}`}>
                    <span className="insight-icon">
                      {savingsRate >= 20 ? '✅' : '⚠️'}
                    </span>
                    <div className="insight-content">
                      <strong style={{ color: themeStyles.textPrimary }}>Savings Rate</strong>
                      <p style={{ color: themeStyles.textSecondary }}>
                        {savingsRate >= 20 
                          ? `Excellent! You're saving ${savingsRate}% of your income.`
                          : `Consider increasing savings. Current rate: ${savingsRate}%`
                        }
                      </p>
                    </div>
                  </div>

                  <div className={`insight-card ${expenseRate <= 70 ? 'positive' : 'warning'}`}>
                    <span className="insight-icon">
                      {expenseRate <= 70 ? '✅' : '⚠️'}
                    </span>
                    <div className="insight-content">
                      <strong style={{ color: themeStyles.textPrimary }}>Expense Management</strong>
                      <p style={{ color: themeStyles.textSecondary }}>
                        {expenseRate <= 70
                          ? `Good control! Expenses are ${expenseRate}% of income.`
                          : `High spending at ${expenseRate}% of income. Consider reducing expenses.`
                        }
                      </p>
                    </div>
                  </div>

                  <div className={`insight-card ${transactionsCount >= 5 ? 'positive' : 'info'}`}>
                    <span className="insight-icon">📊</span>
                    <div className="insight-content">
                      <strong style={{ color: themeStyles.textPrimary }}>Transaction Activity</strong>
                      <p style={{ color: themeStyles.textSecondary }}>{transactionsCount} transactions recorded this month.</p>
                    </div>
                  </div>

                  {categoryBreakdown.length > 0 && (
                    <div className="insight-card info">
                      <span className="insight-icon">{categoryBreakdown[0].icon}</span>
                      <div className="insight-content">
                        <strong style={{ color: themeStyles.textPrimary }}>Top Spending Category</strong>
                        <p style={{ color: themeStyles.textSecondary }}>
                          {categoryBreakdown[0].label}: {formatCurrency(categoryBreakdown[0].amount)} 
                          ({categoryBreakdown[0].percentage}% of expenses)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Download Button */}
              <div className="report-actions">
                <button className="download-btn primary" onClick={onDownloadPDF}>
                  📥 Download Full Report (PDF)
                </button>
                <button className="download-btn secondary" onClick={() => alert('CSV export coming soon!')}>
                  📊 Export as CSV
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsModal;
