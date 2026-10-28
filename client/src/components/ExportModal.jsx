import React, { useState } from 'react';
import { getExportTransactionsApi } from '../services/api';
import { Download, FileText, Code, Check } from 'lucide-react';

const ExportModal = ({ isOpen, onClose, currency = '$' }) => {
  const [format, setFormat] = useState('csv');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleExport = async () => {
    setLoading(true);
    setSuccessMsg('');
    try {
      const res = await getExportTransactionsApi({
        type: filterType === 'all' ? undefined : filterType,
      });

      const transactions = res.data.data;

      if (!transactions || transactions.length === 0) {
        alert('No transactions found to export.');
        setLoading(false);
        return;
      }

      if (format === 'csv') {
        const headers = ['Date', 'Title', 'Type', 'Category', 'Amount', 'Payment Method', 'Notes'];
        const csvRows = [headers.join(',')];

        transactions.forEach((tx) => {
          const row = [
            `"${new Date(tx.date).toLocaleDateString()}"`,
            `"${(tx.title || '').replace(/"/g, '""')}"`,
            `"${tx.type}"`,
            `"${tx.category}"`,
            tx.amount,
            `"${tx.paymentMethod || ''}"`,
            `"${(tx.notes || '').replace(/"/g, '""')}"`,
          ];
          csvRows.push(row.join(','));
        });

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Expense_Report_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // JSON
        const blob = new Blob([JSON.stringify(transactions, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Expense_Report_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setSuccessMsg(`Successfully exported ${transactions.length} records!`);
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1500);
    } catch (err) {
      alert('Failed to export transactions: ' + (err.message || 'Unknown error'));
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
              <Download size={20} className="text-primary" />
              <span>Export Financial Records</span>
            </h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>

          <div className="modal-body pt-3">
            {successMsg && (
              <div className="alert alert-success py-2 small rounded-3 mb-3 d-flex align-items-center gap-2">
                <Check size={16} />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Export Format</label>
              <div className="row g-2">
                <div className="col-6">
                  <div
                    className={`card p-3 text-center cursor-pointer ${
                      format === 'csv' ? 'border-primary bg-primary bg-opacity-10' : ''
                    }`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setFormat('csv')}
                  >
                    <FileText className="mx-auto text-primary mb-1" size={24} />
                    <div className="fw-bold small">CSV / Excel</div>
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                      Spreadsheet compatible
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div
                    className={`card p-3 text-center cursor-pointer ${
                      format === 'json' ? 'border-primary bg-primary bg-opacity-10' : ''
                    }`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setFormat('json')}
                  >
                    <Code className="mx-auto text-info mb-1" size={24} />
                    <div className="fw-bold small">JSON</div>
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                      Full structured data
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Filter by Type</label>
              <select
                className="form-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Transactions (Income & Expenses)</option>
                <option value="expense">Expenses Only</option>
                <option value="income">Income Only</option>
              </select>
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
              type="button"
              className="btn btn-primary d-flex align-items-center gap-2"
              onClick={handleExport}
              disabled={loading}
            >
              <Download size={16} />
              <span>{loading ? 'Exporting...' : 'Download File'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
