import React, { useState, useEffect } from 'react';
import { createTransactionApi, updateTransactionApi } from '../services/api';
import { X, Check } from 'lucide-react';

const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Groceries',
  'Housing & Rent',
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

const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Investments',
  'Business',
  'Bonus',
  'Gift / Grants',
  'Rental Income',
  'Other Income',
];

const PAYMENT_METHODS = [
  'Credit Card',
  'Debit Card',
  'Cash',
  'UPI / NetBanking',
  'Check',
  'Other',
];

const TransactionModal = ({ isOpen, onClose, onSuccess, initialData = null, currency = '$' }) => {
  const isEditing = Boolean(initialData && initialData._id);

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'expense',
    category: 'Food & Dining',
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: 'Credit Card',
    notes: '',
    isRecurring: false,
    receiptImage: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        amount: initialData.amount || '',
        type: initialData.type || 'expense',
        category: initialData.category || 'Food & Dining',
        date: initialData.date ? new Date(initialData.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        paymentMethod: initialData.paymentMethod || 'Credit Card',
        notes: initialData.notes || '',
        isRecurring: Boolean(initialData.isRecurring),
        receiptImage: initialData.receiptImage || '',
      });
    } else {
      setFormData({
        title: '',
        amount: '',
        type: 'expense',
        category: 'Food & Dining',
        date: new Date().toISOString().slice(0, 10),
        paymentMethod: 'Credit Card',
        notes: '',
        isRecurring: false,
        receiptImage: '',
      });
    }
    setError('');
  }, [initialData, isOpen]);

  // When type changes, adjust default category if needed
  const handleTypeChange = (newType) => {
    const defaultCat = newType === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0];
    setFormData((prev) => ({
      ...prev,
      type: newType,
      category: defaultCat,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Please provide a transaction title');
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      setError('Please provide a valid positive amount');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
      };

      if (isEditing) {
        await updateTransactionApi(initialData._id, payload);
      } else {
        await createTransactionApi(payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving transaction');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const categoryList = formData.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)' }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow border-0 rounded-4">
          <div className="modal-header border-bottom-0 pb-0">
            <h5 className="modal-title fw-bold">
              {isEditing ? 'Edit Transaction' : 'Add New Transaction'}
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

              {/* Type toggle */}
              <div className="btn-group w-100 mb-3" role="group">
                <button
                  type="button"
                  className={`btn ${
                    formData.type === 'expense'
                      ? 'btn-danger fw-bold'
                      : 'btn-outline-secondary'
                  }`}
                  onClick={() => handleTypeChange('expense')}
                >
                  Expense
                </button>
                <button
                  type="button"
                  className={`btn ${
                    formData.type === 'income'
                      ? 'btn-success fw-bold'
                      : 'btn-outline-secondary'
                  }`}
                  onClick={() => handleTypeChange('income')}
                >
                  Income
                </button>
              </div>

              {/* Title */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">
                  Transaction Title *
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Grocery store, Salary, Coffee"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              {/* Amount & Currency */}
              <div className="row g-2 mb-3">
                <div className="col-7">
                  <label className="form-label small fw-semibold text-secondary">
                    Amount ({currency}) *
                  </label>
                  <div className="input-group">
                    <span className="input-group-text fw-bold">{currency}</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      className="form-control"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Date */}
                <div className="col-5">
                  <label className="form-label small fw-semibold text-secondary">Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Category & Payment Method */}
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-semibold text-secondary">Category *</label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categoryList.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-6">
                  <label className="form-label small fw-semibold text-secondary">
                    Payment Method
                  </label>
                  <select
                    className="form-select"
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  >
                    {PAYMENT_METHODS.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">
                  Notes (Optional)
                </label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Additional details, memo or tags..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                ></textarea>
              </div>

              {/* Receipt / Invoice Attachment */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">
                  Receipt / Bill Attachment (Optional)
                </label>
                {formData.receiptImage ? (
                  <div className="d-flex align-items-center gap-3 p-2 border rounded-3 bg-light">
                    <img
                      src={formData.receiptImage}
                      alt="Receipt"
                      style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                    <div className="flex-grow-1 small">
                      <div className="fw-semibold text-success">Receipt Attached</div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>Ready to save</div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => setFormData({ ...formData, receiptImage: '' })}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      id="receiptInput"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            setFormData((prev) => ({ ...prev, receiptImage: ev.target.result }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                      onClick={() => document.getElementById('receiptInput').click()}
                    >
                      <span>📎 Attach Receipt / Bill Photo</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Recurring Switch */}
              <div className="form-check form-switch mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="recurringSwitch"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                />
                <label className="form-check-label small text-muted" htmlFor="recurringSwitch">
                  Mark as recurring (Monthly bill, subscription, or salary)
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
                <span>{loading ? 'Saving...' : isEditing ? 'Update Transaction' : 'Save Transaction'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;
