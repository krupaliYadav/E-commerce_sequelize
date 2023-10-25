const { sequelize, DataTypes } = require("../../config/database")

const Product = sequelize.define('product', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    merchantId: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    categoryId: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    productName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.INTEGER,
        // allowNull: false
    },
    highlights: {
        type: DataTypes.STRING,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    warranty: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: {
                msg: "Warranty must be an number."
            }
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        validate: {
            isInt: {
                msg: "Quantity must be an number."
            }
        }
    },
    isApproved: {
        type: DataTypes.ENUM('1', '2', '3'),
        defaultValue: '1',
        comment: '1 = pending, 2= accepted, 3= rejected'
    },
    isActive: {
        type: DataTypes.ENUM('0', '1'),
        defaultValue: '1',
        comment: '0 = deactive, 1= active'
    },
    isAvailable: {
        type: DataTypes.ENUM('0', '1'),
        defaultValue: '1',
        comment: '0 = UnAvailable, 1= available'
    },
    deliveryInDays: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: {
                msg: "Delivery in days must be an number."
            }
        }
    },
    totalNumOfOrders: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    paranoid: true,
    timestamps: true,
    hooks: {
        async afterCreate(product) {
            const User = sequelize.models.user;
            const productCount = await Product.count({
                where: { merchantId: product.merchantId },
            });
            const merchant = await User.findOne({ where: { id: product.merchantId } });
            merchant.totalNumOfProduct = productCount
            await merchant.save();
        }
    }
})

module.exports = Product