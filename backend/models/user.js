module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        name: { type: DataTypes.STRING, allowNull: false },
        email: { type: DataTypes.STRING, unique: true, allowNull: false },
        password: { type: DataTypes.STRING, allowNull: false },
        monthlyIncome: { type: DataTypes.FLOAT, defaultValue: 0 }
    });

    User.associate = models => {
        User.hasMany(models.Receipt, { foreignKey: 'userId', as: 'receipts' });
    };

    return User;
};
