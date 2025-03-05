const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, budgetController.setOrUpdateBudget);
router.get('/', protect, budgetController.getBudgetSummary);

module.exports = router;
