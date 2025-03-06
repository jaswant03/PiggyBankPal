// backend/controllers/budgetController.js
const { Budget, ReceiptItem, Receipt, User, ManualSpending } = require('../models');
const { Op } = require('sequelize');

exports.setOrUpdateBudget = async (req, res) => {
    try {
        const { category, allocatedAmount } = req.body;
        if (!category || allocatedAmount == null) {
            return res.status(400).json({ error: 'Category and allocatedAmount required' });
        }
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
        // "timeline" is the snapshot frequency (weekly, bi-weekly, monthly)
        const timeline = req.query.timeline || 'monthly';

        // Fetch all receipts and manual spending (no date filter)
        const receipts = await Receipt.findAll({
            where: { userId: req.user.id },
            include: [{ model: ReceiptItem, as: 'items' }]
        });
        const manualSpendings = await ManualSpending.findAll({
            where: { userId: req.user.id }
        });

        // Combine spending per category
        const spentMap = {};
        receipts.forEach(r => {
            r.items.forEach(item => {
                if (!spentMap[item.category]) spentMap[item.category] = 0;
                spentMap[item.category] += item.price;
            });
        });
        manualSpendings.forEach(ms => {
            if (!spentMap[ms.category]) spentMap[ms.category] = 0;
            spentMap[ms.category] += ms.amount;
        });

        // Fetch budgets and compute remaining amounts
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

        // Get the user record
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Convert base income to a weekly equivalent based on user.budgetFrequency
        let weeklyEquivalent = 0;
        switch (user.budgetFrequency) {
            case 'weekly':
                weeklyEquivalent = user.income;
                break;
            case 'bi-weekly':
                weeklyEquivalent = user.income / 2;
                break;
            case 'monthly':
            default:
                weeklyEquivalent = user.income / 4;
                break;
        }

        // Scale weeklyEquivalent to the snapshot timeline
        let effectiveIncome = 0;
        switch (timeline) {
            case 'weekly':
                effectiveIncome = weeklyEquivalent;
                break;
            case 'bi-weekly':
                effectiveIncome = weeklyEquivalent * 2;
                break;
            case 'monthly':
            default:
                effectiveIncome = weeklyEquivalent * 4;
                break;
        }

        const totalSpent = Object.values(spentMap).reduce((acc, val) => acc + val, 0);
        const remainingIncome = effectiveIncome - totalSpent;

        res.json({
            baseIncome: user.income,
            baseFrequency: user.budgetFrequency,
            timeline,
            effectiveIncome,
            totalSpent,
            remainingIncome,
            budgets: result
        });
    } catch (err) {
        console.error("Budget summary error:", err);
        res.status(500).json({ error: 'Server error' });
    }
};
