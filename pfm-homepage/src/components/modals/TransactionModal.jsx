import React from 'react';
import { isValidAmount, isRequired } from '../../utils/validators';
import { CATEGORY_ICONS, CATEGORY_LABELS, TYPE_ICONS } from '../../utils/constants';

const TransactionModal = ({ 
  show, 
  onClose, 
  transactionForm, 
  setTransactionForm, 
  onSubmit 
}) => {
  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate using utility functions
    if (!isValidAmount(transactionForm.amount)) {
      alert('Please enter a valid amount greater than 0');
      return;
    }
    
    if (!isRequired(transactionForm.description)) {
      alert('Please enter a description');
      return;
    }
    
    // Call the parent's onSubmit if validation passes
    onSubmit(e);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>➕ Add Transaction</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          {/* Transaction Type Selector */}
          <div className="form-group">
            <label>Transaction Type *</label>
            <div className="type-selector-three">
              <button
                type="button"
                className={`type-btn ${transactionForm.type === 'income' ? 'active income' : ''}`}
                onClick={() => setTransactionForm({
                  ...transactionForm, 
                  type: 'income',
                  category: 'salary' // Auto-set category for income
                })}
              >
                {TYPE_ICONS.income} Income
              </button>
              <button
                type="button"
                className={`type-btn ${transactionForm.type === 'expense' ? 'active expense' : ''}`}
                onClick={() => setTransactionForm({
                  ...transactionForm, 
                  type: 'expense',
                  category: 'food' // Auto-set category for expense
                })}
              >
                {TYPE_ICONS.expense} Expense
              </button>
              <button
                type="button"
                className={`type-btn ${transactionForm.type === 'savings' ? 'active savings' : ''}`}
                onClick={() => setTransactionForm({
                  ...transactionForm, 
                  type: 'savings',
                  category: 'other' // Auto-set category for savings
                })}
              >
                {TYPE_ICONS.savings} Savings
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div className="form-group">
            <label htmlFor="amount">Amount (₹) *</label>
            <input
              id="amount"
              type="number"
              value={transactionForm.amount}
              onChange={(e) => setTransactionForm({...transactionForm, amount: e.target.value})}
              placeholder="Enter amount"
              min="0"
              step="0.01"
              required
              autoFocus
            />
          </div>

          {/* Category Selection - Show only for expenses */}
          {transactionForm.type === 'expense' && (
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                value={transactionForm.category}
                onChange={(e) => setTransactionForm({...transactionForm, category: e.target.value})}
                required
              >
                <option value="food">{CATEGORY_ICONS.food} {CATEGORY_LABELS.food}</option>
                <option value="transport">{CATEGORY_ICONS.transport} {CATEGORY_LABELS.transport}</option>
                <option value="shopping">{CATEGORY_ICONS.shopping} {CATEGORY_LABELS.shopping}</option>
                <option value="bills">{CATEGORY_ICONS.bills} {CATEGORY_LABELS.bills}</option>
                <option value="other">{CATEGORY_ICONS.other} {CATEGORY_LABELS.other}</option>
              </select>
            </div>
          )}

          {/* Show category for income (read-only info) */}
          {transactionForm.type === 'income' && (
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={transactionForm.category}
                onChange={(e) => setTransactionForm({...transactionForm, category: e.target.value})}
              >
                <option value="salary">{CATEGORY_ICONS.salary} {CATEGORY_LABELS.salary}</option>
                <option value="other">{CATEGORY_ICONS.other} {CATEGORY_LABELS.other}</option>
              </select>
            </div>
          )}

          {/* Show category for savings */}
          {transactionForm.type === 'savings' && (
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={transactionForm.category}
                onChange={(e) => setTransactionForm({...transactionForm, category: e.target.value})}
              >
                <option value="other">{CATEGORY_ICONS.other} {CATEGORY_LABELS.other}</option>
              </select>
            </div>
          )}

          {/* Description Input */}
          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <input
              id="description"
              type="text"
              value={transactionForm.description}
              onChange={(e) => setTransactionForm({...transactionForm, description: e.target.value})}
              placeholder={
                transactionForm.type === 'income' 
                  ? 'e.g., Monthly salary, Freelance work' 
                  : transactionForm.type === 'expense'
                  ? 'e.g., Groceries, Uber ride'
                  : 'e.g., Emergency fund, Investment'
              }
              maxLength="100"
              required
            />
            <small className="form-hint">
              {transactionForm.description.length}/100 characters
            </small>
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-btn">
            ✅ Add Transaction
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
