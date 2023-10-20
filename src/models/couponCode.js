const { sequelize, DataTypes } = require("../../config/database")

const CouponCode = sequelize.define("couponcode", {
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
    couponCode: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    couponId: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    isDeleted: {
        type: DataTypes.ENUM('0', '1'),
        defaultValue: '0',
        comment: '0 = false, 1= true'
    }
}, {
    timestamps: true
})

module.exports = CouponCode
