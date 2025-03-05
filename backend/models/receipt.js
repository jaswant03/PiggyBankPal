module.exports = (sequelize, DataTypes) => {
    const Receipt = sequelize.define('Receipt', {
        date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        totalAmount: { type: DataTypes.FLOAT, allowNull: false },
        rawText: { type: DataTypes.TEXT }
    });

    Receipt.associate = models => {
        Receipt.hasMany(models.ReceiptItem, { foreignKey: 'receiptId', as: 'items' });
        Receipt.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    };

    return Receipt;
};
