import React, { useState, useEffect } from 'react';
import FilterBar from '../components/FilterBar';
import TransactionList from '../components/TransactionList';
import { getTransactionsApi, deleteTransactionApi } from '../services/api';
import { PlusCircle, Download, FileSpreadsheet } from 'lucide-react';

const TransactionsPage = ({
  currency = '$',
  onOpenAddModal,
  onOpenExportModal,
  onEditTransaction,
}) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const initialFilters = {
    search: '',
    type: 'all',
    category: 'all',
    sortBy: 'date',
    sortOrder: 'desc',
    page: 1,
    limit: 10,
  };

  const [filters, setFilters] = useState(initialFilters);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await getTransactionsApi(filters);
      setTransactions(res.data.data);
      setTotalCount(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction record?')) {
      try {
        await deleteTransactionApi(id);
        fetchTransactions();
      } catch (err) {
        alert('Failed to delete transaction: ' + (err.message || 'Server error'));
      }
    }
  };

  return (
    <div className="container-fluid px-lg-4 py-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold tracking-tight mb-1">Transaction History</h2>
          <p className="text-muted small mb-0">
            Search, filter, categorize, and export all recorded finances ({totalCount} total entries).
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-outline-secondary d-flex align-items-center gap-2"
            onClick={onOpenExportModal}
          >
            <Download size={16} />
            <span>Export</span>
          </button>
          <button
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={onOpenAddModal}
          >
            <PlusCircle size={16} />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        onReset={handleResetFilters}
      />

      {/* Transactions List */}
      <TransactionList
        transactions={transactions}
        loading={loading}
        currency={currency}
        onEdit={onEditTransaction}
        onDelete={handleDelete}
        currentPage={filters.page}
        totalPages={totalPages}
        onPageChange={(newPage) => setFilters((prev) => ({ ...prev, page: newPage }))}
        onOpenAddModal={onOpenAddModal}
      />
    </div>
  );
};

export default TransactionsPage;
