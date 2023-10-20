const { sequelize, DataTypes } = require("../../config/database")

const Role = sequelize.define('role', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: true
})

module.exports = Role