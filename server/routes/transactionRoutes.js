const express = require('express');
const router = express.Router();
const {
  getTransactions,
  exportTransactions,
  importTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

router.use(protect); // All transaction routes require authentication

router.get('/', getTransactions);
router.get('/export', exportTransactions);
router.post('/import', importTransactions);
router.post('/', createTransaction);
router.get('/:id', getTransactionById);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
