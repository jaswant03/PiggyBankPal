const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);

const config = {
    dialect: 'sqlite',
    storage: './database.sqlite',
    dialectOptions: {
        dateStrings: true,
        typeCast: function (field, next) {
            // For DATETIME fields, return the field as a string.
            if (field.type === 'DATETIME') {
                return field.string();
            }
            return next();
        },
    },
    timezone: '+00:00', // Use your preferred timezone if needed.
};

const db = {};
const sequelize = new Sequelize(config);

fs.readdirSync(__dirname)
    .filter(file => file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js')
    .forEach(file => {
        const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
        db[model.name] = model;
    });

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) db[modelName].associate(db);
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
