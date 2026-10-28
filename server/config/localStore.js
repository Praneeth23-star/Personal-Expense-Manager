const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const usersFile = path.join(dataDir, 'users.json');
const transactionsFile = path.join(dataDir, 'transactions.json');
const budgetsFile = path.join(dataDir, 'budgets.json');
const goalsFile = path.join(dataDir, 'goals.json');
const subscriptionsFile = path.join(dataDir, 'subscriptions.json');

const loadFile = (file) => {
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
  } catch (e) {
    console.error(`Error reading ${file}:`, e.message);
  }
  return [];
};

const saveFile = (file, data) => {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error(`Error writing ${file}:`, e.message);
  }

  // Ensure goals and subscriptions are seeded even if user already exists
  const demoUser = users.find((u) => u.email === 'demo@expensemanager.com');
  const demoId = demoUser ? demoUser._id : 'demo-user-id-12345';
  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth();

  if (goals.length === 0) {
    goals = [
      {
        _id: generateId(),
        user: demoId,
        title: 'Emergency Rainy Day Fund',
        targetAmount: 5000,
        currentAmount: 2650,
        deadline: new Date(curYear, curMonth + 6, 1).toISOString(),
        category: 'Emergency',
        color: '#10b981',
        isCompleted: false,
        createdAt: new Date().toISOString(),
      },
      {
        _id: generateId(),
        user: demoId,
        title: 'New High-End Development Laptop',
        targetAmount: 1800,
        currentAmount: 1200,
        deadline: new Date(curYear, curMonth + 3, 15).toISOString(),
        category: 'Gadget',
        color: '#6366f1',
        isCompleted: false,
        createdAt: new Date().toISOString(),
      },
      {
        _id: generateId(),
        user: demoId,
        title: 'Summer Vacation Trip',
        targetAmount: 2500,
        currentAmount: 950,
        deadline: new Date(curYear, curMonth + 8, 1).toISOString(),
        category: 'Travel',
        color: '#f59e0b',
        isCompleted: false,
        createdAt: new Date().toISOString(),
      },
    ];
    saveFile(goalsFile, goals);
  }

  if (subscriptions.length === 0) {
    subscriptions = [
      {
        _id: generateId(),
        user: demoId,
        name: 'Netflix 4K Premium',
        amount: 19.99,
        billingCycle: 'monthly',
        category: 'Entertainment',
        nextBillingDate: new Date(curYear, curMonth, 18).toISOString(),
        autoRenew: true,
        notes: 'Family streaming bundle',
        createdAt: new Date().toISOString(),
      },
      {
        _id: generateId(),
        user: demoId,
        name: 'Spotify Premium Individual',
        amount: 10.99,
        billingCycle: 'monthly',
        category: 'Entertainment',
        nextBillingDate: new Date(curYear, curMonth, 22).toISOString(),
        autoRenew: true,
        notes: 'Music & podcasts',
        createdAt: new Date().toISOString(),
      },
      {
        _id: generateId(),
        user: demoId,
        name: 'Gym & Fitness Membership',
        amount: 45.00,
        billingCycle: 'monthly',
        category: 'Health',
        nextBillingDate: new Date(curYear, curMonth, 25).toISOString(),
        autoRenew: true,
        notes: 'Includes pool and yoga classes',
        createdAt: new Date().toISOString(),
      },
      {
        _id: generateId(),
        user: demoId,
        name: 'High-Speed Fiber Internet',
        amount: 60.00,
        billingCycle: 'monthly',
        category: 'Utilities',
        nextBillingDate: new Date(curYear, curMonth, 28).toISOString(),
        autoRenew: true,
        notes: 'Gigabit home internet',
        createdAt: new Date().toISOString(),
      },
    ];
    saveFile(subscriptionsFile, subscriptions);
  }
};

let users = loadFile(usersFile);
let transactions = loadFile(transactionsFile);
let budgets = loadFile(budgetsFile);
let goals = loadFile(goalsFile);
let subscriptions = loadFile(subscriptionsFile);

const generateId = () => {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
};

// Seed demo user if empty
const initDemoData = async () => {
  if (users.length === 0) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    const demoId = 'demo-user-id-12345';
    const demoUser = {
      _id: demoId,
      name: 'Alex Johnson',
      email: 'demo@expensemanager.com',
      password: hashedPassword,
      currency: '$',
      createdAt: new Date().toISOString(),
    };
    users.push(demoUser);
    saveFile(usersFile, users);
    console.log('👤 Created demo user in local store: demo@expensemanager.com');

    // Seed transactions for demo user
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();
    const curMonthStr = `${curYear}-${String(curMonth + 1).padStart(2, '0')}`;

    transactions = [
      {
        _id: generateId(),
        user: demoId,
        title: 'Monthly Tech Salary',
        amount: 4500,
        type: 'income',
        category: 'Salary',
        date: new Date(curYear, curMonth, 1).toISOString(),
        paymentMethod: 'UPI / NetBanking',
        notes: 'Monthly direct deposit paycheck',
        isRecurring: true,
        receiptImage: '',
      },
      {
        _id: generateId(),
        user: demoId,
        title: 'Freelance Web Project',
        amount: 850,
        type: 'income',
        category: 'Freelance',
        date: new Date(curYear, curMonth, 5).toISOString(),
        paymentMethod: 'UPI / NetBanking',
        notes: 'Client invoice #1042',
        isRecurring: false,
        receiptImage: '',
      },
      {
        _id: generateId(),
        user: demoId,
        title: 'Apartment Monthly Rent',
        amount: 1400,
        type: 'expense',
        category: 'Housing & Rent',
        date: new Date(curYear, curMonth, 1).toISOString(),
        paymentMethod: 'UPI / NetBanking',
        notes: 'Monthly residential apartment rent',
        isRecurring: true,
        receiptImage: '',
      },
      {
        _id: generateId(),
        user: demoId,
        title: 'Whole Foods Grocery Run',
        amount: 184.5,
        type: 'expense',
        category: 'Groceries',
        date: new Date(curYear, curMonth, 2).toISOString(),
        paymentMethod: 'Credit Card',
        notes: 'Weekly pantry essentials and organic veggies',
        isRecurring: false,
        receiptImage: '',
      },
      {
        _id: generateId(),
        user: demoId,
        title: 'Electric & Water Utility Bill',
        amount: 125,
        type: 'expense',
        category: 'Utilities',
        date: new Date(curYear, curMonth, 3).toISOString(),
        paymentMethod: 'Credit Card',
        notes: 'City power & water services',
        isRecurring: true,
        receiptImage: '',
      },
      {
        _id: generateId(),
        user: demoId,
        title: 'Dinner at Italian Bistro',
        amount: 72.8,
        type: 'expense',
        category: 'Food & Dining',
        date: new Date(curYear, curMonth, 4).toISOString(),
        paymentMethod: 'Credit Card',
        notes: 'Dinner with friends',
        isRecurring: false,
        receiptImage: '',
      },
      {
        _id: generateId(),
        user: demoId,
        title: 'Gasoline & Fuel',
        amount: 48,
        type: 'expense',
        category: 'Transportation',
        date: new Date(curYear, curMonth, 5).toISOString(),
        paymentMethod: 'Debit Card',
        notes: 'Full tank fill-up',
        isRecurring: false,
        receiptImage: '',
      },
      {
        _id: generateId(),
        user: demoId,
        title: 'Streaming Subscriptions',
        amount: 28.98,
        type: 'expense',
        category: 'Entertainment',
        date: new Date(curYear, curMonth, 6).toISOString(),
        paymentMethod: 'Credit Card',
        notes: 'Netflix & Spotify',
        isRecurring: true,
        receiptImage: '',
      },
      // Previous month sample
      {
        _id: generateId(),
        user: demoId,
        title: 'Monthly Tech Salary',
        amount: 4500,
        type: 'income',
        category: 'Salary',
        date: new Date(curYear, curMonth - 1, 1).toISOString(),
        paymentMethod: 'UPI / NetBanking',
        notes: 'Direct deposit',
        isRecurring: true,
        receiptImage: '',
      },
      {
        _id: generateId(),
        user: demoId,
        title: 'Apartment Monthly Rent',
        amount: 1400,
        type: 'expense',
        category: 'Housing & Rent',
        date: new Date(curYear, curMonth - 1, 1).toISOString(),
        paymentMethod: 'UPI / NetBanking',
        notes: 'Rent',
        isRecurring: true,
        receiptImage: '',
      },
      {
        _id: generateId(),
        user: demoId,
        title: 'Supermarket Groceries',
        amount: 390,
        type: 'expense',
        category: 'Groceries',
        date: new Date(curYear, curMonth - 1, 10).toISOString(),
        paymentMethod: 'Credit Card',
        notes: 'Monthly supplies',
        isRecurring: false,
        receiptImage: '',
      },
    ];
    saveFile(transactionsFile, transactions);

    budgets = [
      {
        _id: generateId(),
        user: demoId,
        category: 'Housing & Rent',
        limit: 1500,
        month: curMonthStr,
      },
      {
        _id: generateId(),
        user: demoId,
        category: 'Groceries',
        limit: 450,
        month: curMonthStr,
      },
      {
        _id: generateId(),
        user: demoId,
        category: 'Food & Dining',
        limit: 250,
        month: curMonthStr,
      },
      {
        _id: generateId(),
        user: demoId,
        category: 'Utilities',
        limit: 200,
        month: curMonthStr,
      },
    ];
    saveFile(budgetsFile, budgets);

    // Initial Goals
    goals = [
      {
        _id: generateId(),
        user: demoId,
        title: 'Emergency Rainy Day Fund',
        targetAmount: 5000,
        currentAmount: 2650,
        deadline: new Date(curYear, curMonth + 6, 1).toISOString(),
        category: 'Emergency',
        color: '#10b981',
        isCompleted: false,
        createdAt: new Date().toISOString(),
      },
      {
        _id: generateId(),
        user: demoId,
        title: 'New High-End Development Laptop',
        targetAmount: 1800,
        currentAmount: 1200,
        deadline: new Date(curYear, curMonth + 3, 15).toISOString(),
        category: 'Gadget',
        color: '#6366f1',
        isCompleted: false,
        createdAt: new Date().toISOString(),
      },
      {
        _id: generateId(),
        user: demoId,
        title: 'Summer Vacation Trip',
        targetAmount: 2500,
        currentAmount: 950,
        deadline: new Date(curYear, curMonth + 8, 1).toISOString(),
        category: 'Travel',
        color: '#f59e0b',
        isCompleted: false,
        createdAt: new Date().toISOString(),
      },
    ];
    saveFile(goalsFile, goals);

    // Initial Subscriptions
    subscriptions = [
      {
        _id: generateId(),
        user: demoId,
        name: 'Netflix 4K Premium',
        amount: 19.99,
        billingCycle: 'monthly',
        category: 'Entertainment',
        nextBillingDate: new Date(curYear, curMonth, 18).toISOString(),
        autoRenew: true,
        notes: 'Family streaming bundle',
        createdAt: new Date().toISOString(),
      },
      {
        _id: generateId(),
        user: demoId,
        name: 'Spotify Premium Individual',
        amount: 10.99,
        billingCycle: 'monthly',
        category: 'Entertainment',
        nextBillingDate: new Date(curYear, curMonth, 22).toISOString(),
        autoRenew: true,
        notes: 'Music & podcasts',
        createdAt: new Date().toISOString(),
      },
      {
        _id: generateId(),
        user: demoId,
        name: 'Gym & Fitness Membership',
        amount: 45.00,
        billingCycle: 'monthly',
        category: 'Health',
        nextBillingDate: new Date(curYear, curMonth, 25).toISOString(),
        autoRenew: true,
        notes: 'Includes pool and yoga classes',
        createdAt: new Date().toISOString(),
      },
      {
        _id: generateId(),
        user: demoId,
        name: 'High-Speed Fiber Internet',
        amount: 60.00,
        billingCycle: 'monthly',
        category: 'Utilities',
        nextBillingDate: new Date(curYear, curMonth, 28).toISOString(),
        autoRenew: true,
        notes: 'Gigabit home internet',
        createdAt: new Date().toISOString(),
      },
    ];
    saveFile(subscriptionsFile, subscriptions);

    console.log('🌱 Seeded demo data, goals, and subscriptions in local store.');
  }

  // Ensure goals and subscriptions are seeded even if user already exists
  const demoUser = users.find((u) => u.email === 'demo@expensemanager.com');
  const demoId = demoUser ? demoUser._id : 'demo-user-id-12345';
  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth();

  if (goals.length === 0) {
    goals = [
      {
        _id: generateId(),
        user: demoId,
        title: 'Emergency Rainy Day Fund',
        targetAmount: 5000,
        currentAmount: 2650,
        deadline: new Date(curYear, curMonth + 6, 1).toISOString(),
        category: 'Emergency',
        color: '#10b981',
        isCompleted: false,
        createdAt: new Date().toISOString(),
      },
      {
        _id: generateId(),
        user: demoId,
        title: 'New High-End Development Laptop',
        targetAmount: 1800,
        currentAmount: 1200,
        deadline: new Date(curYear, curMonth + 3, 15).toISOString(),
        category: 'Gadget',
        color: '#6366f1',
        isCompleted: false,
        createdAt: new Date().toISOString(),
      },
      {
        _id: generateId(),
        user: demoId,
        title: 'Summer Vacation Trip',
        targetAmount: 2500,
        currentAmount: 950,
        deadline: new Date(curYear, curMonth + 8, 1).toISOString(),
        category: 'Travel',
        color: '#f59e0b',
        isCompleted: false,
        createdAt: new Date().toISOString(),
      },
    ];
    saveFile(goalsFile, goals);
  }

  if (subscriptions.length === 0) {
    subscriptions = [
      {
        _id: generateId(),
        user: demoId,
        name: 'Netflix 4K Premium',
        amount: 19.99,
        billingCycle: 'monthly',
        category: 'Entertainment',
        nextBillingDate: new Date(curYear, curMonth, 18).toISOString(),
        autoRenew: true,
        notes: 'Family streaming bundle',
        createdAt: new Date().toISOString(),
      },
      {
        _id: generateId(),
        user: demoId,
        name: 'Spotify Premium Individual',
        amount: 10.99,
        billingCycle: 'monthly',
        category: 'Entertainment',
        nextBillingDate: new Date(curYear, curMonth, 22).toISOString(),
        autoRenew: true,
        notes: 'Music & podcasts',
        createdAt: new Date().toISOString(),
      },
      {
        _id: generateId(),
        user: demoId,
        name: 'Gym & Fitness Membership',
        amount: 45.00,
        billingCycle: 'monthly',
        category: 'Health',
        nextBillingDate: new Date(curYear, curMonth, 25).toISOString(),
        autoRenew: true,
        notes: 'Includes pool and yoga classes',
        createdAt: new Date().toISOString(),
      },
      {
        _id: generateId(),
        user: demoId,
        name: 'High-Speed Fiber Internet',
        amount: 60.00,
        billingCycle: 'monthly',
        category: 'Utilities',
        nextBillingDate: new Date(curYear, curMonth, 28).toISOString(),
        autoRenew: true,
        notes: 'Gigabit home internet',
        createdAt: new Date().toISOString(),
      },
    ];
    saveFile(subscriptionsFile, subscriptions);
  }
};

initDemoData();

const LocalUser = {
  findOne: async (query) => {
    users = loadFile(usersFile);
    const user = users.find((u) => {
      if (query.email && u.email.toLowerCase() === query.email.toLowerCase()) return true;
      if (query._id && u._id === query._id.toString()) return true;
      return false;
    });
    if (!user) return null;
    return {
      ...user,
      matchPassword: async (pwd) => bcrypt.compare(pwd, user.password),
    };
  },
  findById: async (id) => {
    users = loadFile(usersFile);
    const targetId = id?.toString ? id.toString() : id;
    const user = users.find((u) => u._id === targetId);
    if (!user) return null;
    return {
      ...user,
      matchPassword: async (pwd) => bcrypt.compare(pwd, user.password),
      save: async function () {
        const idx = users.findIndex((u) => u._id === this._id);
        if (idx !== -1) {
          users[idx] = { ...this };
          saveFile(usersFile, users);
        }
        return this;
      },
    };
  },
  create: async ({ name, email, password, currency }) => {
    users = loadFile(usersFile);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = {
      _id: generateId(),
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      currency: currency || '$',
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    saveFile(usersFile, users);
    return {
      ...newUser,
      matchPassword: async (pwd) => bcrypt.compare(pwd, hashedPassword),
    };
  },
};

const LocalTransaction = {
  find: async (query = {}, options = {}) => {
    transactions = loadFile(transactionsFile);
    let list = transactions.filter((t) => {
      if (query.user && t.user.toString() !== query.user.toString()) return false;
      if (query.type && t.type !== query.type) return false;
      if (query.category && t.category !== query.category) return false;
      if (query.paymentMethod && t.paymentMethod !== query.paymentMethod) return false;
      if (query.date) {
        const txDate = new Date(t.date).getTime();
        if (query.date.$gte && txDate < new Date(query.date.$gte).getTime()) return false;
        if (query.date.$lte && txDate > new Date(query.date.$lte).getTime()) return false;
      }
      if (query.$or) {
        const search = options.search?.toLowerCase() || '';
        const match =
          t.title.toLowerCase().includes(search) ||
          (t.notes && t.notes.toLowerCase().includes(search)) ||
          t.category.toLowerCase().includes(search);
        if (!match) return false;
      }
      return true;
    });

    // Sorting
    const sortBy = options.sortBy || 'date';
    const sortOrder = options.sortOrder || 'desc';
    list.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (sortBy === 'date') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    const total = list.length;
    if (options.skip !== undefined && options.limit !== undefined) {
      list = list.slice(options.skip, options.skip + options.limit);
    }

    return { list, total };
  },
  create: async (data) => {
    transactions = loadFile(transactionsFile);
    const newTx = {
      _id: generateId(),
      user: data.user.toString(),
      title: data.title,
      amount: Number(data.amount),
      type: data.type || 'expense',
      category: data.category,
      date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      paymentMethod: data.paymentMethod || 'Credit Card',
      notes: data.notes || '',
      isRecurring: Boolean(data.isRecurring),
      receiptImage: data.receiptImage || '',
      createdAt: new Date().toISOString(),
    };
    transactions.unshift(newTx);
    saveFile(transactionsFile, transactions);
    return newTx;
  },
  bulkCreate: async (items, userId) => {
    transactions = loadFile(transactionsFile);
    const created = items.map((item) => ({
      _id: generateId(),
      user: userId.toString(),
      title: item.title,
      amount: Number(item.amount),
      type: item.type || 'expense',
      category: item.category || 'Other',
      date: item.date ? new Date(item.date).toISOString() : new Date().toISOString(),
      paymentMethod: item.paymentMethod || 'Credit Card',
      notes: item.notes || 'Imported via CSV',
      isRecurring: false,
      receiptImage: '',
      createdAt: new Date().toISOString(),
    }));
    transactions = [...created, ...transactions];
    saveFile(transactionsFile, transactions);
    return created;
  },
  findById: async (id, userId) => {
    transactions = loadFile(transactionsFile);
    return transactions.find((t) => t._id === id.toString() && t.user === userId.toString());
  },
  update: async (id, userId, updates) => {
    transactions = loadFile(transactionsFile);
    const idx = transactions.findIndex((t) => t._id === id.toString() && t.user === userId.toString());
    if (idx === -1) return null;
    transactions[idx] = {
      ...transactions[idx],
      ...updates,
      amount: updates.amount !== undefined ? Number(updates.amount) : transactions[idx].amount,
    };
    saveFile(transactionsFile, transactions);
    return transactions[idx];
  },
  delete: async (id, userId) => {
    transactions = loadFile(transactionsFile);
    const idx = transactions.findIndex((t) => t._id === id.toString() && t.user === userId.toString());
    if (idx === -1) return false;
    transactions.splice(idx, 1);
    saveFile(transactionsFile, transactions);
    return true;
  },
};

const LocalBudget = {
  findForMonth: async (userId, month) => {
    budgets = loadFile(budgetsFile);
    return budgets.filter((b) => b.user === userId.toString() && b.month === month);
  },
  upsert: async (userId, category, limit, month) => {
    budgets = loadFile(budgetsFile);
    const idx = budgets.findIndex((b) => b.user === userId.toString() && b.category === category && b.month === month);
    if (idx !== -1) {
      budgets[idx].limit = Number(limit);
      saveFile(budgetsFile, budgets);
      return budgets[idx];
    }
    const newBudget = {
      _id: generateId(),
      user: userId.toString(),
      category,
      limit: Number(limit),
      month,
      createdAt: new Date().toISOString(),
    };
    budgets.push(newBudget);
    saveFile(budgetsFile, budgets);
    return newBudget;
  },
  delete: async (id, userId) => {
    budgets = loadFile(budgetsFile);
    const idx = budgets.findIndex((b) => b._id === id.toString() && b.user === userId.toString());
    if (idx === -1) return false;
    budgets.splice(idx, 1);
    saveFile(budgetsFile, budgets);
    return true;
  },
};

const LocalGoal = {
  find: async (userId) => {
    goals = loadFile(goalsFile);
    return goals.filter((g) => g.user === userId.toString());
  },
  findById: async (id, userId) => {
    goals = loadFile(goalsFile);
    return goals.find((g) => g._id === id.toString() && g.user === userId.toString());
  },
  create: async (data, userId) => {
    goals = loadFile(goalsFile);
    const newGoal = {
      _id: generateId(),
      user: userId.toString(),
      title: data.title,
      targetAmount: Number(data.targetAmount),
      currentAmount: Number(data.currentAmount || 0),
      deadline: new Date(data.deadline).toISOString(),
      category: data.category || 'Savings',
      color: data.color || '#4f46e5',
      isCompleted: Number(data.currentAmount || 0) >= Number(data.targetAmount),
      createdAt: new Date().toISOString(),
    };
    goals.push(newGoal);
    saveFile(goalsFile, goals);
    return newGoal;
  },
  update: async (id, userId, updates) => {
    goals = loadFile(goalsFile);
    const idx = goals.findIndex((g) => g._id === id.toString() && g.user === userId.toString());
    if (idx === -1) return null;
    const current = goals[idx];
    const targetAmount = updates.targetAmount !== undefined ? Number(updates.targetAmount) : current.targetAmount;
    const currentAmount = updates.currentAmount !== undefined ? Number(updates.currentAmount) : current.currentAmount;
    goals[idx] = {
      ...current,
      ...updates,
      targetAmount,
      currentAmount,
      isCompleted: currentAmount >= targetAmount,
    };
    saveFile(goalsFile, goals);
    return goals[idx];
  },
  delete: async (id, userId) => {
    goals = loadFile(goalsFile);
    const idx = goals.findIndex((g) => g._id === id.toString() && g.user === userId.toString());
    if (idx === -1) return false;
    goals.splice(idx, 1);
    saveFile(goalsFile, goals);
    return true;
  },
};

const LocalSubscription = {
  find: async (userId) => {
    subscriptions = loadFile(subscriptionsFile);
    return subscriptions.filter((s) => s.user === userId.toString());
  },
  create: async (data, userId) => {
    subscriptions = loadFile(subscriptionsFile);
    const newSub = {
      _id: generateId(),
      user: userId.toString(),
      name: data.name,
      amount: Number(data.amount),
      billingCycle: data.billingCycle || 'monthly',
      category: data.category || 'Entertainment',
      nextBillingDate: new Date(data.nextBillingDate).toISOString(),
      autoRenew: data.autoRenew !== undefined ? Boolean(data.autoRenew) : true,
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
    };
    subscriptions.push(newSub);
    saveFile(subscriptionsFile, subscriptions);
    return newSub;
  },
  update: async (id, userId, updates) => {
    subscriptions = loadFile(subscriptionsFile);
    const idx = subscriptions.findIndex((s) => s._id === id.toString() && s.user === userId.toString());
    if (idx === -1) return null;
    subscriptions[idx] = {
      ...subscriptions[idx],
      ...updates,
      amount: updates.amount !== undefined ? Number(updates.amount) : subscriptions[idx].amount,
    };
    saveFile(subscriptionsFile, subscriptions);
    return subscriptions[idx];
  },
  delete: async (id, userId) => {
    subscriptions = loadFile(subscriptionsFile);
    const idx = subscriptions.findIndex((s) => s._id === id.toString() && s.user === userId.toString());
    if (idx === -1) return false;
    subscriptions.splice(idx, 1);
    saveFile(subscriptionsFile, subscriptions);
    return true;
  },
};

module.exports = {
  LocalUser,
  LocalTransaction,
  LocalBudget,
  LocalGoal,
  LocalSubscription,
  initDemoData,
};
