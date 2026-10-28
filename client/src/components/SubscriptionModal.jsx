import React, { useState, useEffect } from 'react';
import { createSubscriptionApi, updateSubscriptionApi } from '../services/api';
import { RefreshCw, Check } from 'lucide-react';

const SUB_CATEGORIES = [
  'Entertainment',
  'Utilities',
  'Software & Cloud',
  'Health & Fitness',
  'Education',
  'Insurance',
  'Housing & Rent',
  'Other',
];

const SubscriptionModal = ({ isOpen, onClose, onSuccess, initialData = null, currency = '$' }) => {
  const isEditing = Boolean(initialData && initialData._id);

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    billingCycle: 'monthly',
    category: 'Entertainment',
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    autoRenew: true,
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        amount: initialData.amount || '',
        billingCycle: initialData.billingCycle || 'monthly',
        category: initialData.category || 'Entertainment',
        nextBillingDate: initialData.nextBillingDate
          ? new Date(initialData.nextBillingDate).toISOString().slice(0, 10)
          : '',
        autoRenew: initialData.autoRenew !== undefined ? Boolean(initialData.autoRenew) : true,
        notes: initialData.notes || '',
      });
    } else {
      setFormData({
        name: '',
        amount: '',
        billingCycle: 'monthly',
        category: 'Entertainment',
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        autoRenew: true,
        notes: '',
      });
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.amount || !formData.nextBillingDate) {
      setError('Please fill in name, amount, and next billing date');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
      };

      if (isEditing) {
        await updateSubscriptionApi(initialData._id, payload);
      } else {
        await createSubscriptionApi(payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving subscription');
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
              <RefreshCw size={20} className="text-primary" />
              <span>{isEditing ? 'Edit Recurring Bill' : 'Add Recurring Bill / Subscription'}</span>
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
              {error && <div className="alert alert-danger py-2 small rounded-3 mb-3">{error}</div>}

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">
                  Service / Bill Name *
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Netflix, Spotify, Gym, Fiber Internet"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-semibold text-secondary">
                    Billing Cost ({currency}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="15.00"
                    className="form-control"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>

                <div className="col-6">
                  <label className="form-label small fw-semibold text-secondary">Billing Cycle</label>
                  <select
                    className="form-select"
                    value={formData.billingCycle}
                    onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
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
                    {SUB_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-6">
                  <label className="form-label small fw-semibold text-secondary">
                    Next Due Date *
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.nextBillingDate}
                    onChange={(e) => setFormData({ ...formData, nextBillingDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Notes (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Family tier, 4K screen, login memo..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="form-check form-switch mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="autoRenewSwitch"
                  checked={formData.autoRenew}
                  onChange={(e) => setFormData({ ...formData, autoRenew: e.target.checked })}
                />
                <label className="form-check-label small text-muted" htmlFor="autoRenewSwitch">
                  Automatic renewal enabled
                </label>
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
                <span>{loading ? 'Saving...' : isEditing ? 'Update Bill' : 'Save Bill'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
