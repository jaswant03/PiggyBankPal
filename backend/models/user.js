module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        name: { type: DataTypes.STRING, allowNull: false },
        email: { type: DataTypes.STRING, unique: true, allowNull: false },
        password: { type: DataTypes.STRING, allowNull: false },
        income: { type: DataTypes.FLOAT, allowNull: true },
        budgetFrequency: { type: DataTypes.STRING, allowNull: true } // 'weekly', 'bi-weekly', or 'monthly'
    });

    User.associate = models => {
        User.hasMany(models.Receipt, { foreignKey: 'userId', as: 'receipts' });
    };

    return User;
};
