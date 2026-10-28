import React, { useState, useEffect } from 'react';
import { createGoalApi, updateGoalApi, depositToGoalApi } from '../services/api';
import { Target, Check, DollarSign } from 'lucide-react';

const GOAL_CATEGORIES = [
  'Savings',
  'Emergency Fund',
  'Gadget & Tech',
  'Travel & Vacation',
  'Vehicle',
  'Home & Real Estate',
  'Education',
  'Investment',
  'Other',
];

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#06b6d4', '#ec4899', '#8b5cf6', '#ef4444'];

const GoalModal = ({ isOpen, onClose, onSuccess, initialData = null, depositMode = false, currency = '$' }) => {
  const isEditing = Boolean(initialData && initialData._id && !depositMode);

  const [formData, setFormData] = useState({
    title: '',
    targetAmount: '',
    currentAmount: '',
    deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    category: 'Savings',
    color: '#4f46e5',
  });

  const [depositAmount, setDepositAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        targetAmount: initialData.targetAmount || '',
        currentAmount: initialData.currentAmount || '',
        deadline: initialData.deadline ? new Date(initialData.deadline).toISOString().slice(0, 10) : '',
        category: initialData.category || 'Savings',
        color: initialData.color || '#4f46e5',
      });
    } else {
      setFormData({
        title: '',
        targetAmount: '',
        currentAmount: '',
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        category: 'Savings',
        color: '#4f46e5',
      });
    }
    setDepositAmount('');
    setError('');
  }, [initialData, isOpen, depositMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (depositMode) {
        if (!depositAmount || Number(depositAmount) <= 0) {
          setError('Please provide a valid deposit amount');
          setLoading(false);
          return;
        }
        await depositToGoalApi(initialData._id, parseFloat(depositAmount));
      } else if (isEditing) {
        await updateGoalApi(initialData._id, {
          ...formData,
          targetAmount: parseFloat(formData.targetAmount),
          currentAmount: parseFloat(formData.currentAmount || 0),
        });
      } else {
        if (!formData.title || !formData.targetAmount || !formData.deadline) {
          setError('Please fill in title, target amount, and deadline');
          setLoading(false);
          return;
        }
        await createGoalApi({
          ...formData,
          targetAmount: parseFloat(formData.targetAmount),
          currentAmount: parseFloat(formData.currentAmount || 0),
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error processing goal request');
    } finally {
      setLoading(false);
    }
  };

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
              <span>
                {depositMode
                  ? `Add Funds to "${initialData?.title}"`
                  : isEditing
                  ? 'Edit Savings Goal'
                  : 'Create New Savings Goal'}
              </span>
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

              {depositMode ? (
                /* Deposit Mode */
                <div>
                  <div className="p-3 bg-light rounded-3 mb-3">
                    <div className="small text-muted">Current Progress</div>
                    <div className="fw-bold fs-5 text-dark">
                      {currency}
                      {initialData?.currentAmount?.toLocaleString()} / {currency}
                      {initialData?.targetAmount?.toLocaleString()}
                    </div>
                    <div className="small text-muted mt-1">
                      Remaining needed: {currency}
                      {Math.max(0, initialData?.targetAmount - initialData?.currentAmount)?.toLocaleString()}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">
                      Amount to Deposit ({currency}) *
                    </label>
                    <div className="input-group">
                      <span className="input-group-text fw-bold">{currency}</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.00"
                        className="form-control"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Create / Edit Goal */
                <div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Goal Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Emergency Fund, New MacBook, Japan Trip"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-secondary">
                        Target Amount ({currency}) *
                      </label>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        placeholder="5000"
                        className="form-control"
                        value={formData.targetAmount}
                        onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-semibold text-secondary">
                        Initial Saved ({currency})
                      </label>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        placeholder="0"
                        className="form-control"
                        value={formData.currentAmount}
                        onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-secondary">Category</label>
                      <select
                        className="form-select"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        {GOAL_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-semibold text-secondary">Target Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-semibold text-secondary">Accent Color</label>
                    <div className="d-flex gap-2">
                      {COLORS.map((c) => (
                        <div
                          key={c}
                          className="rounded-circle cursor-pointer border"
                          style={{
                            width: '28px',
                            height: '28px',
                            backgroundColor: c,
                            cursor: 'pointer',
                            outline: formData.color === c ? '3px solid #0f172a' : 'none',
                          }}
                          onClick={() => setFormData({ ...formData, color: c })}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
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
                <span>
                  {loading
                    ? 'Saving...'
                    : depositMode
                    ? 'Deposit Funds'
                    : isEditing
                    ? 'Update Goal'
                    : 'Create Goal'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GoalModal;
