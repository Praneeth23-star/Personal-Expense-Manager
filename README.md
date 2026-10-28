# 💰 Personal Expense Manager (Advanced AI Edition)

A complete, enterprise-grade Personal Expense & Budget Management web application built with **Node.js**, **Express**, **MongoDB**, **React 18**, and **Bootstrap 5**.

---

## 🌟 Advanced Features

### 1. 🤖 AI-Powered Financial Health Advisor
- **Financial Health Score (0 - 100)**: Real-time diagnostic evaluating savings rate, budget discipline, and spending consistency.
- **50/30/20 Rule Audit**: Compares actual vs recommended targets for **Needs (50%)**, **Wants (30%)**, and **Savings (20%)**.
- **Predictive Month-End Forecast**: Real-time projection of monthly burn rate and estimated end-of-month leftover savings.
- **Interactive AI Chat Assistant**: Consult the AI advisor with custom questions or click one of the suggested prompts to get immediate, personalized recommendations.

### 2. 🎯 Savings Goals & Sinking Funds
- Create and track custom financial milestones (e.g., Emergency Fund, Tech Upgrade, Travel).
- Visual progress meters, target deadlines, days remaining counters, and quick deposit modal.
- Automatic completion status calculation with achievement badges.

### 3. 🔄 Recurring Bills & Subscription Manager
- Manage recurring subscriptions (Netflix, Spotify, Gym, Cloud services, Utilities).
- Projected monthly and annual recurring commitment burn rate.
- Renewal countdown indicators (Urgent / Upcoming).
- **One-Click Pay**: Records an expense transaction and automatically rolls the billing due date forward to the next cycle.

### 4. 🧾 Receipt & Bill Photo Attachments
- Attach image receipts/bills directly to transactions (with base64 encoding).
- Quick preview thumbnails and fullscreen lightbox viewer directly inside the transaction table.

### 5. 📥 Bank Statement CSV Import
- Import transactions directly from bank statement CSV files.
- Automatically detects columns (`Date`, `Title`, `Amount`, `Category`, `Type`) with interactive preview before confirming import.

### 6. 🌙 Dark & Light Theme Mode
- One-click theme switcher in the navigation bar with persistent storage in `localStorage`.

### 7. 📊 Full-Featured Dashboard & Analytics
- Multi-month Income vs Expense comparison trend charts (Chart.js).
- Category doughnut charts and payment method breakdown.
- Budget alerts with automatic color status thresholds (🟢 On Track, 🟡 Warning at 80%, 🔴 Over Budget).
- Export records to **CSV / Excel** and **JSON**.

### 8. ⚡ Dual-Engine Database (Zero Setup Needed)
- Standard support for **MongoDB & MongoDB Atlas** via Mongoose.
- Automatic graceful fallback to an **instant local file-backed JSON database engine** (`server/data/*.json`) when no external MongoDB daemon is active.

---

## 🚀 Quick Start Guide

### 1. Start the Backend API (Node.js & MongoDB)
Open a terminal in the `server` directory:
```bash
cd server
npm run dev
```
*API runs at `http://localhost:5000`*

### 2. Start the Frontend (React + Vite + Bootstrap 5)
Open a second terminal in the `client` directory:
```bash
cd client
npm run dev
```
*Frontend runs at `http://localhost:3000`*

### 3. Log In & Explore
- Open `http://localhost:3000` in your browser.
- Click **"One-Click Demo Mode (Alex Johnson)"** to immediately enter with pre-seeded data, active savings goals, and subscriptions!

---

## 📁 Architecture Overview

```
personal-expense-manager/
├── package.json
├── README.md
├── server/
│   ├── server.js                  # Express API server entry
│   ├── config/
│   │   ├── db.js                  # MongoDB connection with zero-latency fallback
│   │   └── localStore.js          # Fast file-backed JSON database engine
│   ├── models/
│   │   ├── User.js                # User auth model
│   │   ├── Transaction.js         # Transaction schema with receipt support
│   │   ├── Budget.js              # Monthly category budget limits
│   │   ├── Goal.js                # Savings goals schema
│   │   └── Subscription.js        # Recurring bills & subscription schema
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── transactionController.js # CRUD & CSV bulk import
│   │   ├── budgetController.js
│   │   ├── goalController.js      # Savings targets & deposit tracking
│   │   ├── subscriptionController.js # Recurring bills & one-click pay
│   │   ├── aiAdvisorController.js # 50/30/20 audit & AI chat advisor
│   │   └── statsController.js
│   └── routes/
│       ├── authRoutes.js
│       ├── transactionRoutes.js
│       ├── budgetRoutes.js
│       ├── goalRoutes.js
│       ├── subscriptionRoutes.js
│       ├── aiAdvisorRoutes.js
│       └── statsRoutes.js
└── client/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── App.jsx                # Main application orchestration & theme
        ├── index.css              # Custom styling & Dark theme engine
        ├── services/api.js        # Axios API client
        ├── components/
        │   ├── Navbar.jsx         # Navigation with Dark mode & quick actions
        │   ├── AIAdvisorCard.jsx  # Health score & 50/30/20 diagnostic
        │   ├── AIAdvisorChatModal.jsx # Interactive financial advisor chat
        │   ├── GoalModal.jsx      # Create / deposit savings modal
        │   ├── SubscriptionModal.jsx # Add / edit recurring bill modal
        │   ├── ImportModal.jsx    # Bank statement CSV importer
        │   ├── ExportModal.jsx    # CSV & JSON exporter
        │   ├── TransactionModal.jsx # Record transaction with receipt attachment
        │   └── TransactionList.jsx# Table with receipt viewer & filters
        └── pages/
            ├── Dashboard.jsx      # Executive overview & AI diagnostics
            ├── TransactionsPage.jsx # Paginated transaction records
            ├── BudgetsPage.jsx    # Monthly budget goals
            ├── GoalsPage.jsx      # Savings goals tracker
            ├── SubscriptionsPage.jsx # Recurring bills & subscriptions
            ├── AnalyticsPage.jsx  # Financial intelligence & charts
            └── LoginPage.jsx      # Authentication & one-click demo
```
