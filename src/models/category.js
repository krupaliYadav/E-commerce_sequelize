const { sequelize, DataTypes } = require("../../config/database")

const Category = sequelize.define("category", {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        required: [true, "Category Name is required"]
    },
    image: {
        type: DataTypes.STRING,
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

module.exports = Category
