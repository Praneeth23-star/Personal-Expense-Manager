import React, { useState, useEffect } from 'react';
import { getDashboardStatsApi } from '../services/api';
import {
  MonthlyTrendChart,
  CategoryDoughnutChart,
  PaymentMethodChart,
} from '../components/ExpenseCharts';
import { TrendingUp, TrendingDown, CreditCard, PieChart, Award } from 'lucide-react';

const AnalyticsPage = ({ currency = '$' }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await getDashboardStatsApi();
        setStats(res.data.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="container-fluid px-lg-4 py-5 text-center">
        <div className="spinner-border text-primary mx-auto mb-2" role="status"></div>
        <p className="text-muted">Calculating analytics...</p>
      </div>
    );
  }

  const topCategory = stats?.categoryBreakdown?.[0];
  const topPaymentMethod = stats?.paymentMethodStats?.[0];

  return (
    <div className="container-fluid px-lg-4 py-4">
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold tracking-tight mb-1">Financial Intelligence & Analytics</h2>
        <p className="text-muted small mb-0">
          In-depth breakdown of your cash inflows, spending patterns, and payment preferences.
        </p>
      </div>

      {/* Quick Insights Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card p-3 h-100">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-danger bg-opacity-10 text-danger p-3 rounded-3">
                <TrendingDown size={24} />
              </div>
              <div>
                <div className="text-muted small text-uppercase fw-semibold">Highest Expense Category</div>
                <div className="fw-bold fs-5 text-dark">
                  {topCategory ? topCategory._id : 'N/A'}
                </div>
                {topCategory && (
                  <div className="text-muted small">
                    {currency}{topCategory.total.toLocaleString()} ({topCategory.count} purchases)
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card p-3 h-100">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-3">
                <CreditCard size={24} />
              </div>
              <div>
                <div className="text-muted small text-uppercase fw-semibold">Preferred Payment Method</div>
                <div className="fw-bold fs-5 text-dark">
                  {topPaymentMethod ? topPaymentMethod._id : 'N/A'}
                </div>
                {topPaymentMethod && (
                  <div className="text-muted small">
                    {currency}{topPaymentMethod.total.toLocaleString()} spent
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card p-3 h-100">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-success bg-opacity-10 text-success p-3 rounded-3">
                <Award size={24} />
              </div>
              <div>
                <div className="text-muted small text-uppercase fw-semibold">Total Savings Rate</div>
                <div className="fw-bold fs-5 text-dark">
                  {stats?.savingsRate || 0}%
                </div>
                <div className="text-muted small">
                  Net Balance: {currency}{Number(stats?.netBalance || 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <div className="card p-4 mb-4 shadow-sm">
        <h5 className="fw-bold mb-1">Monthly Cashflow Trend (Past 6 Months)</h5>
        <p className="text-muted small mb-3">
          Compare income vs expense fluctuations across months.
        </p>
        <MonthlyTrendChart data={stats?.monthlyTrend || []} currency={currency} />
      </div>

      {/* Breakdowns Row */}
      <div className="row g-4">
        <div className="col-12 col-lg-6">
          <div className="card p-4 h-100 shadow-sm">
            <h5 className="fw-bold mb-1">Expense by Category Breakdown</h5>
            <p className="text-muted small mb-3">
              Distribution of expenses across spending categories.
            </p>
            <CategoryDoughnutChart data={stats?.categoryBreakdown || []} currency={currency} />
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card p-4 h-100 shadow-sm">
            <h5 className="fw-bold mb-1">Payment Method Distribution</h5>
            <p className="text-muted small mb-3">
              Breakdown by payment channels (Credit Card, UPI, Cash, etc.).
            </p>
            <PaymentMethodChart data={stats?.paymentMethodStats || []} currency={currency} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
