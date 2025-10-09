const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const UserRole = sequelize.define('user_roles', {
    // does not need others fields, just the foreign keys
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'user_roles',
    timestamps: true
});

module.exports = UserRole;