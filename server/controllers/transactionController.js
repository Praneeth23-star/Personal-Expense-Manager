const Transaction = require('../models/Transaction');
const { LocalTransaction } = require('../config/localStore');

// @desc    Get all transactions with filtering, search, pagination, and sorting
// @route   GET /api/transactions
// @access  Private
exports.getTransactions = async (req, res) => {
  try {
    const {
      type,
      category,
      paymentMethod,
      startDate,
      endDate,
      search,
      sortBy = 'date',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    if (global.isMongoConnected) {
      const query = { user: req.user._id };
      if (type && type !== 'all') query.type = type;
      if (category && category !== 'all') query.category = category;
      if (paymentMethod && paymentMethod !== 'all') query.paymentMethod = paymentMethod;
      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          query.date.$lte = end;
        }
      }
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { notes: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
        ];
      }

      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

      const total = await Transaction.countDocuments(query);
      const transactions = await Transaction.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum);

      return res.json({
        success: true,
        count: transactions.length,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
        currentPage: pageNum,
        data: transactions,
      });
    } else {
      // Local fallback
      const query = { user: req.user._id };
      if (type && type !== 'all') query.type = type;
      if (category && category !== 'all') query.category = category;
      if (paymentMethod && paymentMethod !== 'all') query.paymentMethod = paymentMethod;
      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = startDate;
        if (endDate) query.date.$lte = endDate;
      }
      if (search) query.$or = true;

      const { list, total } = await LocalTransaction.find(query, {
        search,
        sortBy,
        sortOrder,
        skip,
        limit: limitNum,
      });

      return res.json({
        success: true,
        count: list.length,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
        currentPage: pageNum,
        data: list,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching transactions',
    });
  }
};

// @desc    Get all transactions for export (without pagination)
// @route   GET /api/transactions/export
// @access  Private
exports.exportTransactions = async (req, res) => {
  try {
    const { type, category, startDate, endDate } = req.query;

    if (global.isMongoConnected) {
      const query = { user: req.user._id };
      if (type && type !== 'all') query.type = type;
      if (category && category !== 'all') query.category = category;
      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          query.date.$lte = end;
        }
      }
      const transactions = await Transaction.find(query).sort({ date: -1 });
      return res.json({ success: true, data: transactions });
    } else {
      const query = { user: req.user._id };
      if (type && type !== 'all') query.type = type;
      if (category && category !== 'all') query.category = category;
      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = startDate;
        if (endDate) query.date.$lte = endDate;
      }
      const { list } = await LocalTransaction.find(query, { sortBy: 'date', sortOrder: 'desc' });
      return res.json({ success: true, data: list });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error exporting transactions',
    });
  }
};

// @desc    Get single transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
exports.getTransactionById = async (req, res) => {
  try {
    let transaction;
    if (global.isMongoConnected) {
      transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    } else {
      transaction = await LocalTransaction.findById(req.params.id, req.user._id);
    }

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
exports.createTransaction = async (req, res) => {
  try {
    const { title, amount, type, category, date, paymentMethod, notes, isRecurring, receiptImage } = req.body;

    if (!title || !amount || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, amount, and category are required',
      });
    }

    if (global.isMongoConnected) {
      const transaction = await Transaction.create({
        user: req.user._id,
        title,
        amount: Number(amount),
        type: type || 'expense',
        category,
        date: date ? new Date(date) : new Date(),
        paymentMethod: paymentMethod || 'Credit Card',
        notes,
        isRecurring: !!isRecurring,
        receiptImage: receiptImage || '',
      });
      return res.status(201).json({ success: true, data: transaction });
    } else {
      const transaction = await LocalTransaction.create({
        user: req.user._id,
        title,
        amount: Number(amount),
        type: type || 'expense',
        category,
        date,
        paymentMethod: paymentMethod || 'Credit Card',
        notes,
        isRecurring: !!isRecurring,
        receiptImage: receiptImage || '',
      });
      return res.status(201).json({ success: true, data: transaction });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating transaction',
    });
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
exports.updateTransaction = async (req, res) => {
  try {
    if (global.isMongoConnected) {
      let transaction = await Transaction.findOne({
        _id: req.params.id,
        user: req.user._id,
      });

      if (!transaction) {
        return res.status(404).json({ success: false, message: 'Transaction not found' });
      }

      const { title, amount, type, category, date, paymentMethod, notes, isRecurring, receiptImage } = req.body;
      if (title) transaction.title = title;
      if (amount !== undefined) transaction.amount = Number(amount);
      if (type) transaction.type = type;
      if (category) transaction.category = category;
      if (date) transaction.date = new Date(date);
      if (paymentMethod) transaction.paymentMethod = paymentMethod;
      if (notes !== undefined) transaction.notes = notes;
      if (isRecurring !== undefined) transaction.isRecurring = isRecurring;
      if (receiptImage !== undefined) transaction.receiptImage = receiptImage;

      await transaction.save();
      return res.json({ success: true, data: transaction });
    } else {
      const updated = await LocalTransaction.update(req.params.id, req.user._id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Transaction not found' });
      }
      return res.json({ success: true, data: updated });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating transaction',
    });
  }
};

// @desc    Bulk import transactions (e.g. from CSV)
// @route   POST /api/transactions/import
// @access  Private
exports.importTransactions = async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of transaction items to import',
      });
    }

    if (global.isMongoConnected) {
      const toInsert = items.map((item) => ({
        user: req.user._id,
        title: item.title || 'Imported Transaction',
        amount: Number(item.amount) || 0,
        type: item.type === 'income' ? 'income' : 'expense',
        category: item.category || 'Other',
        date: item.date ? new Date(item.date) : new Date(),
        paymentMethod: item.paymentMethod || 'Credit Card',
        notes: item.notes || 'Imported via CSV',
        isRecurring: false,
        receiptImage: '',
      }));

      const inserted = await Transaction.insertMany(toInsert);
      return res.status(201).json({
        success: true,
        count: inserted.length,
        message: `Successfully imported ${inserted.length} transactions`,
        data: inserted,
      });
    } else {
      const inserted = await LocalTransaction.bulkCreate(items, req.user._id);
      return res.status(201).json({
        success: true,
        count: inserted.length,
        message: `Successfully imported ${inserted.length} transactions`,
        data: inserted,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error importing transactions',
    });
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
exports.deleteTransaction = async (req, res) => {
  try {
    if (global.isMongoConnected) {
      const transaction = await Transaction.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id,
      });
      if (!transaction) {
        return res.status(404).json({ success: false, message: 'Transaction not found' });
      }
    } else {
      const ok = await LocalTransaction.delete(req.params.id, req.user._id);
      if (!ok) {
        return res.status(404).json({ success: false, message: 'Transaction not found' });
      }
    }

    res.json({
      success: true,
      message: 'Transaction deleted successfully',
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting transaction',
    });
  }
};
