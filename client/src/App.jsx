
import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import TransactionsPage from './pages/TransactionsPage';
import BudgetsPage from './pages/BudgetsPage';
import GoalsPage from './pages/GoalsPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import LoginPage from './pages/LoginPage';
import TransactionModal from './components/TransactionModal';
import BudgetModal from './components/BudgetModal';
import ExportModal from './components/ExportModal';
import ImportModal from './components/ImportModal';
import AIAdvisorChatModal from './components/AIAdvisorChatModal';

function App() {
  const { user, isAuthenticated, loading } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') || 'light'
  );

  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAdvisorChatOpen, setIsAdvisorChatOpen] = useState(false);

  const [currentMonth, setCurrentMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setIsAddTxModalOpen(true);
  };

  const handleCloseTxModal = () => {
    setIsAddTxModalOpen(false);
    setEditingTransaction(null);
  };

  // Wait until saved login session has been checked.
  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">
            Checking login session...
          </span>
        </div>
      </div>
    );
  }

  // Show login page when the user is not authenticated.
  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  const currency = user.currency || '$';

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsAddTxModalOpen(true);
        }}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <main className="flex-grow-1">
        {activeTab === 'dashboard' && (
          <Dashboard
            key={refreshKey}
            currency={currency}
            onOpenAddModal={() => {
              setEditingTransaction(null);
              setIsAddTxModalOpen(true);
            }}
            onOpenImportModal={() => setIsImportModalOpen(true)}
            onOpenAdvisorChat={() => setIsAdvisorChatOpen(true)}
            setActiveTab={setActiveTab}
            onEditTransaction={handleEditTransaction}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsPage
            key={refreshKey}
            currency={currency}
            onOpenAddModal={() => {
              setEditingTransaction(null);
              setIsAddTxModalOpen(true);
            }}
            onOpenExportModal={() => setIsExportModalOpen(true)}
            onEditTransaction={handleEditTransaction}
          />
        )}

        {activeTab === 'budgets' && (
          <BudgetsPage
            key={refreshKey}
            currency={currency}
            currentMonth={currentMonth}
            setCurrentMonth={setCurrentMonth}
            onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
          />
        )}

        {activeTab === 'goals' && (
          <GoalsPage
            key={refreshKey}
            currency={currency}
          />
        )}

        {activeTab === 'subscriptions' && (
          <SubscriptionsPage
            key={refreshKey}
            currency={currency}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsPage
            key={refreshKey}
            currency={currency}
          />
        )}
      </main>

      <TransactionModal
        isOpen={isAddTxModalOpen}
        onClose={handleCloseTxModal}
        onSuccess={triggerRefresh}
        initialData={editingTransaction}
        currency={currency}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        onSuccess={triggerRefresh}
        currentMonth={currentMonth}
        currency={currency}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        currency={currency}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={triggerRefresh}
        currency={currency}
      />

      <AIAdvisorChatModal
        isOpen={isAdvisorChatOpen}
        onClose={() => setIsAdvisorChatOpen(false)}
        currency={currency}
      />

      <footer className="py-3 bg-white border-top text-center text-muted small mt-auto">
        <div className="container">
          <p className="mb-0">
            Personal Expense Manager &bull; Advanced AI Edition
            &copy; {new Date().getFullYear()}
            {' '} &bull; Node.js, Express, MongoDB, React & Bootstrap 5
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
