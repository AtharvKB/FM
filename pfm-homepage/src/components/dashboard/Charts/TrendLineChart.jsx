import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const TrendLineChart = ({ transactions }) => {
  const getDailyData = () => {
    const days = {};
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateKey = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      days[dateKey] = { income: 0, expenses: 0 };
    }

    transactions.forEach(txn => {
      const date = new Date(txn.date);
      const dateKey = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      
      if (days[dateKey] !== undefined) {
        if (txn.type === 'income') days[dateKey].income += txn.amount;
        else if (txn.type === 'expense') days[dateKey].expenses += txn.amount;
      }
    });

    return days;
  };

  const dailyData = getDailyData();

  const data = {
    labels: Object.keys(dailyData),
    datasets: [
      {
        label: 'Income',
        data: Object.values(dailyData).map(d => d.income),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Expenses',
        data: Object.values(dailyData).map(d => d.expenses),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (value) => '₹' + (value / 1000) + 'k' }
      }
    }
  };

  return <div className="chart-container"><Line data={data} options={options} /></div>;
};

export default TrendLineChart;
