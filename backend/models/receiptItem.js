module.exports = (sequelize, DataTypes) => {
    const ReceiptItem = sequelize.define('ReceiptItem', {
        name: { type: DataTypes.STRING, allowNull: false },
        price: { type: DataTypes.FLOAT, allowNull: false },
        category: { type: DataTypes.STRING, allowNull: false }
    });

    ReceiptItem.associate = models => {
        ReceiptItem.belongsTo(models.Receipt, { foreignKey: 'receiptId', as: 'receipt' });
    };

    return ReceiptItem;
};
