const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
    try {
        const { name, email, password, monthlyIncome } = req.body;
        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: hashed,
            monthlyIncome: monthlyIncome || 0
        });
        res.status(201).json({ message: 'User created', userId: user.id });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: 'Invalid credentials' });
        const token = jwt.sign({ id: user.id }, 'SECRET_KEY', { expiresIn: '1d' }); // Use env var
        res.json({
            message: 'Logged in',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                monthlyIncome: user.monthlyIncome
            }
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: 'Server error' });
    }
};
