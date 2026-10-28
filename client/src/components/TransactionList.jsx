
import React, { useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Edit2,
  Trash2,
  Calendar,
  CreditCard,
  Repeat,
  Inbox,
} from 'lucide-react';

const TransactionList = ({
  transactions,
  loading,
  currency = '$',
  onEdit,
  onDelete,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onOpenAddModal,
}) => {
  const [viewingReceipt, setViewingReceipt] = useState(null);

  if (loading) {
    return (
      <div className="card p-5 text-center shadow-sm">
        <div className="spinner-border text-primary mx-auto mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted mb-0">Loading transactions...</p>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="card p-5 text-center shadow-sm">
        <div className="bg-light text-muted p-3 rounded-circle d-inline-block mx-auto mb-3">
          <Inbox size={40} />
        </div>
        <h5 className="fw-bold mb-1">No transactions found</h5>
        <p className="text-muted small mb-3">
          Try adjusting your search filters or record a new transaction.
        </p>
        <div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onOpenAddModal}
          >
            Add Your First Transaction
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm overflow-hidden">
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th scope="col" className="ps-4">Title &amp; Details</th>
              <th scope="col">Category</th>
              <th scope="col">Payment</th>
              <th scope="col">Date</th>
              <th scope="col" className="text-end">Amount</th>
              <th scope="col" className="text-end pe-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((tx) => {
              const isIncome = tx.type === 'income';
              const formattedDate = tx.date
                ? new Date(tx.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : 'No date';

              return (
                <tr key={tx._id}>
                  <td className="ps-4">
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className={`rounded-circle p-2 d-flex align-items-center justify-content-center ${
                          isIncome
                            ? 'bg-success bg-opacity-10 text-success'
                            : 'bg-danger bg-opacity-10 text-danger'
                        }`}
                        style={{ width: '38px', height: '38px' }}
                      >
                        {isIncome ? (
                          <ArrowDownRight size={20} />
                        ) : (
                          <ArrowUpRight size={20} />
                        )}
                      </div>

                      <div>
                        <div className="fw-semibold text-dark d-flex align-items-center gap-2 flex-wrap">
                          <span>{tx.title}</span>

                          {tx.isRecurring && (
                            <span className="badge bg-light text-secondary border small d-flex align-items-center gap-1">
                              <Repeat size={10} />
                              <span style={{ fontSize: '0.65rem' }}>
                                Recurring
                              </span>
                            </span>
                          )}

                          {tx.receiptImage && (
                            <button
                              type="button"
                              className="badge bg-info bg-opacity-10 text-info border border-info small py-1 px-2 d-flex align-items-center gap-1"
                              style={{ cursor: 'pointer' }}
                              onClick={() =>
                                setViewingReceipt(tx.receiptImage)
                              }
                              title="Click to view attached receipt photo"
                            >
                              🧾 Receipt
                            </button>
                          )}
                        </div>

                        {tx.notes && (
                          <div
                            className="text-muted small text-truncate"
                            style={{ maxWidth: '240px' }}
                            title={tx.notes}
                          >
                            {tx.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="badge-category small">
                      {tx.category || 'Uncategorized'}
                    </span>
                  </td>

                  <td>
                    <div className="text-muted small d-flex align-items-center gap-1">
                      <CreditCard size={14} />
                      <span>{tx.paymentMethod || 'Other'}</span>
                    </div>
                  </td>

                  <td>
                    <div className="text-muted small d-flex align-items-center gap-1">
                      <Calendar size={14} />
                      <span>{formattedDate}</span>
                    </div>
                  </td>

                  <td className="text-end">
                    <span
                      className={`fw-bold fs-6 ${
                        isIncome ? 'text-success' : 'text-danger'
                      }`}
                    >
                      {isIncome ? '+' : '-'} {currency}
                      {Number(tx.amount || 0).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </td>

                  <td className="text-end pe-4">
                    <div className="d-flex align-items-center justify-content-end gap-1">
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm p-1 border-0"
                        title="Edit"
                        onClick={() => onEdit?.(tx)}
                      >
                        <Edit2 size={16} />
                      </button>

                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm p-1 border-0"
                        title="Delete"
                        onClick={() => onDelete?.(tx._id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="d-flex align-items-center justify-content-between p-3 border-top bg-light flex-wrap gap-2">
          <div className="small text-muted">
            Page <span className="fw-semibold text-dark">{currentPage}</span>{' '}
            of <span className="fw-semibold text-dark">{totalPages}</span>
          </div>

          <div className="btn-group btn-group-sm">
            <button
              type="button"
              className="btn btn-outline-secondary"
              disabled={currentPage <= 1}
              onClick={() => onPageChange?.(currentPage - 1)}
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(
                Math.max(0, currentPage - 3),
                Math.min(totalPages, currentPage + 2)
              )
              .map((page) => (
                <button
                  type="button"
                  key={page}
                  className={`btn ${
                    currentPage === page
                      ? 'btn-primary'
                      : 'btn-outline-secondary'
                  }`}
                  onClick={() => onPageChange?.(page)}
                >
                  {page}
                </button>
              ))}

            <button
              type="button"
              className="btn btn-outline-secondary"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange?.(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {viewingReceipt && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(5px)',
          }}
          onClick={() => setViewingReceipt(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content shadow-lg border-0 rounded-4 overflow-hidden">
              <div className="modal-header border-bottom py-2">
                <h6 className="modal-title fw-bold">
                  Attached Receipt / Bill Preview
                </h6>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => setViewingReceipt(null)}
                />
              </div>

              <div className="modal-body p-2 text-center bg-dark">
                <img
                  src={viewingReceipt}
                  alt="Receipt Preview"
                  className="img-fluid rounded"
                  style={{ maxHeight: '75vh', objectFit: 'contain' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
