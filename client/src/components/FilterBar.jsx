import React from 'react';
import { Search, RotateCcw, Filter } from 'lucide-react';

const CATEGORIES = [
  'Food & Dining',
  'Groceries',
  'Housing & Rent',
  'Utilities',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Healthcare',
  'Salary',
  'Freelance',
  'Investments',
  'Other',
];

const FilterBar = ({ filters, setFilters, onReset }) => {
  return (
    <div className="card p-3 mb-4 shadow-sm">
      <div className="row g-2 align-items-center">
        {/* Search */}
        <div className="col-12 col-md-4">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0 text-muted">
              <Search size={16} />
            </span>
            <input
              type="text"
              className="form-control border-start-0 ps-0"
              placeholder="Search title, category or notes..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
            />
          </div>
        </div>

        {/* Type Filter */}
        <div className="col-6 col-md-2">
          <select
            className="form-select"
            value={filters.type}
            onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value, page: 1 }))}
          >
            <option value="all">All Types</option>
            <option value="expense">Expenses Only</option>
            <option value="income">Income Only</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="col-6 col-md-3">
          <select
            className="form-select"
            value={filters.category}
            onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value, page: 1 }))}
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div className="col-6 col-md-2">
          <select
            className="form-select"
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              setFilters((prev) => ({ ...prev, sortBy, sortOrder, page: 1 }));
            }}
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Amount: High to Low</option>
            <option value="amount-asc">Amount: Low to High</option>
          </select>
        </div>

        {/* Reset */}
        <div className="col-6 col-md-1 text-end">
          <button
            type="button"
            className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-1"
            title="Reset Filters"
            onClick={onReset}
          >
            <RotateCcw size={15} />
            <span className="d-md-none">Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
