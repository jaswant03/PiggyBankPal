const express = require('express');
const router = express.Router();
const spendingController = require('../controllers/spendingController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, spendingController.addManualSpending);

module.exports = router;
