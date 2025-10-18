import React from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
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

  // PDF Download Function
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(24);
    doc.setTextColor(102, 126, 234);
    doc.text('Financial Report', 14, 20);
    
    // Date
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 30, 196, 30);

    // Summary Section
    doc.setFontSize(16);
    doc.setTextColor(40);
    doc.text('Financial Summary', 14, 40);
    
    autoTable(doc, {
      startY: 45,
      head: [['Metric', 'Amount', 'Details']],
      body: [
        ['Total Income', formatCurrency(financialData.income), ''],
        ['Total Expenses', formatCurrency(financialData.expenses), `${expenseRate}% of income`],
        ['Total Savings', formatCurrency(financialData.savings), `${savingsRate}% savings rate`],
        ['Net Balance', formatCurrency(netBalance), netBalance >= 0 ? 'Positive' : 'Negative']
      ],
      theme: 'grid',
      headStyles: { fillColor: [102, 126, 234], fontSize: 12 },
      styles: { fontSize: 10 }
    });

    // Monthly Summary Table
    const startY1 = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(16);
    doc.text('Monthly Summary', 14, startY1);
    
    autoTable(doc, {
      startY: startY1 + 5,
      head: [['Month', 'Transactions', 'Income', 'Expenses', 'Savings', 'Net Balance']],
      body: [[
        new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
        transactionsCount,
        formatCurrency(financialData.income),
        formatCurrency(financialData.expenses),
        formatCurrency(financialData.savings),
        formatCurrency(netBalance)
      ]],
      theme: 'grid',
      headStyles: { fillColor: [102, 126, 234] }
    });

    // Category Breakdown
    if (categoryBreakdown.length > 0) {
      const startY2 = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(16);
      doc.text('Expense Breakdown by Category', 14, startY2);
      
      autoTable(doc, {
        startY: startY2 + 5,
        head: [['Category', 'Amount', '% of Expenses']],
        body: categoryBreakdown.map(cat => [
          cat.label,
          formatCurrency(cat.amount),
          `${cat.percentage}%`
        ]),
        theme: 'grid',
        headStyles: { fillColor: [102, 126, 234] }
      });
    }

    // Key Insights
    const startY3 = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(16);
    doc.text('Key Insights', 14, startY3);
    
    doc.setFontSize(10);
    doc.setTextColor(40);
    let yPos = startY3 + 8;
    
    doc.text(`Savings Rate: ${savingsRate >= 20 ? 'Excellent' : 'Needs Improvement'} (${savingsRate}%)`, 14, yPos);
    yPos += 7;
    doc.text(`Expense Management: ${expenseRate <= 70 ? 'Good Control' : 'High Spending'} (${expenseRate}%)`, 14, yPos);
    yPos += 7;
    doc.text(`Transaction Activity: ${transactionsCount} transactions recorded this month`, 14, yPos);
    
    if (categoryBreakdown.length > 0) {
      yPos += 7;
      doc.text(`Top Category: ${categoryBreakdown[0].label} (${formatCurrency(categoryBreakdown[0].amount)})`, 14, yPos);
    }

    // Save PDF
    doc.save(`financial-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // CSV Export Function
  const handleExportCSV = () => {
    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    
    let csvContent = "Financial Report\n";
    csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;
    
    // Summary
    csvContent += "Financial Summary\n";
    csvContent += "Metric,Amount,Details\n";
    csvContent += `Total Income,${financialData.income},\n`;
    csvContent += `Total Expenses,${financialData.expenses},${expenseRate}% of income\n`;
    csvContent += `Total Savings,${financialData.savings},${savingsRate}% savings rate\n`;
    csvContent += `Net Balance,${netBalance},${netBalance >= 0 ? 'Positive' : 'Negative'}\n\n`;
    
    // Monthly Summary
    csvContent += "Monthly Summary\n";
    csvContent += "Month,Transactions,Income,Expenses,Savings,Net Balance\n";
    csvContent += `${currentMonth},${transactionsCount},${financialData.income},${financialData.expenses},${financialData.savings},${netBalance}\n\n`;
    
    // Category Breakdown
    if (categoryBreakdown.length > 0) {
      csvContent += "Expense Breakdown by Category\n";
      csvContent += "Category,Amount,% of Expenses\n";
      categoryBreakdown.forEach(cat => {
        csvContent += `${cat.label},${cat.amount},${cat.percentage}%\n`;
      });
    }
    
    // Create and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `financial-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          <button className="close-btn" onClick={onClose} style={{ color: themeStyles.textPrimary }}>×</button>
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

              {/* Download Buttons */}
              <div className="report-actions">
                <button className="download-btn primary" onClick={handleDownloadPDF}>
                  📥 Download Full Report (PDF)
                </button>
                <button className="download-btn secondary" onClick={handleExportCSV}>
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
