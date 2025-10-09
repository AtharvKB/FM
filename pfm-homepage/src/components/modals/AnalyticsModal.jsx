import React from 'react';
import { CATEGORY_ICONS, CATEGORY_LABELS, CATEGORY_COLORS } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import ExpensePieChart from '../dashboard/Charts/ExpensePieChart';
import MonthlyBarChart from '../dashboard/Charts/MonthlyBarChart';
import TrendLineChart from '../dashboard/Charts/TrendLineChart';



const AnalyticsModal = ({ 
  show, 
  onClose, 
  analytics, 
  financialData,
  transactionsCount,
  transactions = []
}) => {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📊 Financial Analytics</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="analytics-content">
          {!analytics || analytics.length === 0 ? (
            <div className="empty-analytics">
              <div className="empty-icon">📊</div>
              <h3>No expense data yet</h3>
              <p>Add some expense transactions to see detailed analytics and insights!</p>
            </div>
          ) : (
            <>
              <div className="analytics-card summary-card full-width">
                <h3>💰 Financial Summary</h3>
                <div className="summary-stats">
                  <div className="summary-item">
                    <div className="summary-icon transactions">📊</div>
                    <div className="summary-details">
                      <span className="summary-label">Total Transactions</span>
                      <span className="summary-value">{transactionsCount}</span>
                    </div>
                  </div>

                  <div className="summary-item">
                    <div className="summary-icon income">💵</div>
                    <div className="summary-details">
                      <span className="summary-label">Total Income</span>
                      <span className="summary-value income">
                        {formatCurrency(financialData.income)}
                      </span>
                    </div>
                  </div>

                  <div className="summary-item">
                    <div className="summary-icon expense">💳</div>
                    <div className="summary-details">
                      <span className="summary-label">Total Expenses</span>
                      <span className="summary-value expense">
                        {formatCurrency(financialData.expenses)}
                      </span>
                    </div>
                  </div>

                  <div className="summary-item">
                    <div className="summary-icon savings">💰</div>
                    <div className="summary-details">
                      <span className="summary-label">Total Savings</span>
                      <span className="summary-value savings">
                        {formatCurrency(financialData.savings)}
                      </span>
                    </div>
                  </div>

                  <div className="summary-item highlight">
                    <div className="summary-icon balance">🏦</div>
                    <div className="summary-details">
                      <span className="summary-label">Net Balance</span>
                      <span className={`summary-value balance ${financialData.totalBalance >= 0 ? 'positive' : 'negative'}`}>
                        {formatCurrency(financialData.totalBalance)}
                      </span>
                    </div>
                  </div>
                </div>

                {financialData.income > 0 && (
                  <div className="savings-rate">
                    <div className="savings-rate-label">
                      <span>💎 Savings Rate</span>
                      <span className="savings-rate-value">
                        {((financialData.savings / financialData.income) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="savings-rate-bar">
                      <div 
                        className="savings-rate-fill"
                        style={{ 
                          width: `${Math.min((financialData.savings / financialData.income) * 100, 100)}%` 
                        }}
                      />
                    </div>
                    <p className="savings-rate-hint">
                      {((financialData.savings / financialData.income) * 100) >= 20 
                        ? '✅ Great savings rate!' 
                        : '⚠️ Try to save at least 20% of your income'}
                    </p>
                  </div>
                )}
              </div>

              <div className="charts-grid">
                <div className="chart-card">
                  <h3>🥧 Expense Breakdown</h3>
                  <ExpensePieChart transactions={transactions} />
                </div>

                <div className="chart-card">
                  <h3>💳 Category Analysis</h3>
                  <div className="expense-breakdown">
                    {analytics.slice(0, 6).map((item, idx) => (
                      <div key={idx} className="analytics-row">
                        <div className="analytics-category">
                          <span 
                            className="category-icon-badge"
                            style={{ 
                              background: CATEGORY_COLORS[item.category] || '#64748b',
                              opacity: 0.15
                            }}
                          >
                            <span style={{ opacity: 1 }}>
                              {CATEGORY_ICONS[item.category] || '📦'}
                            </span>
                          </span>
                          <span className="category-name">
                            {CATEGORY_LABELS[item.category] || item.category}
                          </span>
                        </div>
                        
                        <div className="analytics-bar-container">
                          <div 
                            className="analytics-bar"
                            style={{ 
                              width: `${item.percentage}%`,
                              background: CATEGORY_COLORS[item.category] || '#64748b'
                            }}
                          >
                            {parseFloat(item.percentage) > 8 && (
                              <span className="bar-label">{item.percentage}%</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="analytics-percentage">
                          {parseFloat(item.percentage) <= 8 ? `${item.percentage}%` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="chart-card full-width">
                  <h3>📊 Monthly Comparison (Last 6 Months)</h3>
                  <MonthlyBarChart transactions={transactions} />
                </div>

                <div className="chart-card full-width">
                  <h3>📈 30-Day Spending Trend</h3>
                  <TrendLineChart transactions={transactions} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsModal;
