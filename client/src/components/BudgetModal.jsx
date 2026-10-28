import React, { useState } from 'react';
import { setBudgetApi } from '../services/api';
import { Target, Check } from 'lucide-react';

const BUDGET_CATEGORIES = [
  'Housing & Rent',
  'Groceries',
  'Food & Dining',
  'Utilities',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Healthcare',
  'Education',
  'Personal Care',
  'Travel',
  'Other Expense',
];

const BudgetModal = ({ isOpen, onClose, onSuccess, currentMonth, currency = '$' }) => {
  const [category, setCategory] = useState(BUDGET_CATEGORIES[0]);
  const [limit, setLimit] = useState('');
  const [month, setMonth] = useState(currentMonth || new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!limit || Number(limit) <= 0) {
      setError('Please provide a valid budget limit');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await setBudgetApi({
        category,
        limit: parseFloat(limit),
        month,
      });
      onSuccess();
      onClose();
      setLimit('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving budget');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)' }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow border-0 rounded-4">
          <div className="modal-header border-bottom-0 pb-0">
            <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
              <Target size={20} className="text-primary" />
              <span>Set Monthly Budget Goal</span>
            </h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body pt-3">
              {error && (
                <div className="alert alert-danger py-2 small rounded-3 mb-3">{error}</div>
              )}

              {/* Month Selector */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Target Month</label>
                <input
                  type="month"
                  className="form-control"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  required
                />
              </div>

              {/* Category */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">
                  Expense Category
                </label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {BUDGET_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Limit Amount */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">
                  Monthly Limit ({currency})
                </label>
                <div className="input-group">
                  <span className="input-group-text fw-bold">{currency}</span>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    placeholder="e.g. 500"
                    className="form-control"
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                    required
                  />
                </div>
                <div className="form-text small text-muted">
                  We will track spending against this limit and notify you when nearing or exceeding it.
                </div>
              </div>
            </div>

            <div className="modal-footer border-top-0 pt-0">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary d-flex align-items-center gap-2"
                disabled={loading}
              >
                <Check size={16} />
                <span>{loading ? 'Saving...' : 'Save Budget Goal'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BudgetModal;
