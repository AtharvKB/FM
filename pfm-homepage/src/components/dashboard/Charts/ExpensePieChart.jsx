import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { CATEGORY_COLORS } from '../../../utils/constants';

ChartJS.register(ArcElement, Tooltip, Legend);

const ExpensePieChart = ({ transactions }) => {
  const getCategoryData = () => {
    const categoryTotals = {};
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(txn => {
        categoryTotals[txn.category] = (categoryTotals[txn.category] || 0) + txn.amount;
      });

    return categoryTotals;
  };

  const categoryData = getCategoryData();
  const categories = Object.keys(categoryData);
  
  if (categories.length === 0) {
    return (
      <div className="empty-chart">
        <p>💳 No expense data available</p>
      </div>
    );
  }

  const data = {
    labels: categories.map(cat => 
      cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, ' ')
    ),
    datasets: [{
      label: 'Expenses',
      data: Object.values(categoryData),
      backgroundColor: categories.map(cat => CATEGORY_COLORS[cat] || '#64748b'),
      borderColor: '#ffffff',
      borderWidth: 3,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12,
            family: "'Inter', 'Segoe UI', sans-serif"
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ₹${value.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="chart-container">
      <Pie data={data} options={options} />
    </div>
  );
};

export default ExpensePieChart;
