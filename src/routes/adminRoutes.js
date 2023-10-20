const routes = require("express").Router()
const { adminUserController, adminCategoryController, adminProductController, adminOrderController, adminRewardController, adminCouponController } = require("../controller/index")
const expressAsyncHandler = require("express-async-handler")
const { isAuthenticatedAdmin, isAuthenticatedAdminOrManager } = require('../common/middleware/authenticate.middleware')
const validator = require("../helper/validator.helper")
const { addRewardValidation, addCouponValidation } = require("../common/validation")

routes
    // user
    .get("/getUsers", isAuthenticatedAdminOrManager, expressAsyncHandler(adminUserController.getUser))
    .post("/changeUserStatus/:userId", isAuthenticatedAdmin, expressAsyncHandler(adminUserController.changeUserStatus))

    // category
    .post("/addCategory", isAuthenticatedAdmin, expressAsyncHandler(adminCategoryController.addCategory))
    .get("/getCategory", expressAsyncHandler(adminCategoryController.getAllCategory))
    .get("/getSingleCategory/:categoryId", expressAsyncHandler(adminCategoryController.getSingleCategory))
    .post("/updateCategory/:categoryId", isAuthenticatedAdminOrManager, expressAsyncHandler(adminCategoryController.updateCategory))
    .post("/deleteCategory/:categoryId", isAuthenticatedAdminOrManager, expressAsyncHandler(adminCategoryController.deleteCategory))
    .post("/categoryStatus/:categoryId", isAuthenticatedAdminOrManager, expressAsyncHandler(adminCategoryController.changeCategoryStatus))

    // product
    .get("/getProductList", isAuthenticatedAdminOrManager, expressAsyncHandler(adminProductController.getProductList))
    .post("/productStatus/:productId", isAuthenticatedAdminOrManager, expressAsyncHandler(adminProductController.ProductStatus))

    // order
    .get("/getAllOrders", isAuthenticatedAdminOrManager, expressAsyncHandler(adminOrderController.getAllOrders))

    // reward
    .post("/addReward", isAuthenticatedAdminOrManager, validator.body(addRewardValidation), expressAsyncHandler(adminRewardController.addReward))
    .post("/updateReward/:rewardId", isAuthenticatedAdminOrManager, expressAsyncHandler(adminRewardController.updateReward))
    .get("/getRewards", isAuthenticatedAdminOrManager, expressAsyncHandler(adminRewardController.getRewardList))

    // coupon
    .post("/addCoupon", isAuthenticatedAdmin, validator.body(addCouponValidation), expressAsyncHandler(adminCouponController.addCoupon))
    .post("/updateCoupon/:couponId", isAuthenticatedAdmin, expressAsyncHandler(adminCouponController.updateCoupon))
    .post("/couponStatus/:couponId", isAuthenticatedAdmin, expressAsyncHandler(adminCouponController.changeCouponStatus))
    .get("/getAllCoupon", isAuthenticatedAdmin, expressAsyncHandler(adminCouponController.getAllCoupon))

module.exports = routes