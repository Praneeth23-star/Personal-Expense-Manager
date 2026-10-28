const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const { LocalBudget, LocalTransaction } = require('../config/localStore');

// @desc    Get budgets with current spent amounts for a month
// @route   GET /api/budgets
// @access  Private
exports.getBudgets = async (req, res) => {
  try {
    const currentMonth = req.query.month || new Date().toISOString().slice(0, 7); // 'YYYY-MM'

    if (global.isMongoConnected) {
      const [year, month] = currentMonth.split('-').map(Number);
      const startDate = new Date(Date.UTC(year, month - 1, 1));
      const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

      const budgets = await Budget.find({
        user: req.user._id,
        month: currentMonth,
      });

      const expenseAggregation = await Transaction.aggregate([
        {
          $match: {
            user: req.user._id,
            type: 'expense',
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: '$category',
            totalSpent: { $sum: '$amount' },
          },
        },
      ]);

      const spentMap = {};
      expenseAggregation.forEach((item) => {
        spentMap[item._id] = item.totalSpent;
      });

      const budgetsWithProgress = budgets.map((b) => {
        const spent = spentMap[b.category] || 0;
        const percentage = Math.round((spent / b.limit) * 100);
        let status = 'good';
        if (percentage >= 100) status = 'exceeded';
        else if (percentage >= 80) status = 'warning';

        return {
          _id: b._id,
          category: b.category,
          limit: b.limit,
          month: b.month,
          spent,
          remaining: Math.max(0, b.limit - spent),
          percentage,
          status,
        };
      });

      return res.json({ success: true, month: currentMonth, data: budgetsWithProgress });
    } else {
      // Local fallback
      const budgets = await LocalBudget.findForMonth(req.user._id, currentMonth);
      const { list: allTx } = await LocalTransaction.find({ user: req.user._id, type: 'expense' });

      const spentMap = {};
      allTx.forEach((tx) => {
        const txMonth = tx.date.slice(0, 7);
        if (txMonth === currentMonth) {
          spentMap[tx.category] = (spentMap[tx.category] || 0) + tx.amount;
        }
      });

      const budgetsWithProgress = budgets.map((b) => {
        const spent = spentMap[b.category] || 0;
        const percentage = Math.round((spent / b.limit) * 100);
        let status = 'good';
        if (percentage >= 100) status = 'exceeded';
        else if (percentage >= 80) status = 'warning';

        return {
          _id: b._id,
          category: b.category,
          limit: b.limit,
          month: b.month,
          spent,
          remaining: Math.max(0, b.limit - spent),
          percentage,
          status,
        };
      });

      return res.json({ success: true, month: currentMonth, data: budgetsWithProgress });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching budgets',
    });
  }
};

// @desc    Create or update a budget limit
// @route   POST /api/budgets
// @access  Private
exports.setBudget = async (req, res) => {
  try {
    const { category, limit, month } = req.body;

    if (!category || !limit) {
      return res.status(400).json({
        success: false,
        message: 'Category and limit are required',
      });
    }

    const targetMonth = month || new Date().toISOString().slice(0, 7);

    if (global.isMongoConnected) {
      const budget = await Budget.findOneAndUpdate(
        { user: req.user._id, category, month: targetMonth },
        { user: req.user._id, category, limit: Number(limit), month: targetMonth },
        { new: true, upsert: true, runValidators: true }
      );
      return res.status(200).json({ success: true, data: budget });
    } else {
      const budget = await LocalBudget.upsert(req.user._id, category, limit, targetMonth);
      return res.status(200).json({ success: true, data: budget });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error setting budget',
    });
  }
};

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
// @access  Private
exports.deleteBudget = async (req, res) => {
  try {
    if (global.isMongoConnected) {
      const budget = await Budget.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id,
      });
      if (!budget) {
        return res.status(404).json({ success: false, message: 'Budget not found' });
      }
    } else {
      const ok = await LocalBudget.delete(req.params.id, req.user._id);
      if (!ok) {
        return res.status(404).json({ success: false, message: 'Budget not found' });
      }
    }

    res.json({ success: true, message: 'Budget deleted successfully' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting budget',
    });
  }
};
