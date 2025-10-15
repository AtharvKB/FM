import React from 'react';
import { formatCurrency, calculatePercentage } from '../../utils/formatters';
import { CATEGORY_ICONS, CATEGORY_LABELS, BUDGET_STATUS_CONFIG } from '../../utils/constants';

const BudgetModal = ({ 
  show, 
  onClose, 
  budgets, 
  setBudgets, 
  budgetProgress,
  onSave 
}) => {
  if (!show) return null;

  // Get theme from dashboard
  const isDarkMode = document.querySelector('.dashboard-page')?.getAttribute('data-theme') === 'dark';

  // Theme colors
  const themeStyles = {
    modalBg: isDarkMode ? '#1e293b' : '#ffffff',
    textPrimary: isDarkMode ? '#f1f5f9' : '#1a202c',
    textSecondary: isDarkMode ? '#94a3b8' : '#64748b',
    cardBg: isDarkMode ? '#2d3748' : '#f8f9fa',
    borderColor: isDarkMode ? '#334155' : '#e2e8f0',
  };

  // 🆕 Enhanced: Use constants for budget status
  const getBudgetStatus = (percentage) => {
    if (percentage >= 100) return BUDGET_STATUS_CONFIG.EXCEEDED;
    if (percentage >= 80) return BUDGET_STATUS_CONFIG.WARNING;
    if (percentage >= 50) return BUDGET_STATUS_CONFIG.ON_TRACK;
    return BUDGET_STATUS_CONFIG.EXCELLENT;
  };

  // Calculate totals
  const totalBudget = Object.values(budgets).reduce((sum, val) => sum + val, 0);
  const totalSpent = Object.values(budgetProgress).reduce((sum, val) => sum + (val.spent || 0), 0);
  const remaining = totalBudget - totalSpent;
  const isOverBudget = remaining < 0;
  const noBudget = totalBudget === 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: themeStyles.modalBg,
          color: themeStyles.textPrimary
        }}
      >
        <div className="modal-header" style={{ color: themeStyles.textPrimary }}>
          <h2 style={{ color: themeStyles.textPrimary }}>🎯 Set Monthly Budget</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="budget-form">
          <p className="budget-description" style={{ color: themeStyles.textSecondary }}>
            Set spending limits for each category to track your expenses better.
          </p>

          {Object.keys(budgets).map(category => {
            const progress = budgetProgress[category] || { spent: 0, percentage: 0 };
            const status = getBudgetStatus(progress.percentage);
            
            return (
              <div 
                key={category} 
                className="budget-item"
                style={{ 
                  background: themeStyles.cardBg,
                  borderColor: themeStyles.borderColor 
                }}
              >
                <div className="budget-header">
                  <label style={{ color: themeStyles.textPrimary }}>
                    {CATEGORY_ICONS[category]} {CATEGORY_LABELS[category] || category.charAt(0).toUpperCase() + category.slice(1)}
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="budget-spent" style={{ color: themeStyles.textSecondary }}>
                      Spent: {formatCurrency(progress.spent)}
                    </span>
                    {budgets[category] > 0 && (
                      <span 
                        className="budget-status-badge"
                        style={{ 
                          background: status.bgColor,
                          color: status.color,
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        {status.icon} {status.text}
                      </span>
                    )}
                  </div>
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
                  min="0"
                  step="100"
                  style={{
                    background: isDarkMode ? '#1e293b' : '#ffffff',
                    color: themeStyles.textPrimary,
                    borderColor: themeStyles.borderColor
                  }}
                />
                
                {budgets[category] > 0 && (
                  <>
                    <div className="budget-progress" style={{ background: isDarkMode ? '#1e293b' : '#e2e8f0' }}>
                      <div 
                        className="budget-bar"
                        style={{ 
                          width: `${Math.min(progress.percentage, 100)}%`,
                          background: status.color,
                          transition: 'all 0.3s ease'
                        }}
                      ></div>
                    </div>
                    
                    <div className="budget-details" style={{ 
                      fontSize: '0.85rem', 
                      color: status.color,
                      marginTop: '0.5rem',
                      fontWeight: 600,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span>
                        {calculatePercentage(progress.spent, budgets[category])}% used
                      </span>
                      <span>
                        {budgets[category] - progress.spent >= 0 
                          ? `${formatCurrency(budgets[category] - progress.spent)} remaining`
                          : `${formatCurrency(Math.abs(budgets[category] - progress.spent))} over budget`
                        }
                      </span>
                    </div>
                  </>
                )}
              </div>
            );
          })}

          {/* Budget Summary */}
          <div className="budget-summary" style={{ 
            background: themeStyles.cardBg,
            borderColor: themeStyles.borderColor 
          }}>
            <div className="summary-item" style={{ color: themeStyles.textPrimary }}>
              <span>Total Budget Set:</span>
              <strong>{formatCurrency(totalBudget)}</strong>
            </div>
            
            <div className="summary-item" style={{ color: themeStyles.textPrimary }}>
              <span>Total Spent:</span>
              <strong style={{ color: '#ef4444' }}>
                {formatCurrency(totalSpent)}
              </strong>
            </div>
            
            <div className="summary-item" style={{ color: themeStyles.textPrimary }}>
              <span>
                {noBudget ? 'No Budget Set' : isOverBudget ? 'Over Budget By:' : 'Total Remaining:'}
              </span>
              <strong style={{ 
                color: noBudget ? '#64748b' : isOverBudget ? '#ef4444' : '#10b981' 
              }}>
                {noBudget ? '—' : formatCurrency(Math.abs(remaining))}
              </strong>
            </div>

            {/* Status Messages */}
            {noBudget && (
              <div className="budget-alert info" style={{ color: themeStyles.textPrimary }}>
                ⚠️ Set budgets above to track your spending!
              </div>
            )}
            
            {isOverBudget && !noBudget && (
              <div className="budget-alert danger">
                🔴 You've exceeded your total budget by {calculatePercentage(Math.abs(remaining), totalBudget)}%! Consider adjusting your spending.
              </div>
            )}

            {!isOverBudget && !noBudget && remaining > 0 && (
              <div className="budget-alert success">
                ✅ Great! You're {calculatePercentage(totalSpent, totalBudget)}% through your budget with {formatCurrency(remaining)} remaining.
              </div>
            )}
          </div>

          <button onClick={onSave} className="submit-btn">
            💾 Save Budgets
          </button>
        </div>
      </div>
    </div>
  );
};

export default BudgetModal;
