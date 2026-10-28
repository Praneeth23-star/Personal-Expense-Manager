import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Wallet, LogIn, UserPlus, Play, CheckCircle } from 'lucide-react';

const LoginPage = () => {
  const { login, register, loginAsDemo } = useAuth();
  const [isLoginTab, setIsLoginTab] = useState(true);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('$');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password, currency);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginAsDemo();
    } catch (err) {
      setError('Could not connect to demo account. Please ensure server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center p-3"
      style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
      }}
    >
      <div className="card shadow-lg border-0 rounded-4 overflow-hidden" style={{ maxWidth: '460px', width: '100%' }}>
        <div className="card-body p-4 p-md-5">
          {/* Logo & Heading */}
          <div className="text-center mb-4">
            <div className="bg-primary text-white p-3 rounded-circle d-inline-flex align-items-center justify-content-center shadow-sm mb-3">
              <Wallet size={32} />
            </div>
            <h3 className="fw-bold text-dark mb-1">ExpenseTrack</h3>
            <p className="text-muted small">
              Personal Expense & Budget Management System
            </p>
          </div>

          {/* Quick Demo Button */}
          <button
            type="button"
            className="btn btn-warning w-100 fw-bold d-flex align-items-center justify-content-center gap-2 mb-4 py-2 shadow-sm"
            onClick={handleDemoLogin}
            disabled={loading}
          >
            <Play size={18} />
            <span>One-Click Demo Mode (Alex Johnson)</span>
          </button>

          <div className="d-flex align-items-center my-3">
            <hr className="flex-grow-1 text-muted" />
            <span className="px-3 text-muted small fw-medium">OR USE ACCOUNT</span>
            <hr className="flex-grow-1 text-muted" />
          </div>

          {/* Error alert */}
          {error && <div className="alert alert-danger py-2 small rounded-3 mb-3">{error}</div>}

          {/* Tabs */}
          <ul className="nav nav-pills nav-fill mb-3 bg-light p-1 rounded-3">
            <li className="nav-item">
              <button
                className={`nav-link py-2 small fw-semibold ${isLoginTab ? 'active bg-white text-primary shadow-sm' : 'text-secondary'}`}
                onClick={() => {
                  setIsLoginTab(true);
                  setError('');
                }}
              >
                Sign In
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link py-2 small fw-semibold ${!isLoginTab ? 'active bg-white text-primary shadow-sm' : 'text-secondary'}`}
                onClick={() => {
                  setIsLoginTab(false);
                  setError('');
                }}
              >
                Create Account
              </button>
            </li>
          </ul>

          {/* Login Form */}
          {isLoginTab ? (
            <form onSubmit={handleLoginSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 fw-semibold d-flex align-items-center justify-content-center gap-2 py-2 mt-2 shadow-sm"
                disabled={loading}
              >
                <LogIn size={18} />
                <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Preferred Currency</label>
                <select
                  className="form-select"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="$">$ (USD / Dollar)</option>
                  <option value="₹">₹ (INR / Rupee)</option>
                  <option value="€">€ (EUR / Euro)</option>
                  <option value="£">£ (GBP / Pound)</option>
                  <option value="¥">¥ (JPY / Yen)</option>
                  <option value="C$">C$ (CAD / Canadian Dollar)</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 fw-semibold d-flex align-items-center justify-content-center gap-2 py-2 mt-2 shadow-sm"
                disabled={loading}
              >
                <UserPlus size={18} />
                <span>{loading ? 'Creating...' : 'Register Account'}</span>
              </button>
            </form>
          )}

          <div className="text-center mt-4 text-muted small">
            Built with Node.js, Express, MongoDB, React & Bootstrap 5
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
