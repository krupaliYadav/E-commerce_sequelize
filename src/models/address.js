const { sequelize, DataTypes } = require("../../config/database")

const Address = sequelize.define('address', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false,
        required: [true, "address is required"]
    },
}, {
    paranoid: true,
    timestamps: true
})

module.exports = Address