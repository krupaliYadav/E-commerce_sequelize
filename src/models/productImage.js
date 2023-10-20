const { sequelize, DataTypes } = require("../../config/database")

const ProductImage = sequelize.define('productimage', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    productId: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    imagePath: {
        type: DataTypes.STRING,
        allowNull: false
    },
    isActive: {
        type: DataTypes.ENUM('0', '1'),
        defaultValue: '1',
        comment: '0 = deactive, 1= active'
    }
}, {
    paranoid: true,
    timestamps: true
})

module.exports = ProductImage