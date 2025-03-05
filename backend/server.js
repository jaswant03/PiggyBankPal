const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./models');
const authRoutes = require('./routes/auth');
const receiptRoutes = require('./routes/receipts');
const budgetRoutes = require('./routes/budgets');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Server uploaded files if needed
app.use('/uploads', express.static('uploads'));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/budgets', budgetRoutes);

const PORT = process.env.PORT || 3000;
db.sequelize.sync().then(() => {
    console.log("DB synced");
    app.listen(PORT, () => {
        console.log("Server running on port " + PORT);
    });
}).catch(err => {
    console.error("DB sync error:", err);
});
