const { Budget, ReceiptItem, Receipt, User, ManualSpending } = require('../models');
const { Sequelize, Op } = require('sequelize');

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
        // Determine timeline based on query or user settings
        const timeline = req.query.timeline || req.user.budgetFrequency || 'monthly';
        const now = new Date();
        let days;
        switch (timeline) {
            case 'weekly':
                days = 7;
                break;
            case 'bi-weekly':
                days = 14;
                break;
            case 'monthly':
            default:
                days = 30;
                break;
        }
        const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

        // Get receipts within the timeline period
        const receipts = await Receipt.findAll({
            where: {
                userId: req.user.id,
                date: { [Op.gte]: startDate }
            },
            include: [{ model: ReceiptItem, as: 'items' }]
        });

        // Get manual spending entries within the timeline period
        const manualSpendings = await ManualSpending.findAll({
            where: {
                userId: req.user.id,
                date: { [Op.gte]: startDate }
            }
        });

        // Combine spending from receipts and manual spendings
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

        // Get all budgets
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

        // Calculate effective income based on frequency.
        let effectiveIncome = user.income || 0;
        switch (user.budgetFrequency) {
            case 'weekly':
                effectiveIncome = effectiveIncome; // Income is per week.
                break;
            case 'bi-weekly':
                effectiveIncome = effectiveIncome; // Income is per two weeks.
                break;
            case 'monthly':
            default:
                effectiveIncome = effectiveIncome; // Income is per month.
                break;
        }

        const totalSpent = Object.values(spentMap).reduce((acc, val) => acc + val, 0);
        const remainingIncome = effectiveIncome - totalSpent;

        res.json({
            income: user.income,
            budgetFrequency: user.budgetFrequency,
            timeline, // timeline used for snapshot
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
