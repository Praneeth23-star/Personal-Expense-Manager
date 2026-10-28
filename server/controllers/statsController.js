const Transaction = require('../models/Transaction');
const { LocalTransaction } = require('../config/localStore');

// @desc    Get dashboard summary statistics
// @route   GET /api/stats/dashboard
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    if (global.isMongoConnected) {
      // 1. Overall Totals
      const totalsAggregation = await Transaction.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]);

      let totalIncome = 0;
      let totalExpense = 0;
      let transactionCount = 0;

      totalsAggregation.forEach((item) => {
        if (item._id === 'income') totalIncome = item.total;
        if (item._id === 'expense') totalExpense = item.total;
        transactionCount += item.count;
      });

      const netBalance = totalIncome - totalExpense;
      const savingsRate =
        totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

      // 2. Current Month Totals
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      const monthTotals = await Transaction.aggregate([
        {
          $match: {
            user: userId,
            date: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' },
          },
        },
      ]);

      let currentMonthIncome = 0;
      let currentMonthExpense = 0;

      monthTotals.forEach((item) => {
        if (item._id === 'income') currentMonthIncome = item.total;
        if (item._id === 'expense') currentMonthExpense = item.total;
      });

      // 3. Category Breakdown (Expenses)
      const categoryBreakdown = await Transaction.aggregate([
        { $match: { user: userId, type: 'expense' } },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
      ]);

      // 4. Payment Method Distribution
      const paymentMethodStats = await Transaction.aggregate([
        { $match: { user: userId, type: 'expense' } },
        {
          $group: {
            _id: '$paymentMethod',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
      ]);

      // 5. Monthly Trend
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const trendMap = {};

      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
        trendMap[key] = { label, income: 0, expense: 0 };
      }

      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
      sixMonthsAgo.setDate(1);
      sixMonthsAgo.setHours(0, 0, 0, 0);

      const monthlyTrendAggregation = await Transaction.aggregate([
        { $match: { user: userId, date: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' },
              type: '$type',
            },
            total: { $sum: '$amount' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]);

      monthlyTrendAggregation.forEach((item) => {
        const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
        if (trendMap[key]) {
          if (item._id.type === 'income') trendMap[key].income = item.total;
          if (item._id.type === 'expense') trendMap[key].expense = item.total;
        }
      });

      return res.json({
        success: true,
        data: {
          totalIncome,
          totalExpense,
          netBalance,
          savingsRate,
          transactionCount,
          currentMonth: {
            income: currentMonthIncome,
            expense: currentMonthExpense,
            net: currentMonthIncome - currentMonthExpense,
          },
          categoryBreakdown,
          paymentMethodStats,
          monthlyTrend: Object.values(trendMap),
        },
      });
    } else {
      // Local fallback calculation
      const { list: allTx } = await LocalTransaction.find({ user: userId });

      let totalIncome = 0;
      let totalExpense = 0;
      let currentMonthIncome = 0;
      let currentMonthExpense = 0;
      const categoryMap = {};
      const paymentMap = {};

      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      // Trend Map for last 6 months
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const trendMap = {};
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
        trendMap[key] = { label, income: 0, expense: 0 };
      }

      allTx.forEach((tx) => {
        const amt = Number(tx.amount);
        const txMonthKey = tx.date ? tx.date.slice(0, 7) : '';

        if (tx.type === 'income') {
          totalIncome += amt;
          if (txMonthKey === currentMonthKey) currentMonthIncome += amt;
          if (trendMap[txMonthKey]) trendMap[txMonthKey].income += amt;
        } else {
          totalExpense += amt;
          if (txMonthKey === currentMonthKey) currentMonthExpense += amt;
          if (trendMap[txMonthKey]) trendMap[txMonthKey].expense += amt;

          categoryMap[tx.category] = (categoryMap[tx.category] || 0) + amt;
          const method = tx.paymentMethod || 'Other';
          paymentMap[method] = (paymentMap[method] || 0) + amt;
        }
      });

      const netBalance = totalIncome - totalExpense;
      const savingsRate =
        totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

      const categoryBreakdown = Object.entries(categoryMap)
        .map(([_id, total]) => ({ _id, total }))
        .sort((a, b) => b.total - a.total);

      const paymentMethodStats = Object.entries(paymentMap)
        .map(([_id, total]) => ({ _id, total }))
        .sort((a, b) => b.total - a.total);

      return res.json({
        success: true,
        data: {
          totalIncome,
          totalExpense,
          netBalance,
          savingsRate,
          transactionCount: allTx.length,
          currentMonth: {
            income: currentMonthIncome,
            expense: currentMonthExpense,
            net: currentMonthIncome - currentMonthExpense,
          },
          categoryBreakdown,
          paymentMethodStats,
          monthlyTrend: Object.values(trendMap),
        },
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating dashboard statistics',
    });
  }
};
