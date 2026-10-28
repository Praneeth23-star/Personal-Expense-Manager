const express = require('express');
const router = express.Router();
const { getFinancialInsights, askAdvisor } = require('../controllers/aiAdvisorController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/insights', getFinancialInsights);
router.post('/ask', askAdvisor);

module.exports = router;
