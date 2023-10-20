// auth
module.exports.authController = require("./auth/authController")

// admin
module.exports.adminUserController = require("./admin/userAController")
module.exports.adminCategoryController = require("./admin/categoryController")
module.exports.adminProductController = require("./admin/productAController")
module.exports.adminOrderController = require("./admin/order")
module.exports.adminRewardController = require("./admin/rewardController")
module.exports.adminCouponController = require("./admin/couponController")

// merchant
module.exports.merchantProductController = require("./merchant/ProductMController")
module.exports.merchantOrderController = require("./merchant/order")

// user
module.exports.userProductController = require("./user/productUController")
module.exports.userOrderController = require("./user/order")
module.exports.userCouponController = require("./user/coupon")
