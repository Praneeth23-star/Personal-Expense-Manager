const Goal = require('../models/Goal');
const { LocalGoal } = require('../config/localStore');

// @desc    Get all goals for user
// @route   GET /api/goals
// @access  Private
exports.getGoals = async (req, res) => {
  try {
    let goals;
    if (global.isMongoConnected) {
      goals = await Goal.find({ user: req.user._id }).sort({ deadline: 1 });
    } else {
      goals = await LocalGoal.find(req.user._id);
    }

    const now = new Date();
    const enriched = goals.map((g) => {
      const target = Number(g.targetAmount);
      const current = Number(g.currentAmount);
      const percentage = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
      const deadlineDate = new Date(g.deadline);
      const diffTime = deadlineDate.getTime() - now.getTime();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        _id: g._id,
        title: g.title,
        targetAmount: target,
        currentAmount: current,
        remainingAmount: Math.max(0, target - current),
        deadline: g.deadline,
        daysLeft,
        category: g.category,
        color: g.color,
        percentage,
        isCompleted: current >= target || Boolean(g.isCompleted),
      };
    });

    res.json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching goals',
    });
  }
};

// @desc    Create a new goal
// @route   POST /api/goals
// @access  Private
exports.createGoal = async (req, res) => {
  try {
    const { title, targetAmount, currentAmount, deadline, category, color } = req.body;

    if (!title || !targetAmount || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Title, target amount, and deadline are required',
      });
    }

    if (global.isMongoConnected) {
      const goal = await Goal.create({
        user: req.user._id,
        title,
        targetAmount: Number(targetAmount),
        currentAmount: Number(currentAmount || 0),
        deadline: new Date(deadline),
        category: category || 'Savings',
        color: color || '#4f46e5',
        isCompleted: Number(currentAmount || 0) >= Number(targetAmount),
      });
      return res.status(201).json({ success: true, data: goal });
    } else {
      const goal = await LocalGoal.create(req.body, req.user._id);
      return res.status(201).json({ success: true, data: goal });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating goal',
    });
  }
};

// @desc    Deposit / Add funds into goal
// @route   POST /api/goals/:id/deposit
// @access  Private
exports.depositToGoal = async (req, res) => {
  try {
    const { amount } = req.body;
    const addAmount = Number(amount);

    if (!addAmount || addAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid deposit amount',
      });
    }

    if (global.isMongoConnected) {
      const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
      if (!goal) {
        return res.status(404).json({ success: false, message: 'Goal not found' });
      }

      goal.currentAmount += addAmount;
      if (goal.currentAmount >= goal.targetAmount) {
        goal.isCompleted = true;
      }
      await goal.save();
      return res.json({ success: true, data: goal });
    } else {
      const goal = await LocalGoal.findById(req.params.id, req.user._id);
      if (!goal) {
        return res.status(404).json({ success: false, message: 'Goal not found' });
      }
      const newAmount = goal.currentAmount + addAmount;
      const updated = await LocalGoal.update(req.params.id, req.user._id, {
        currentAmount: newAmount,
        isCompleted: newAmount >= goal.targetAmount,
      });
      return res.json({ success: true, data: updated });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error depositing to goal',
    });
  }
};

// @desc    Update goal
// @route   PUT /api/goals/:id
// @access  Private
exports.updateGoal = async (req, res) => {
  try {
    if (global.isMongoConnected) {
      const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
      if (!goal) {
        return res.status(404).json({ success: false, message: 'Goal not found' });
      }

      const { title, targetAmount, currentAmount, deadline, category, color, isCompleted } = req.body;
      if (title) goal.title = title;
      if (targetAmount !== undefined) goal.targetAmount = Number(targetAmount);
      if (currentAmount !== undefined) goal.currentAmount = Number(currentAmount);
      if (deadline) goal.deadline = new Date(deadline);
      if (category) goal.category = category;
      if (color) goal.color = color;
      if (isCompleted !== undefined) goal.isCompleted = Boolean(isCompleted);

      await goal.save();
      return res.json({ success: true, data: goal });
    } else {
      const updated = await LocalGoal.update(req.params.id, req.user._id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Goal not found' });
      }
      return res.json({ success: true, data: updated });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating goal',
    });
  }
};

// @desc    Delete goal
// @route   DELETE /api/goals/:id
// @access  Private
exports.deleteGoal = async (req, res) => {
  try {
    if (global.isMongoConnected) {
      const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
      if (!goal) {
        return res.status(404).json({ success: false, message: 'Goal not found' });
      }
    } else {
      const ok = await LocalGoal.delete(req.params.id, req.user._id);
      if (!ok) {
        return res.status(404).json({ success: false, message: 'Goal not found' });
      }
    }
    res.json({ success: true, message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting goal',
    });
  }
};
