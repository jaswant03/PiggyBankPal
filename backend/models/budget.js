module.exports = (sequelize, DataTypes) => {
    const Budget = sequelize.define('Budget', {
        category: { type: DataTypes.STRING, allowNull: false },
        allocatedAmount: { type: DataTypes.FLOAT, allowNull: false }
    });
    return Budget;
};
