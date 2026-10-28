const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a goal title'],
      trim: true,
      maxlength: 100,
    },
    targetAmount: {
      type: Number,
      required: [true, 'Please provide target amount'],
      min: [1, 'Target amount must be at least 1'],
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: [0, 'Current saved amount cannot be negative'],
    },
    deadline: {
      type: Date,
      required: [true, 'Please provide a target deadline date'],
    },
    category: {
      type: String,
      default: 'Savings',
      trim: true,
    },
    color: {
      type: String,
      default: '#4f46e5',
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

goalSchema.index({ user: 1, deadline: 1 });

module.exports = mongoose.model('Goal', goalSchema);
