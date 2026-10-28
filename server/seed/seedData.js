const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

const seedData = async () => {
  try {
    // Check if demo user already exists
    let demoUser = await User.findOne({ email: 'demo@expensemanager.com' });
    if (!demoUser) {
      demoUser = await User.create({
        name: 'Alex Johnson',
        email: 'demo@expensemanager.com',
        password: 'password123',
        currency: '$',
      });
      console.log('👤 Created demo user: demo@expensemanager.com / password123');
    }

    // Check if user already has transactions
    const count = await Transaction.countDocuments({ user: demoUser._id });
    if (count > 0) {
      console.log(`ℹ️ Demo user already has ${count} transactions.`);
      return demoUser;
    }

    console.log('🌱 Seeding demo transactions and budgets...');

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

    // Sample Transactions
    const sampleTransactions = [
      // Current Month Incomes
      {
        user: demoUser._id,
        title: 'Monthly Tech Salary',
        amount: 4500,
        type: 'income',
        category: 'Salary',
        date: new Date(currentYear, currentMonth, 1),
        paymentMethod: 'UPI / NetBanking',
        notes: 'Monthly direct deposit paycheck',
        isRecurring: true,
      },
      {
        user: demoUser._id,
        title: 'Freelance Web Design Project',
        amount: 850,
        type: 'income',
        category: 'Freelance',
        date: new Date(currentYear, currentMonth, 5),
        paymentMethod: 'UPI / NetBanking',
        notes: 'Client invoice #1042',
        isRecurring: false,
      },
      {
        user: demoUser._id,
        title: 'Stock Dividend Payout',
        amount: 145,
        type: 'income',
        category: 'Investments',
        date: new Date(currentYear, currentMonth, 8),
        paymentMethod: 'UPI / NetBanking',
        notes: 'Quarterly dividend payment',
        isRecurring: false,
      },

      // Current Month Expenses
      {
        user: demoUser._id,
        title: 'Apartment Monthly Rent',
        amount: 1400,
        type: 'expense',
        category: 'Housing & Rent',
        date: new Date(currentYear, currentMonth, 1),
        paymentMethod: 'UPI / NetBanking',
        notes: 'Monthly residential apartment rent',
        isRecurring: true,
      },
      {
        user: demoUser._id,
        title: 'Whole Foods Grocery Run',
        amount: 184.5,
        type: 'expense',
        category: 'Groceries',
        date: new Date(currentYear, currentMonth, 2),
        paymentMethod: 'Credit Card',
        notes: 'Weekly pantry essentials and organic veggies',
        isRecurring: false,
      },
      {
        user: demoUser._id,
        title: 'Electric & Water Utility Bill',
        amount: 125,
        type: 'expense',
        category: 'Utilities',
        date: new Date(currentYear, currentMonth, 3),
        paymentMethod: 'Credit Card',
        notes: 'City power & water services',
        isRecurring: true,
      },
      {
        user: demoUser._id,
        title: 'Dinner at Italian Bistro',
        amount: 72.8,
        type: 'expense',
        category: 'Food & Dining',
        date: new Date(currentYear, currentMonth, 4),
        paymentMethod: 'Credit Card',
        notes: 'Dinner with college friends',
        isRecurring: false,
      },
      {
        user: demoUser._id,
        title: 'Gasoline & Fuel',
        amount: 48,
        type: 'expense',
        category: 'Transportation',
        date: new Date(currentYear, currentMonth, 5),
        paymentMethod: 'Debit Card',
        notes: 'Full tank fill-up',
        isRecurring: false,
      },
      {
        user: demoUser._id,
        title: 'Netflix & Spotify Subscriptions',
        amount: 28.98,
        type: 'expense',
        category: 'Entertainment',
        date: new Date(currentYear, currentMonth, 6),
        paymentMethod: 'Credit Card',
        notes: 'Monthly streaming bundle',
        isRecurring: true,
      },
      {
        user: demoUser._id,
        title: 'Pharmacy & Health Vitamins',
        amount: 45.2,
        type: 'expense',
        category: 'Healthcare',
        date: new Date(currentYear, currentMonth, 7),
        paymentMethod: 'Cash',
        notes: 'Multivitamins and allergy medication',
        isRecurring: false,
      },
      {
        user: demoUser._id,
        title: 'Trader Joe’s Market Grocery',
        amount: 98.4,
        type: 'expense',
        category: 'Groceries',
        date: new Date(currentYear, currentMonth, 8),
        paymentMethod: 'Credit Card',
        notes: 'Midweek groceries & fruit snacks',
        isRecurring: false,
      },
      {
        user: demoUser._id,
        title: 'Weekend Movie & Popcorn',
        amount: 34,
        type: 'expense',
        category: 'Entertainment',
        date: new Date(currentYear, currentMonth, 9),
        paymentMethod: 'Debit Card',
        notes: 'Cinema IMAX tickets',
        isRecurring: false,
      },
      {
        user: demoUser._id,
        title: 'Coffee & Breakfast Bagel',
        amount: 14.75,
        type: 'expense',
        category: 'Food & Dining',
        date: new Date(currentYear, currentMonth, 10),
        paymentMethod: 'Cash',
        notes: 'Artisan roast latte',
        isRecurring: false,
      },

      // Previous Months for realistic trends
      // Month -1
      {
        user: demoUser._id,
        title: 'Monthly Tech Salary',
        amount: 4500,
        type: 'income',
        category: 'Salary',
        date: new Date(currentYear, currentMonth - 1, 1),
        paymentMethod: 'UPI / NetBanking',
        notes: 'Direct deposit',
        isRecurring: true,
      },
      {
        user: demoUser._id,
        title: 'Freelance Consulting',
        amount: 600,
        type: 'income',
        category: 'Freelance',
        date: new Date(currentYear, currentMonth - 1, 14),
        paymentMethod: 'UPI / NetBanking',
        notes: 'SEO audit for client',
        isRecurring: false,
      },
      {
        user: demoUser._id,
        title: 'Apartment Monthly Rent',
        amount: 1400,
        type: 'expense',
        category: 'Housing & Rent',
        date: new Date(currentYear, currentMonth - 1, 1),
        paymentMethod: 'UPI / NetBanking',
        notes: 'Rent',
        isRecurring: true,
      },
      {
        user: demoUser._id,
        title: 'Supermarket Groceries',
        amount: 410,
        type: 'expense',
        category: 'Groceries',
        date: new Date(currentYear, currentMonth - 1, 12),
        paymentMethod: 'Credit Card',
        notes: 'Full month groceries',
        isRecurring: false,
      },
      {
        user: demoUser._id,
        title: 'Car Maintenance & Oil Change',
        amount: 160,
        type: 'expense',
        category: 'Transportation',
        date: new Date(currentYear, currentMonth - 1, 18),
        paymentMethod: 'Credit Card',
        notes: 'Vehicle inspection',
        isRecurring: false,
      },

      // Month -2
      {
        user: demoUser._id,
        title: 'Monthly Tech Salary',
        amount: 4500,
        type: 'income',
        category: 'Salary',
        date: new Date(currentYear, currentMonth - 2, 1),
        paymentMethod: 'UPI / NetBanking',
        notes: 'Direct deposit',
        isRecurring: true,
      },
      {
        user: demoUser._id,
        title: 'Apartment Monthly Rent',
        amount: 1400,
        type: 'expense',
        category: 'Housing & Rent',
        date: new Date(currentYear, currentMonth - 2, 1),
        paymentMethod: 'UPI / NetBanking',
        notes: 'Rent',
        isRecurring: true,
      },
      {
        user: demoUser._id,
        title: 'Groceries & Household Supplies',
        amount: 440,
        type: 'expense',
        category: 'Groceries',
        date: new Date(currentYear, currentMonth - 2, 15),
        paymentMethod: 'Credit Card',
        notes: 'Groceries',
        isRecurring: false,
      },
      {
        user: demoUser._id,
        title: 'New Wireless Headphones',
        amount: 180,
        type: 'expense',
        category: 'Shopping',
        date: new Date(currentYear, currentMonth - 2, 20),
        paymentMethod: 'Credit Card',
        notes: 'Noise-canceling headphones',
        isRecurring: false,
      },
    ];

    await Transaction.insertMany(sampleTransactions);

    // Sample Budgets for Current Month
    const sampleBudgets = [
      {
        user: demoUser._id,
        category: 'Housing & Rent',
        limit: 1500,
        month: currentMonthStr,
      },
      {
        user: demoUser._id,
        category: 'Groceries',
        limit: 450,
        month: currentMonthStr,
      },
      {
        user: demoUser._id,
        category: 'Food & Dining',
        limit: 250,
        month: currentMonthStr,
      },
      {
        user: demoUser._id,
        category: 'Entertainment',
        limit: 150,
        month: currentMonthStr,
      },
      {
        user: demoUser._id,
        category: 'Utilities',
        limit: 200,
        month: currentMonthStr,
      },
      {
        user: demoUser._id,
        category: 'Transportation',
        limit: 180,
        month: currentMonthStr,
      },
      {
        user: demoUser._id,
        category: 'Healthcare',
        limit: 120,
        month: currentMonthStr,
      },
    ];

    for (const b of sampleBudgets) {
      await Budget.findOneAndUpdate(
        { user: b.user, category: b.category, month: b.month },
        b,
        { upsert: true }
      );
    }

    console.log('✅ Demo seed data created successfully!');
    return demoUser;
  } catch (error) {
    console.error('Error seeding demo data:', error.message);
  }
};

module.exports = { seedData };

if (require.main === module) {
  require('dotenv').config({ path: '../.env' });
  const { connectDB, disconnectDB } = require('../config/db');
  connectDB().then(async () => {
    await seedData();
    await disconnectDB();
    process.exit(0);
  });
}
