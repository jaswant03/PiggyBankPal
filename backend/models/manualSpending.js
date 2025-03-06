module.exports = (sequelize, DataTypes) => {
    const ManualSpending = sequelize.define('ManualSpending', {
        category: { type: DataTypes.STRING, allowNull: false },
        amount: { type: DataTypes.FLOAT, allowNull: false },
        date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    });

    ManualSpending.associate = models => {
        ManualSpending.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    };

    return ManualSpending;
};
