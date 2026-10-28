const express = require('express');
const router = express.Router();
const {
  getSubscriptions,
  createSubscription,
  paySubscription,
  updateSubscription,
  deleteSubscription,
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getSubscriptions);
router.post('/', createSubscription);
router.post('/:id/pay', paySubscription);
router.put('/:id', updateSubscription);
router.delete('/:id', deleteSubscription);

module.exports = router;
