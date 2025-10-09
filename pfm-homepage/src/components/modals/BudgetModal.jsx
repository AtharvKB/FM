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
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🎯 Set Monthly Budget</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="budget-form">
          <p className="budget-description">
            Set spending limits for each category to track your expenses better.
          </p>

          {Object.keys(budgets).map(category => {
            const progress = budgetProgress[category] || { spent: 0, percentage: 0 };
            const status = getBudgetStatus(progress.percentage);
            
            return (
              <div key={category} className="budget-item">
                <div className="budget-header">
                  <label>
                    {CATEGORY_ICONS[category]} {CATEGORY_LABELS[category] || category.charAt(0).toUpperCase() + category.slice(1)}
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="budget-spent">
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
                />
                
                {budgets[category] > 0 && (
                  <>
                    <div className="budget-progress">
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
          <div className="budget-summary">
            <div className="summary-item">
              <span>Total Budget Set:</span>
              <strong>{formatCurrency(totalBudget)}</strong>
            </div>
            
            <div className="summary-item">
              <span>Total Spent:</span>
              <strong style={{ color: '#ef4444' }}>
                {formatCurrency(totalSpent)}
              </strong>
            </div>
            
            <div className="summary-item">
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
              <div className="budget-alert info">
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
