import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const PALETTE = [
  '#4f46e5',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
  '#64748b',
];

export const MonthlyTrendChart = ({ data, currency = '$' }) => {
  if (!data || data.length === 0) {
    return <div className="text-muted text-center py-4">No monthly trend data available.</div>;
  }

  const chartData = {
    labels: data.map((d) => d.label),
    datasets: [
      {
        label: 'Income',
        data: data.map((d) => d.income),
        backgroundColor: 'rgba(16, 185, 129, 0.85)',
        borderRadius: 6,
      },
      {
        label: 'Expense',
        data: data.map((d) => d.expense),
        backgroundColor: 'rgba(239, 68, 68, 0.85)',
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 12,
          font: { family: "'Plus Jakarta Sans', sans-serif", weight: '500' },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${currency}${context.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
      },
      y: {
        grid: { color: 'rgba(226, 232, 240, 0.6)' },
        ticks: {
          callback: (value) => `${currency}${value}`,
        },
      },
    },
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export const CategoryDoughnutChart = ({ data, currency = '$' }) => {
  if (!data || data.length === 0) {
    return <div className="text-muted text-center py-4">No expense categories to show yet.</div>;
  }

  const chartData = {
    labels: data.map((d) => d._id),
    datasets: [
      {
        data: data.map((d) => d.total),
        backgroundColor: PALETTE.slice(0, data.length),
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 12,
          font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.label}: ${currency}${context.raw.toLocaleString()}`,
        },
      },
    },
    cutout: '65%',
  };

  return (
    <div style={{ height: '260px', width: '100%' }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

export const PaymentMethodChart = ({ data, currency = '$' }) => {
  if (!data || data.length === 0) {
    return <div className="text-muted text-center py-4">No payment method data available.</div>;
  }

  const chartData = {
    labels: data.map((d) => d._id),
    datasets: [
      {
        data: data.map((d) => d.total),
        backgroundColor: ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#94a3b8'],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 10,
          font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.label}: ${currency}${context.raw.toLocaleString()}`,
        },
      },
    },
    cutout: '60%',
  };

  return (
    <div style={{ height: '240px', width: '100%' }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
};
