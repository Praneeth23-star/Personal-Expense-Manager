const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide subscription name'],
      trim: true,
      maxlength: 100,
    },
    amount: {
      type: Number,
      required: [true, 'Please provide subscription cost'],
      min: [0.01, 'Amount must be greater than zero'],
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly', 'quarterly'],
      default: 'monthly',
    },
    category: {
      type: String,
      default: 'Entertainment',
      trim: true,
    },
    nextBillingDate: {
      type: Date,
      required: [true, 'Please provide next billing date'],
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 300,
    },
  },
  {
    timestamps: true,
  }
);

subscriptionSchema.index({ user: 1, nextBillingDate: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
