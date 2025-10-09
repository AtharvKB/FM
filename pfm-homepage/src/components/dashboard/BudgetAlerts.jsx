import React from 'react';
import './BudgetAlerts.css';
import { formatCurrency } from '../../utils/formatters';
import { CATEGORY_ICONS, CATEGORY_LABELS, CATEGORY_COLORS } from '../../utils/constants';

const BudgetAlerts = ({ budgetProgress, onViewBudget }) => {
  const alerts = [];

  // Check each category for alerts
  Object.entries(budgetProgress).forEach(([category, data]) => {
    if (data.budget === 0) return; // Skip if no budget set

    const percentage = data.percentage;
    const remaining = data.budget - data.spent;
    const categoryIcon = CATEGORY_ICONS[category] || '📦';
    const categoryLabel = CATEGORY_LABELS[category] || category.charAt(0).toUpperCase() + category.slice(1);
    const categoryColor = CATEGORY_COLORS[category] || '#64748b';

    if (percentage >= 100) {
      alerts.push({
        category,
        type: 'danger',
        icon: '🔴',
        categoryIcon,
        categoryLabel,
        categoryColor,
        message: `${categoryIcon} ${categoryLabel} budget exceeded!`,
        details: `Spent ${formatCurrency(data.spent)} of ${formatCurrency(data.budget)} budget`,
        overspent: formatCurrency(data.spent - data.budget),
        percentage
      });
    } else if (percentage >= 80) {
      alerts.push({
        category,
        type: 'warning',
        icon: '⚠️',
        categoryIcon,
        categoryLabel,
        categoryColor,
        message: `${categoryIcon} ${categoryLabel} budget almost reached`,
        details: `${formatCurrency(remaining)} remaining (${Math.round(percentage)}% used)`,
        percentage
      });
    }
  });

  if (alerts.length === 0) {
    return null; // No alerts to show
  }

  return (
    <div className="budget-alerts-container">
      <div className="budget-alerts-header">
        <h3>💰 Budget Alerts</h3>
        <button className="view-budget-btn" onClick={onViewBudget}>
          View Budget
        </button>
      </div>

      <div className="alerts-list">
        {alerts.map((alert, index) => (
          <div key={index} className={`alert-card ${alert.type}`}>
            <div className="alert-icon-wrapper">
              <div className="alert-status-icon">{alert.icon}</div>
              <div 
                className="alert-category-icon"
                style={{ 
                  background: alert.categoryColor,
                  opacity: 0.15 
                }}
              >
                <span style={{ opacity: 1 }}>{alert.categoryIcon}</span>
              </div>
            </div>
            
            <div className="alert-content">
              <h4 className="alert-message">{alert.message}</h4>
              <p className="alert-details">{alert.details}</p>
              
              {alert.type === 'danger' && (
                <p className="alert-overspent">
                  Over budget by {alert.overspent}
                </p>
              )}
              
              <div className="alert-progress-bar">
                <div 
                  className={`alert-progress-fill ${alert.type}`}
                  style={{ 
                    width: `${Math.min(alert.percentage, 100)}%`,
                    background: alert.type === 'danger' ? '#ef4444' : '#f59e0b'
                  }}
                >
                  {alert.percentage > 10 && (
                    <span className="alert-percentage">{Math.round(alert.percentage)}%</span>
                  )}
                </div>
              </div>
              
              {alert.percentage <= 10 && (
                <span className="alert-percentage-outside">{Math.round(alert.percentage)}%</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary footer */}
      <div className="alerts-footer">
        <p className="alerts-count">
          {alerts.length} budget alert{alerts.length > 1 ? 's' : ''} requiring attention
        </p>
      </div>
    </div>
  );
};

export default BudgetAlerts;
