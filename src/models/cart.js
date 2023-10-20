const { sequelize, DataTypes } = require("../../config/database")

const Cart = sequelize.define("cart",
    {
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        merchantId: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        productId: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        variantId: {
            type: DataTypes.BIGINT,
        },
        totalQuantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        isActive: {
            type: DataTypes.ENUM('0', '1'),
            defaultValue: '1',
            comment: '0 = deactive, 1= active'
        },
    },
    {
        paranoid: true,
        timestamps: true
    }
);


module.exports = Cart
