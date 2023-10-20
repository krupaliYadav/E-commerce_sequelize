const { sequelize, DataTypes } = require("../../config/database")

const Discount = sequelize.define("discount", {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    productId: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    memberId: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    discount: {
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
        comment: '0 = deactive, 1= active'
    },
}, {
    paranoid: true,
    timestamps: true
})

module.exports = Discount






































































































