const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide category name for the budget'],
      trim: true,
    },
    limit: {
      type: Number,
      required: [true, 'Please provide budget limit amount'],
      min: [1, 'Budget limit must be at least 1'],
    },
    month: {
      type: String,
      required: [true, 'Please specify the month (YYYY-MM)'],
      match: [/^\d{4}-(0[1-9]|1[0-2])$/, 'Month must be in YYYY-MM format'],
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index so a user has at most 1 budget per category per month
budgetSchema.index({ user: 1, category: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
