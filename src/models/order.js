const { sequelize, DataTypes } = require("../../config/database")

const Order = sequelize.define("order", {
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
    addressId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        required: [true, "Address id is required"]
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false,
        required: [true, "Address is required"]
    },
    merchantId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        required: [true, "merchant id is required"]
    },
    productId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        required: [true, "ProductId id is required"]
    },
    productName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    productDescription: {
        type: DataTypes.STRING,
        allowNull: false
    },
    deliveryInDays: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    warranty: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    variantId: {
        type: DataTypes.BIGINT,
    },
    variantName: {
        type: DataTypes.STRING,
    },
    quantity: {
        type: DataTypes.INTEGER,
        validate: {
            isInt: {
                msg: "Quantity must be an number."
            }
        }
    },
    status: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        validate: {
            isIn: {
                args: [[0, 1, 2, 3, 4]],
                msg: 'Invalid status value',
            },
        },
        comment: '0 = pending, 1 = accepted, 2 = cancelled, 3 = inProgress, 4 = completed',
    },
    discount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    totalPayableAmount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    walletAmountUsed: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    couponDiscount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    paranoid: true,
    timestamps: true,
    hooks: {
        async afterCreate(order) {
            const User = sequelize.models.user;
            const Product = sequelize.models.product

            const totalOrderOfUsers = await Order.count({ where: { userId: order.userId } });
            const totalOrderOfProduct = await Order.count({ where: { productId: order.productId } })

            const user = await User.findOne({ where: { id: order.userId } });
            user.totalNumOfOrders = totalOrderOfUsers

            const product = await Product.findOne({ where: { id: order.productId } })
            product.totalNumOfOrders = totalOrderOfProduct

            await user.save()
            await product.save()
        }
    }
})

module.exports = Order
