// backend/controllers/spendingController.js
const { ManualSpending } = require('../models');

exports.addManualSpending = async (req, res) => {
    try {
        const { category, amount } = req.body;
        if (!category || amount == null) {
            return res.status(400).json({ error: 'Category and amount are required' });
        }
        // Set the date explicitly to current date/time
        const spending = await ManualSpending.create({
            userId: req.user.id,
            category,
            amount,
            date: new Date()
        });
        res.status(201).json(spending);
    } catch (err) {
        console.error("Manual spending error:", err);
        res.status(500).json({ error: 'Server error' });
    }
};
