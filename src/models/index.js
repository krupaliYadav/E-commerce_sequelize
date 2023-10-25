const { sequelize } = require("../../config/database")
const Sequelize = require("sequelize");
const Role = require("./role")
const User = require("./user")
const Address = require("./address")
const Product = require("./product")
const ProductImage = require("./productImage")
const ProductColorVariant = require("./productColorVariant");
const Category = require("./category");
const Cart = require("./cart");
const Order = require("./order");
const Discount = require("./discount");
const Reward = require("./reward")
const Referral = require("./referral")
const Coupon = require("./coupon")
const CouponCode = require("./couponCode")

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.sequelize.sync()
    // { alter: true }
    .then(() => console.log("Re-sync"))


Role.hasMany(User, { foreignKey: 'roleId' })
User.belongsTo(Role, { foreignKey: "roleId" })

User.hasMany(Address, { foreignKey: 'userId' })
Address.belongsTo(User, { foreignKey: 'userId' })

User.hasMany(Product, { foreignKey: 'merchantId' })
Product.belongsTo(User, { foreignKey: 'merchantId' })

Category.hasMany(Product, { foreignKey: 'categoryId' })
Product.belongsTo(Category, { foreignKey: 'categoryId' })

Product.hasMany(ProductColorVariant, { foreignKey: 'productId' })
ProductColorVariant.belongsTo(Product, { foreignKey: 'productId' })

Product.hasMany(ProductImage, { foreignKey: 'productId' })
ProductImage.belongsTo(Product, { foreignKey: 'productId' })

User.hasMany(Cart, { foreignKey: 'userId' })
Cart.belongsTo(User, { foreignKey: 'userId' })

User.hasMany(Cart, { foreignKey: 'merchantId', as: 'merchant' })
Cart.belongsTo(User, { foreignKey: 'merchantId', as: 'merchant' })

Product.hasMany(Cart, { foreignKey: 'productId' })
Cart.belongsTo(Product, { foreignKey: 'productId' })

ProductColorVariant.hasMany(Cart, { foreignKey: 'variantId' })
Cart.belongsTo(ProductColorVariant, { foreignKey: 'variantId' })

User.hasMany(Order, { foreignKey: 'merchantId' })
Order.belongsTo(User, { foreignKey: 'merchantId', as: 'merchant' })

User.hasMany(Order, { foreignKey: 'userId' })
Order.belongsTo(User, { foreignKey: 'userId' })

Product.hasOne(Discount, { foreignKey: 'productId' })
Discount.belongsTo(Product, { foreignKey: 'productId' })

User.hasMany(Reward, { foreignKey: "addedBy", as: 'addBy' })
Reward.belongsTo(User, { foreignKey: "addedBy", as: 'addBy' })

Coupon.hasMany(CouponCode, { foreignKey: "couponId" })
CouponCode.belongsTo(Coupon, { foreignKey: "couponId" })


module.exports = db



