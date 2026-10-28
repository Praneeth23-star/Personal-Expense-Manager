import React, { useState, useEffect } from 'react';
import { getBudgetsApi, deleteBudgetApi } from '../services/api';
import { Target, PlusCircle, AlertTriangle, CheckCircle, Trash2, Calendar } from 'lucide-react';

const BudgetsPage = ({ currency = '$', onOpenBudgetModal, currentMonth, setCurrentMonth }) => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const res = await getBudgetsApi(currentMonth);
      setBudgets(res.data.data);
    } catch (err) {
      console.error('Error fetching budgets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [currentMonth]);

  const handleDeleteBudget = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget goal?')) {
      try {
        await deleteBudgetApi(id);
        fetchBudgets();
      } catch (err) {
        alert('Failed to delete budget');
      }
    }
  };

  const totalBudgeted = budgets.reduce((acc, b) => acc + b.limit, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  const overallPercentage = totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0;

  return (
    <div className="container-fluid px-lg-4 py-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold tracking-tight mb-1">Monthly Budgets & Goals</h2>
          <p className="text-muted small mb-0">
            Keep your spending on track with category limits and visual alerts.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          {/* Month selector */}
          <div className="input-group input-group-sm" style={{ width: '180px' }}>
            <span className="input-group-text bg-white">
              <Calendar size={14} />
            </span>
            <input
              type="month"
              className="form-control"
              value={currentMonth}
              onChange={(e) => setCurrentMonth(e.target.value)}
            />
          </div>

          <button
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={onOpenBudgetModal}
          >
            <PlusCircle size={16} />
            <span>Set Budget Goal</span>
          </button>
        </div>
      </div>

      {/* Overview Progress Card */}
      {budgets.length > 0 && (
        <div className="card p-4 mb-4 shadow-sm">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div>
              <span className="text-muted small fw-bold text-uppercase">
                Overall Budget Health ({currentMonth})
              </span>
              <h4 className="fw-bold mb-0">
                {currency}
                {totalSpent.toLocaleString()} spent of {currency}
                {totalBudgeted.toLocaleString()} limit
              </h4>
            </div>
            <span
              className={`fs-5 fw-bold ${
                overallPercentage >= 100
                  ? 'text-danger'
                  : overallPercentage >= 80
                  ? 'text-warning'
                  : 'text-success'
              }`}
            >
              {overallPercentage}%
            </span>
          </div>
          <div className="progress" style={{ height: '12px' }}>
            <div
              className={`progress-bar ${
                overallPercentage >= 100
                  ? 'bg-danger'
                  : overallPercentage >= 80
                  ? 'bg-warning'
                  : 'bg-success'
              }`}
              role="progressbar"
              style={{ width: `${Math.min(overallPercentage, 100)}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Category Budgets Grid */}
      {loading ? (
        <div className="card p-5 text-center">
          <div className="spinner-border text-primary mx-auto mb-2" role="status"></div>
          <p className="text-muted mb-0">Loading budgets...</p>
        </div>
      ) : budgets.length === 0 ? (
        <div className="card p-5 text-center shadow-sm">
          <div className="bg-light text-primary p-3 rounded-circle d-inline-block mx-auto mb-3">
            <Target size={40} />
          </div>
          <h5 className="fw-bold mb-1">No budgets set for this month</h5>
          <p className="text-muted small mb-3">
            Create spending targets for categories like Groceries, Dining, and Rent.
          </p>
          <div>
            <button className="btn btn-primary btn-sm" onClick={onOpenBudgetModal}>
              Create Budget Goal
            </button>
          </div>
        </div>
      ) : (
        <div className="row g-3">
          {budgets.map((b) => {
            const isExceeded = b.percentage >= 100;
            const isWarning = b.percentage >= 80 && !isExceeded;

            return (
              <div key={b._id} className="col-12 col-md-6 col-xl-4">
                <div className="card card-hover h-100 p-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h6 className="fw-bold mb-1 text-dark">{b.category}</h6>
                      <span className="text-muted small">
                        Limit: {currency}
                        {b.limit.toLocaleString()}
                      </span>
                    </div>
                    <button
                      className="btn btn-outline-danger btn-sm p-1 border-0"
                      title="Delete Budget"
                      onClick={() => handleDeleteBudget(b._id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Amount Spent & Progress */}
                  <div className="my-2">
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="text-muted">
                        Spent: {currency}
                        {b.spent.toLocaleString()}
                      </span>
                      <span
                        className={`fw-bold ${
                          isExceeded ? 'text-danger' : isWarning ? 'text-warning' : 'text-success'
                        }`}
                      >
                        {b.percentage}%
                      </span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div
                        className={`progress-bar ${
                          isExceeded ? 'bg-danger' : isWarning ? 'bg-warning' : 'bg-primary'
                        }`}
                        role="progressbar"
                        style={{ width: `${Math.min(b.percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                    {isExceeded ? (
                      <span className="badge bg-danger bg-opacity-10 text-danger border border-danger small d-flex align-items-center gap-1">
                        <AlertTriangle size={12} />
                        <span>Over by {currency}{(b.spent - b.limit).toLocaleString()}</span>
                      </span>
                    ) : isWarning ? (
                      <span className="badge bg-warning bg-opacity-10 text-warning border border-warning small d-flex align-items-center gap-1">
                        <AlertTriangle size={12} />
                        <span>Near Limit ({currency}{b.remaining.toLocaleString()} left)</span>
                      </span>
                    ) : (
                      <span className="badge bg-success bg-opacity-10 text-success border border-success small d-flex align-items-center gap-1">
                        <CheckCircle size={12} />
                        <span>On Track ({currency}{b.remaining.toLocaleString()} left)</span>
                      </span>
                    )}

                    <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                      {b.month}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BudgetsPage;
