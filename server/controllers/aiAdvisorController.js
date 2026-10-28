const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const Subscription = require('../models/Subscription');
const { LocalTransaction, LocalBudget, LocalGoal, LocalSubscription } = require('../config/localStore');

const NEEDS_CATEGORIES = ['Housing & Rent', 'Groceries', 'Utilities', 'Healthcare', 'Transportation', 'Education'];
const WANTS_CATEGORIES = ['Food & Dining', 'Entertainment', 'Shopping', 'Travel', 'Personal Care', 'Other Expense'];

// @desc    Get AI Financial Health Analysis & Smart Insights
// @route   GET /api/ai/insights
// @access  Private
exports.getFinancialInsights = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch transactions
    let allTx;
    if (global.isMongoConnected) {
      allTx = await Transaction.find({ user: userId });
    } else {
      const res = await LocalTransaction.find({ user: userId });
      allTx = res.list;
    }

    // Fetch budgets
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    let budgets;
    if (global.isMongoConnected) {
      budgets = await Budget.find({ user: userId, month: currentMonthKey });
    } else {
      budgets = await LocalBudget.findForMonth(userId, currentMonthKey);
    }

    // Fetch goals
    let goals;
    if (global.isMongoConnected) {
      goals = await Goal.find({ user: userId });
    } else {
      goals = await LocalGoal.find(userId);
    }

    // Current month transactions
    const currentMonthTx = allTx.filter((t) => {
      const d = t.date ? new Date(t.date).toISOString().slice(0, 7) : '';
      return d === currentMonthKey;
    });

    let monthIncome = 0;
    let monthExpense = 0;
    let needsSpent = 0;
    let wantsSpent = 0;
    const categoryTotals = {};

    currentMonthTx.forEach((tx) => {
      const amt = Number(tx.amount);
      if (tx.type === 'income') {
        monthIncome += amt;
      } else {
        monthExpense += amt;
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + amt;

        if (NEEDS_CATEGORIES.includes(tx.category)) {
          needsSpent += amt;
        } else {
          wantsSpent += amt;
        }
      }
    });

    const netSavings = Math.max(0, monthIncome - monthExpense);
    const savingsRate = monthIncome > 0 ? Math.round((netSavings / monthIncome) * 100) : 0;

    // 1. Calculate 50/30/20 breakdown
    const totalConsidered = monthIncome > 0 ? monthIncome : monthExpense;
    const needsPct = totalConsidered > 0 ? Math.round((needsSpent / totalConsidered) * 100) : 0;
    const wantsPct = totalConsidered > 0 ? Math.round((wantsSpent / totalConsidered) * 100) : 0;
    const savingsPct = totalConsidered > 0 ? Math.round((netSavings / totalConsidered) * 100) : 0;

    const rule503020 = {
      needs: { actual: needsSpent, percentage: needsPct, target: 50, status: needsPct <= 50 ? 'healthy' : 'high' },
      wants: { actual: wantsSpent, percentage: wantsPct, target: 30, status: wantsPct <= 30 ? 'healthy' : 'high' },
      savings: { actual: netSavings, percentage: savingsPct, target: 20, status: savingsPct >= 20 ? 'healthy' : 'low' },
    };

    // 2. Financial Health Score (0 - 100)
    let score = 50; // base score

    // Savings discipline (+/- 25 pts)
    if (savingsRate >= 25) score += 25;
    else if (savingsRate >= 15) score += 18;
    else if (savingsRate > 0) score += 10;
    else score -= 15;

    // Budget adherence (+/- 15 pts)
    if (budgets.length > 0) {
      let overBudgetCount = 0;
      budgets.forEach((b) => {
        const spent = categoryTotals[b.category] || 0;
        if (spent > b.limit) overBudgetCount++;
      });
      if (overBudgetCount === 0) score += 15;
      else score -= overBudgetCount * 5;
    } else {
      score += 5; // neutral
    }

    // Active Goals (+10 pts)
    if (goals.length > 0) {
      score += 10;
    }

    score = Math.max(10, Math.min(98, score));

    let grade = 'Fair';
    let gradeColor = '#f59e0b';
    if (score >= 85) {
      grade = 'Excellent';
      gradeColor = '#10b981';
    } else if (score >= 70) {
      grade = 'Good';
      gradeColor = '#3b82f6';
    } else if (score < 50) {
      grade = 'Needs Attention';
      gradeColor = '#ef4444';
    }

    // 3. Smart Anomalies & Recommendations
    const recommendations = [];
    if (wantsPct > 35) {
      recommendations.push({
        type: 'warning',
        title: 'High Discretionary Spending',
        description: `Your "Wants" categories account for ${wantsPct}% of cash flow (recommended is 30%). Trimming discretionary purchases could boost your savings.`,
      });
    }

    if (savingsRate < 15 && monthIncome > 0) {
      recommendations.push({
        type: 'info',
        title: 'Boost Rainy Day Reserves',
        description: `Your savings rate is currently ${savingsRate}%. Setting aside even 5% more could save you an extra ${req.user.currency || '$'}${Math.round(monthIncome * 0.05)} every month.`,
      });
    }

    // Check top category
    const topCategoryEntry = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
    if (topCategoryEntry) {
      const [topCat, topAmt] = topCategoryEntry;
      const catPct = monthExpense > 0 ? Math.round((topAmt / monthExpense) * 100) : 0;
      if (catPct >= 35) {
        recommendations.push({
          type: 'alert',
          title: `Heavy Outflow in ${topCat}`,
          description: `${topCat} accounts for ${catPct}% of all your monthly expenses (${req.user.currency || '$'}${topAmt.toLocaleString()}). Consider setting a strict monthly budget goal.`,
        });
      }
    }

    if (recommendations.length === 0) {
      recommendations.push({
        type: 'success',
        title: 'Outstanding Budgeting Discipline',
        description: 'Your cash flow is well-balanced. You are living below your means and building wealth steadily!',
      });
    }

    // 4. Predictive Month-End Forecast
    const dayOfMonth = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dailyBurnRate = dayOfMonth > 0 ? monthExpense / dayOfMonth : 0;
    const projectedEndExpense = Math.round(dailyBurnRate * daysInMonth);
    const projectedNetSavings = Math.round(monthIncome - projectedEndExpense);

    res.json({
      success: true,
      data: {
        score,
        grade,
        gradeColor,
        rule503020,
        monthIncome,
        monthExpense,
        netSavings,
        savingsRate,
        forecast: {
          daysRemaining: daysInMonth - dayOfMonth,
          dailyBurnRate: Math.round(dailyBurnRate),
          projectedEndExpense,
          projectedNetSavings,
        },
        recommendations,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating AI insights',
    });
  }
};

// @desc    Interactive AI Financial Advisor Chat
// @route   POST /api/ai/ask
// @access  Private
exports.askAdvisor = async (req, res) => {
  try {
    const { question } = req.body;
    const userId = req.user._id;

    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a question' });
    }

    // Retrieve user summary stats for context
    let allTx;
    if (global.isMongoConnected) {
      allTx = await Transaction.find({ user: userId });
    } else {
      const r = await LocalTransaction.find({ user: userId });
      allTx = r.list;
    }

    let income = 0;
    let expense = 0;
    const catMap = {};
    allTx.forEach((t) => {
      const a = Number(t.amount);
      if (t.type === 'income') income += a;
      else {
        expense += a;
        catMap[t.category] = (catMap[t.category] || 0) + a;
      }
    });

    const net = income - expense;
    const topCategory = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0] || ['None', 0];
    const currency = req.user.currency || '$';
    const lowerQ = question.toLowerCase();

    let answer = '';

    if (lowerQ.includes('save') || lowerQ.includes('saving') || lowerQ.includes('cut')) {
      answer = `Based on your recorded transactions, you have earned ${currency}${income.toLocaleString()} and spent ${currency}${expense.toLocaleString()}, leaving a net balance of ${currency}${net.toLocaleString()}.\n\nYour highest spending area is **${topCategory[0]}** (${currency}${topCategory[1].toLocaleString()}). If you trim this category by just 15%, you could redirect **${currency}${Math.round(topCategory[1] * 0.15).toLocaleString()}** directly toward your savings goals or emergency fund!`;
    } else if (lowerQ.includes('rule') || lowerQ.includes('50') || lowerQ.includes('budget')) {
      answer = `The **50/30/20 budget framework** is ideal for financial peace:\n• **50% Needs**: Housing, utilities, groceries, transport.\n• **30% Wants**: Dining out, subscriptions, shopping, hobbies.\n• **20% Savings/Investments**: Emergency reserve, debt payoff, retirement.\n\nCheck our "AI Financial Advisor" card on the Dashboard to see your exact percentage breakdown in real-time!`;
    } else if (lowerQ.includes('subscription') || lowerQ.includes('recurring') || lowerQ.includes('bill')) {
      answer = `Subscribing to streaming, software, and memberships can cause "subscription creep". Check our **Subscriptions & Bills** tab: we calculate your total annual burn rate and highlight subscriptions due within the next 7 days so you never incur unexpected charges.`;
    } else if (lowerQ.includes('invest') || lowerQ.includes('emergency') || lowerQ.includes('goal')) {
      answer = `Before aggressive investing, aim to maintain **3 to 6 months of essential living expenses** in a liquid emergency fund. Head to the **Savings Goals** tab to set a target fund with a visual progress tracker!`;
    } else {
      answer = `Hello ${req.user.name}! Here is a quick snapshot of your finances:\n• **Total Net Worth / Balance**: ${currency}${net.toLocaleString()}\n• **Total Inflows**: ${currency}${income.toLocaleString()}\n• **Total Outflows**: ${currency}${expense.toLocaleString()}\n• **Primary Spending Category**: ${topCategory[0]} (${currency}${topCategory[1].toLocaleString()})\n\nTip: You can set monthly budget targets in the **Budgets** tab to keep spending disciplined across all categories.`;
    }

    res.json({
      success: true,
      answer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error in AI advisor consultation',
    });
  }
};
