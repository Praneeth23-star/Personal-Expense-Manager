const Subscription = require('../models/Subscription');
const Transaction = require('../models/Transaction');
const { LocalSubscription, LocalTransaction } = require('../config/localStore');

// @desc    Get all subscriptions with monthly projected burn rate
// @route   GET /api/subscriptions
// @access  Private
exports.getSubscriptions = async (req, res) => {
  try {
    let subs;
    if (global.isMongoConnected) {
      subs = await Subscription.find({ user: req.user._id }).sort({ nextBillingDate: 1 });
    } else {
      subs = await LocalSubscription.find(req.user._id);
    }

    const now = new Date();
    let monthlyBurn = 0;

    const enriched = subs.map((s) => {
      let monthlyCost = Number(s.amount);
      if (s.billingCycle === 'yearly') monthlyCost = Number(s.amount) / 12;
      else if (s.billingCycle === 'quarterly') monthlyCost = Number(s.amount) / 3;

      monthlyBurn += monthlyCost;

      const nextDate = new Date(s.nextBillingDate);
      const diffTime = nextDate.getTime() - now.getTime();
      const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        _id: s._id,
        name: s.name,
        amount: Number(s.amount),
        monthlyCost: Math.round(monthlyCost * 100) / 100,
        billingCycle: s.billingCycle,
        category: s.category,
        nextBillingDate: s.nextBillingDate,
        daysUntilDue,
        autoRenew: s.autoRenew,
        notes: s.notes,
        status: daysUntilDue <= 3 ? 'urgent' : daysUntilDue <= 7 ? 'upcoming' : 'normal',
      };
    });

    res.json({
      success: true,
      monthlyBurn: Math.round(monthlyBurn * 100) / 100,
      annualBurn: Math.round(monthlyBurn * 12 * 100) / 100,
      count: enriched.length,
      data: enriched,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching subscriptions',
    });
  }
};

// @desc    Create a new subscription
// @route   POST /api/subscriptions
// @access  Private
exports.createSubscription = async (req, res) => {
  try {
    const { name, amount, billingCycle, category, nextBillingDate, autoRenew, notes } = req.body;

    if (!name || !amount || !nextBillingDate) {
      return res.status(400).json({
        success: false,
        message: 'Name, amount, and next billing date are required',
      });
    }

    if (global.isMongoConnected) {
      const sub = await Subscription.create({
        user: req.user._id,
        name,
        amount: Number(amount),
        billingCycle: billingCycle || 'monthly',
        category: category || 'Entertainment',
        nextBillingDate: new Date(nextBillingDate),
        autoRenew: autoRenew !== undefined ? Boolean(autoRenew) : true,
        notes: notes || '',
      });
      return res.status(201).json({ success: true, data: sub });
    } else {
      const sub = await LocalSubscription.create(req.body, req.user._id);
      return res.status(201).json({ success: true, data: sub });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating subscription',
    });
  }
};

// @desc    Pay subscription (creates expense transaction & updates next billing date)
// @route   POST /api/subscriptions/:id/pay
// @access  Private
exports.paySubscription = async (req, res) => {
  try {
    let sub;
    if (global.isMongoConnected) {
      sub = await Subscription.findOne({ _id: req.params.id, user: req.user._id });
    } else {
      sub = await LocalSubscription.find(req.user._id);
      sub = sub.find((s) => s._id === req.params.id);
    }

    if (!sub) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    // 1. Create matching expense transaction
    const txPayload = {
      title: `${sub.name} (Subscription Renewal)`,
      amount: Number(sub.amount),
      type: 'expense',
      category: sub.category || 'Entertainment',
      date: new Date(),
      paymentMethod: 'Credit Card',
      notes: `Recurring payment for ${sub.name}`,
      isRecurring: true,
      receiptImage: '',
    };

    if (global.isMongoConnected) {
      await Transaction.create({
        user: req.user._id,
        ...txPayload,
      });

      // 2. Advance nextBillingDate
      const next = new Date(sub.nextBillingDate);
      if (sub.billingCycle === 'yearly') next.setFullYear(next.getFullYear() + 1);
      else if (sub.billingCycle === 'quarterly') next.setMonth(next.getMonth() + 3);
      else next.setMonth(next.getMonth() + 1);

      sub.nextBillingDate = next;
      await sub.save();
      return res.json({ success: true, message: 'Payment recorded and next billing date updated', data: sub });
    } else {
      await LocalTransaction.create({
        user: req.user._id,
        ...txPayload,
      });

      const next = new Date(sub.nextBillingDate);
      if (sub.billingCycle === 'yearly') next.setFullYear(next.getFullYear() + 1);
      else if (sub.billingCycle === 'quarterly') next.setMonth(next.getMonth() + 3);
      else next.setMonth(next.getMonth() + 1);

      const updated = await LocalSubscription.update(req.params.id, req.user._id, {
        nextBillingDate: next.toISOString(),
      });
      return res.json({ success: true, message: 'Payment recorded and next billing date updated', data: updated });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error processing subscription payment',
    });
  }
};

// @desc    Update subscription
// @route   PUT /api/subscriptions/:id
// @access  Private
exports.updateSubscription = async (req, res) => {
  try {
    if (global.isMongoConnected) {
      const sub = await Subscription.findOne({ _id: req.params.id, user: req.user._id });
      if (!sub) {
        return res.status(404).json({ success: false, message: 'Subscription not found' });
      }

      const { name, amount, billingCycle, category, nextBillingDate, autoRenew, notes } = req.body;
      if (name) sub.name = name;
      if (amount !== undefined) sub.amount = Number(amount);
      if (billingCycle) sub.billingCycle = billingCycle;
      if (category) sub.category = category;
      if (nextBillingDate) sub.nextBillingDate = new Date(nextBillingDate);
      if (autoRenew !== undefined) sub.autoRenew = Boolean(autoRenew);
      if (notes !== undefined) sub.notes = notes;

      await sub.save();
      return res.json({ success: true, data: sub });
    } else {
      const updated = await LocalSubscription.update(req.params.id, req.user._id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Subscription not found' });
      }
      return res.json({ success: true, data: updated });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating subscription',
    });
  }
};

// @desc    Delete subscription
// @route   DELETE /api/subscriptions/:id
// @access  Private
exports.deleteSubscription = async (req, res) => {
  try {
    if (global.isMongoConnected) {
      const sub = await Subscription.findOneAndDelete({ _id: req.params.id, user: req.user._id });
      if (!sub) {
        return res.status(404).json({ success: false, message: 'Subscription not found' });
      }
    } else {
      const ok = await LocalSubscription.delete(req.params.id, req.user._id);
      if (!ok) {
        return res.status(404).json({ success: false, message: 'Subscription not found' });
      }
    }
    res.json({ success: true, message: 'Subscription deleted successfully' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting subscription',
    });
  }
};
