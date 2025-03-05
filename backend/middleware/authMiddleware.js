const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, 'SECRET_KEY'); // Replace with env var in production
        req.user = decoded; // { id: userId, ... }
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};
