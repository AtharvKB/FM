import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MonthlyBarChart = ({ transactions }) => {
  const getMonthlyData = () => {
    const months = {};
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      months[monthKey] = { income: 0, expenses: 0, savings: 0 };
    }

    transactions.forEach(txn => {
      const date = new Date(txn.date);
      const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      
      if (months[monthKey]) {
        if (txn.type === 'income') months[monthKey].income += txn.amount;
        else if (txn.type === 'expense') months[monthKey].expenses += txn.amount;
        else if (txn.type === 'savings') months[monthKey].savings += txn.amount;
      }
    });

    return months;
  };

  const monthlyData = getMonthlyData();

  const data = {
    labels: Object.keys(monthlyData),
    datasets: [
      {
        label: 'Income',
        data: Object.values(monthlyData).map(m => m.income),
        backgroundColor: '#10b981',
        borderRadius: 8,
      },
      {
        label: 'Expenses',
        data: Object.values(monthlyData).map(m => m.expenses),
        backgroundColor: '#ef4444',
        borderRadius: 8,
      },
      {
        label: 'Savings',
        data: Object.values(monthlyData).map(m => m.savings),
        backgroundColor: '#3b82f6',
        borderRadius: 8,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ₹${context.parsed.y.toLocaleString()}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (value) => '₹' + (value / 1000) + 'k' }
      }
    }
  };

  return <div className="chart-container"><Bar data={data} options={options} /></div>;
};

export default MonthlyBarChart;
