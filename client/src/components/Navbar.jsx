import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Wallet,
  LayoutDashboard,
  Receipt,
  PieChart,
  Target,
  PlusCircle,
  LogOut,
  User,
  Flag,
  RefreshCw,
  UploadCloud,
  Moon,
  Sun,
} from 'lucide-react';

const Navbar = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenImportModal,
  theme = 'light',
  toggleTheme,
}) => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar navbar-expand-xl navbar-dark bg-dark sticky-top shadow-sm py-2">
      <div className="container-fluid px-lg-4">
        {/* Brand */}
        <button
          className="btn btn-link navbar-brand d-flex align-items-center gap-2 text-decoration-none text-white p-0"
          onClick={() => setActiveTab('dashboard')}
        >
          <div className="bg-primary text-white p-2 rounded-3 d-flex align-items-center justify-content-center shadow-sm">
            <Wallet size={20} />
          </div>
          <span className="fw-bold fs-5 tracking-tight">ExpenseTrack</span>
        </button>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Collapsible Content */}
        <div className="collapse navbar-collapse" id="navbarContent">
          {/* Navigation Items */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3 gap-1">
            <li className="nav-item">
              <button
                className={`nav-link btn btn-link text-start d-flex align-items-center gap-2 ${
                  activeTab === 'dashboard' ? 'active text-primary fw-semibold' : 'text-light'
                }`}
                onClick={() => setActiveTab('dashboard')}
              >
                <LayoutDashboard size={17} />
                <span>Dashboard</span>
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link btn btn-link text-start d-flex align-items-center gap-2 ${
                  activeTab === 'transactions' ? 'active text-primary fw-semibold' : 'text-light'
                }`}
                onClick={() => setActiveTab('transactions')}
              >
                <Receipt size={17} />
                <span>Transactions</span>
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link btn btn-link text-start d-flex align-items-center gap-2 ${
                  activeTab === 'budgets' ? 'active text-primary fw-semibold' : 'text-light'
                }`}
                onClick={() => setActiveTab('budgets')}
              >
                <Target size={17} />
                <span>Budgets</span>
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link btn btn-link text-start d-flex align-items-center gap-2 ${
                  activeTab === 'goals' ? 'active text-primary fw-semibold' : 'text-light'
                }`}
                onClick={() => setActiveTab('goals')}
              >
                <Flag size={17} />
                <span>Savings Goals</span>
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link btn btn-link text-start d-flex align-items-center gap-2 ${
                  activeTab === 'subscriptions' ? 'active text-primary fw-semibold' : 'text-light'
                }`}
                onClick={() => setActiveTab('subscriptions')}
              >
                <RefreshCw size={17} />
                <span>Bills & Subs</span>
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link btn btn-link text-start d-flex align-items-center gap-2 ${
                  activeTab === 'analytics' ? 'active text-primary fw-semibold' : 'text-light'
                }`}
                onClick={() => setActiveTab('analytics')}
              >
                <PieChart size={17} />
                <span>Analytics</span>
              </button>
            </li>
          </ul>

          {/* Right Action & User Controls */}
          <div className="d-flex align-items-center gap-2">
            {/* Dark/Light mode toggle */}
            <button
              className="btn btn-outline-secondary btn-sm p-2 text-white border-0"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <Sun size={17} className="text-warning" /> : <Moon size={17} />}
            </button>

            {/* Import CSV */}
            <button
              className="btn btn-outline-light btn-sm d-flex align-items-center gap-1"
              title="Import Bank Statement CSV"
              onClick={onOpenImportModal}
            >
              <UploadCloud size={16} />
              <span className="d-none d-md-inline">Import CSV</span>
            </button>

            {/* Add Transaction */}
            <button
              className="btn btn-primary btn-sm d-flex align-items-center gap-1 shadow-sm"
              onClick={onOpenAddModal}
            >
              <PlusCircle size={16} />
              <span>Record</span>
            </button>

            {user && (
              <div className="d-flex align-items-center gap-2 ps-2 border-start border-secondary">
                <div
                  className="bg-secondary bg-opacity-25 text-white rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: '32px', height: '32px' }}
                  title={user.email}
                >
                  <User size={16} />
                </div>
                <div className="d-none d-lg-block text-start">
                  <div className="text-white small fw-bold leading-none">{user.name}</div>
                  <div className="text-white-50" style={{ fontSize: '0.68rem' }}>
                    Currency: {user.currency || '$'}
                  </div>
                </div>
                <button
                  className="btn btn-outline-danger btn-sm p-1 ms-1"
                  title="Logout"
                  onClick={logout}
                >
                  <LogOut size={15} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
