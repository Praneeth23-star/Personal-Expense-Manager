import React, { useState } from 'react';
import { importTransactionsApi } from '../services/api';
import { UploadCloud, FileSpreadsheet, Check, AlertCircle, CheckCircle } from 'lucide-react';

const ImportModal = ({ isOpen, onClose, onSuccess, currency = '$' }) => {
  const [file, setFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (!selected.name.endsWith('.csv')) {
      setError('Please select a valid CSV (.csv) file');
      return;
    }

    setFile(selected);
    setError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split(/\r\n|\n/).filter((line) => line.trim() !== '');
        if (lines.length < 2) {
          setError('CSV file appears to be empty or has no data rows');
          return;
        }

        // Parse header
        const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, '').toLowerCase());

        // Find column indices
        const dateIdx = headers.findIndex((h) => h.includes('date'));
        const titleIdx = headers.findIndex((h) => h.includes('title') || h.includes('description') || h.includes('name') || h.includes('memo'));
        const amountIdx = headers.findIndex((h) => h.includes('amount') || h.includes('cost') || h.includes('total') || h.includes('debit'));
        const categoryIdx = headers.findIndex((h) => h.includes('category') || h.includes('tag'));
        const typeIdx = headers.findIndex((h) => h.includes('type'));

        const items = [];
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
          if (row.length === 1 && !row[0]) continue;

          const rawAmount = amountIdx !== -1 ? parseFloat(row[amountIdx]) : parseFloat(row[1]) || 0;
          const absAmount = Math.abs(rawAmount);

          let detectedType = 'expense';
          if (typeIdx !== -1 && row[typeIdx]) {
            detectedType = row[typeIdx].toLowerCase().includes('income') ? 'income' : 'expense';
          } else if (rawAmount < 0) {
            detectedType = 'expense';
          }

          items.push({
            date: dateIdx !== -1 && row[dateIdx] ? row[dateIdx] : new Date().toISOString().slice(0, 10),
            title: titleIdx !== -1 && row[titleIdx] ? row[titleIdx] : `Imported Entry #${i}`,
            amount: absAmount || 10,
            category: categoryIdx !== -1 && row[categoryIdx] ? row[categoryIdx] : 'Other Expense',
            type: detectedType,
            paymentMethod: 'Credit Card',
            notes: 'Imported via CSV',
          });
        }

        if (items.length === 0) {
          setError('Could not extract valid records from this CSV');
        } else {
          setParsedRows(items);
        }
      } catch (err) {
        setError('Failed to parse CSV file: ' + err.message);
      }
    };
    reader.readAsText(selected);
  };

  const handleImportSubmit = async () => {
    if (parsedRows.length === 0) return;
    setLoading(true);
    setError('');

    try {
      await importTransactionsApi(parsedRows);
      setSuccessMsg(`Successfully imported ${parsedRows.length} transactions!`);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Error importing records');
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
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content shadow-lg border-0 rounded-4">
          <div className="modal-header border-bottom-0 pb-0">
            <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
              <UploadCloud size={22} className="text-primary" />
              <span>Import Bank Statement CSV</span>
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
            {error && <div className="alert alert-danger py-2 small rounded-3 mb-3">{error}</div>}
            {successMsg && (
              <div className="alert alert-success py-2 small rounded-3 mb-3 d-flex align-items-center gap-2">
                <CheckCircle size={18} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Upload Box */}
            <div
              className="border border-2 border-dashed rounded-4 p-4 text-center bg-light mb-3"
              style={{ cursor: 'pointer' }}
              onClick={() => document.getElementById('csvFileInput').click()}
            >
              <input
                type="file"
                id="csvFileInput"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <FileSpreadsheet className="text-primary mx-auto mb-2" size={38} />
              <div className="fw-bold mb-1">
                {file ? file.name : 'Click to select Bank Statement CSV'}
              </div>
              <small className="text-muted d-block">
                Supports columns: Date, Title / Description, Amount, Category, Type
              </small>
            </div>

            {/* Preview Section */}
            {parsedRows.length > 0 && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="small fw-bold text-secondary text-uppercase">
                    Data Preview ({parsedRows.length} total entries detected)
                  </span>
                  <span className="badge bg-success bg-opacity-10 text-success border border-success small">
                    Ready to Import
                  </span>
                </div>

                <div className="table-responsive border rounded-3" style={{ maxHeight: '200px' }}>
                  <table className="table table-sm table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                    <thead className="table-light">
                      <tr>
                        <th>Date</th>
                        <th>Title</th>
                        <th>Type</th>
                        <th>Category</th>
                        <th className="text-end">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedRows.slice(0, 5).map((row, idx) => (
                        <tr key={idx}>
                          <td>{row.date}</td>
                          <td className="fw-semibold">{row.title}</td>
                          <td>
                            <span className={`badge ${row.type === 'income' ? 'bg-success' : 'bg-danger'} small`}>
                              {row.type}
                            </span>
                          </td>
                          <td>{row.category}</td>
                          <td className="text-end fw-bold">
                            {currency}{row.amount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {parsedRows.length > 5 && (
                  <small className="text-muted d-block mt-1">
                    ...and {parsedRows.length - 5} more records will be imported.
                  </small>
                )}
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
              type="button"
              className="btn btn-primary d-flex align-items-center gap-2"
              onClick={handleImportSubmit}
              disabled={loading || parsedRows.length === 0}
            >
              <Check size={16} />
              <span>{loading ? 'Importing...' : `Import ${parsedRows.length} Transactions`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
