const { sequelize, DataTypes } = require("../../config/database")

const User = sequelize.define('user', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false
    },
    roleId: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    isActive: {
        type: DataTypes.ENUM('0', '1'),
        defaultValue: '1',
        comment: '0 = deactive, 1= active'
    },
    isReferred: {
        type: DataTypes.ENUM('0', '1'),
        defaultValue: '0',
        comment: '0 = false, 1= true'
    },
    walletAmount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    totalNumOfProduct: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    totalNumOfOrders: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    accessToken: {
        type: DataTypes.STRING
    },
}, {
    paranoid: true,
    timestamps: true
})

module.exports = User