import React, { useEffect, useState } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  AlertCircle,
  PlusCircle,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  UploadCloud,
  Flag,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { MonthlyTrendChart, CategoryDoughnutChart } from '../components/ExpenseCharts';
import { getDashboardStatsApi, getTransactionsApi, getBudgetsApi, deleteTransactionApi } from '../services/api';
import TransactionList from '../components/TransactionList';
import AIAdvisorCard from '../components/AIAdvisorCard';

const Dashboard = ({
  currency = '$',
  onOpenAddModal,
  onOpenImportModal,
  onOpenAdvisorChat,
  setActiveTab,
  onEditTransaction,
}) => {
  const [stats, setStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, txRes, budgetRes] = await Promise.all([
        getDashboardStatsApi(),
        getTransactionsApi({ limit: 5, sortBy: 'date', sortOrder: 'desc' }),
        getBudgetsApi(),
      ]);

      setStats(statsRes.data.data);
      setRecentTransactions(txRes.data.data);
      setBudgets(budgetRes.data.data);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDeleteTransaction = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteTransactionApi(id);
        fetchDashboardData();
      } catch (err) {
        alert('Failed to delete transaction');
      }
    }
  };

  const warningBudgets = budgets.filter((b) => b.percentage >= 80);

  return (
    <div className="container-fluid px-lg-4 py-4">
      {/* Welcome Banner & Quick Actions */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold tracking-tight mb-1">Financial Intelligence Overview</h2>
          <p className="text-muted small mb-0">
            Real-time tracking of your income, expenses, AI insights, and savings goals.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-outline-primary d-flex align-items-center gap-2"
            onClick={onOpenAdvisorChat}
          >
            <Sparkles size={16} />
            <span>Ask Advisor</span>
          </button>
          <button
            className="btn btn-outline-secondary d-flex align-items-center gap-2"
            onClick={onOpenImportModal}
          >
            <UploadCloud size={16} />
            <span>Import CSV</span>
          </button>
          <button className="btn btn-primary d-flex align-items-center gap-2 shadow-sm" onClick={onOpenAddModal}>
            <PlusCircle size={17} />
            <span>Record Transaction</span>
          </button>
        </div>
      </div>

      {/* AI Financial Health Advisor Diagnostic Card */}
      <AIAdvisorCard currency={currency} onOpenAdvisorChat={onOpenAdvisorChat} />

      {/* Budget Over-Limit Warning Alerts */}
      {warningBudgets.length > 0 && (
        <div className="alert alert-warning border-0 shadow-sm rounded-4 mb-4 d-flex align-items-start gap-3">
          <ShieldAlert className="text-warning flex-shrink-0 mt-1" size={22} />
          <div className="flex-grow-1">
            <h6 className="fw-bold mb-1">Budget Alerts for Current Month</h6>
            <div className="small">
              {warningBudgets.map((b) => (
                <span key={b._id} className="me-3 d-inline-block">
                  <strong>{b.category}</strong>: {b.percentage}% spent ({currency}
                  {b.spent.toLocaleString()} / {currency}{b.limit.toLocaleString()})
                  {b.percentage >= 100 && (
                    <span className="badge bg-danger ms-1">Over Budget</span>
                  )}
                </span>
              ))}
            </div>
          </div>
          <button
            className="btn btn-outline-dark btn-sm"
            onClick={() => setActiveTab('budgets')}
          >
            Manage
          </button>
        </div>
      )}

      {/* Top Stat Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Total Balance"
            amount={stats?.netBalance || 0}
            subtitle={stats?.netBalance >= 0 ? 'Surplus / Net Worth' : 'Deficit'}
            icon={Wallet}
            color={stats?.netBalance >= 0 ? 'primary' : 'danger'}
            currency={currency}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Total Income"
            amount={stats?.totalIncome || 0}
            subtitle="All time inflow"
            icon={TrendingUp}
            color="success"
            currency={currency}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Total Expenses"
            amount={stats?.totalExpense || 0}
            subtitle="All time spending"
            icon={TrendingDown}
            color="danger"
            currency={currency}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Savings Rate"
            amount={stats?.savingsRate || 0}
            subtitle={
              stats?.savingsRate >= 20 ? 'Healthy savings habit 🎯' : 'Target: 20%+ of income'
            }
            icon={PiggyBank}
            color="info"
            currency="%"
          />
        </div>
      </div>

      {/* Visual Analytics Row */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-8">
          <div className="card h-100 p-4 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-bold mb-0">Income vs Expense Trend</h5>
                <small className="text-muted">Monthly financial flow comparison</small>
              </div>
              <button
                className="btn btn-link btn-sm text-decoration-none"
                onClick={() => setActiveTab('analytics')}
              >
                Deep Analytics
              </button>
            </div>
            <MonthlyTrendChart data={stats?.monthlyTrend || []} currency={currency} />
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card h-100 p-4 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-bold mb-0">Expense by Category</h5>
                <small className="text-muted">Where your money goes</small>
              </div>
            </div>
            <CategoryDoughnutChart data={stats?.categoryBreakdown || []} currency={currency} />
          </div>
        </div>
      </div>

      {/* Recent Transactions Feed */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">Recent Transactions</h5>
        <button
          className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
          onClick={() => setActiveTab('transactions')}
        >
          <span>View All Transactions</span>
          <ArrowRight size={14} />
        </button>
      </div>

      <TransactionList
        transactions={recentTransactions}
        loading={loading}
        currency={currency}
        onEdit={onEditTransaction}
        onDelete={handleDeleteTransaction}
        onOpenAddModal={onOpenAddModal}
      />
    </div>
  );
};

export default Dashboard;
