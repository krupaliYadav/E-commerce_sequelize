const { sequelize, DataTypes } = require("../../config/database")

const Coupon = sequelize.define("coupon", {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    addedBy: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    couponCode: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    discount: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    applyOnParches: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    isActive: {
        type: DataTypes.ENUM('0', '1'),
        defaultValue: '1',
        comment: '0 = de-active, 1= active'
    },
}, {
    paranoid: true,
    timestamps: true
})

module.exports = Coupon
