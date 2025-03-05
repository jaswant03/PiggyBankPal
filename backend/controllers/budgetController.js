const { Budget, ReceiptItem, Receipt, User } = require('../models');
const { Sequelize } = require('sequelize');

exports.setOrUpdateBudget = async (req, res) => {
    try {
        const { category, allocatedAmount } = req.body;
        if (!category || allocatedAmount == null) {
            return res.status(400).json({ error: 'Category and allocatedAmount required' });
        }
        // For simplicity, one Budget record per category (not user-specific)
        let budget = await Budget.findOne({ where: { category } });
        if (budget) {
            budget.allocatedAmount = allocatedAmount;
            await budget.save();
        } else {
            budget = await Budget.create({ category, allocatedAmount });
        }
        res.status(201).json(budget);
    } catch (err) {
        console.error("Budget error:", err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getBudgetSummary = async (req, res) => {
    try {
        // Summation of all receipts by category for this user
        const receipts = await Receipt.findAll({
            where: { userId: req.user.id },
            include: [{ model: ReceiptItem, as: 'items' }]
        });

        const spentMap = {};
        receipts.forEach(r => {
            r.items.forEach(item => {
                if (!spentMap[item.category]) spentMap[item.category] = 0;
                spentMap[item.category] += item.price;
            });
        });

        const budgets = await Budget.findAll();
        const result = budgets.map(b => {
            const spent = spentMap[b.category] || 0;
            return {
                category: b.category,
                allocatedAmount: b.allocatedAmount,
                spent,
                remaining: b.allocatedAmount - spent
            };
        });

        // Also retrieve user monthly income
        const user = await User.findByPk(req.user.id);
        const totalSpent = Object.values(spentMap).reduce((acc, val) => acc + val, 0);
        const remainingIncome = user.monthlyIncome - totalSpent;

        res.json({
            monthlyIncome: user.monthlyIncome,
            totalSpent,
            remainingIncome,
            budgets: result
        });
    } catch (err) {
        console.error("Budget summary error:", err);
        res.status(500).json({ error: 'Server error' });
    }
};
