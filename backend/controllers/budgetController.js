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
        const timeline = req.query.timeline || 'monthly';

        // Fetch all receipts and manual spending for the user (no date filter for simplicity)
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

        const budgets = await Budget.findAll();
        // Determine scaling factor for budgets based on timeline
        let scaleFactor = 1;
        switch (timeline) {
            case 'weekly':
                scaleFactor = 1 / 4;
                break;
            case 'bi-weekly':
                scaleFactor = 1 / 2;
                break;
            case 'monthly':
            default:
                scaleFactor = 1;
                break;
        }

        const result = budgets.map(b => {
            const spent = spentMap[b.category] || 0;
            return {
                category: b.category,
                allocatedAmount: b.allocatedAmount,
                allocatedScaled: b.allocatedAmount * scaleFactor,
                spent,
                remaining: b.allocatedAmount - spent,
                remainingScaled: (b.allocatedAmount - spent) * scaleFactor,
            };
        });

        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Scale income similar to budgets (assuming user.income is monthly)
        const incomeWeekly = user.income / 4;
        let effectiveIncome = 0;
        switch (timeline) {
            case 'weekly':
                effectiveIncome = incomeWeekly;
                break;
            case 'bi-weekly':
                effectiveIncome = incomeWeekly * 2;
                break;
            case 'monthly':
            default:
                effectiveIncome = user.income;
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
            budgets: result,
        });
    } catch (err) {
        console.error("Budget summary error:", err);
        res.status(500).json({ error: 'Server error' });
    }
};
