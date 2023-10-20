const routes = require("express").Router()
const { userProductController, userOrderController, userCouponController } = require("../controller/index")
const expressAsyncHandler = require("express-async-handler")
const { isAuthenticatedUser, isAuthenticatedUserOrMerchant } = require('../common/middleware/authenticate.middleware')
const validator = require("../helper/validator.helper")
const { addToCartValidation } = require("../common/validation")

routes
    //Product 
    .get("/getAllProducts", isAuthenticatedUserOrMerchant, expressAsyncHandler(userProductController.getAllProducts))
    .post("/addToCart", isAuthenticatedUserOrMerchant, validator.body(addToCartValidation), expressAsyncHandler(userProductController.addToCart))
    .post("/removeFromCart/:cartId", isAuthenticatedUserOrMerchant, expressAsyncHandler(userProductController.removeFromCart))
    .post("/changeCartQuantity/:cartId", isAuthenticatedUserOrMerchant, expressAsyncHandler(userProductController.changeCartQuantity))
    .get("/getMyCartList", isAuthenticatedUserOrMerchant, expressAsyncHandler(userProductController.getMyCartList))

    // Order
    .post("/placeOrder", isAuthenticatedUserOrMerchant, expressAsyncHandler(userOrderController.orderPlace))
    .get("/getMyOrderList", isAuthenticatedUserOrMerchant, expressAsyncHandler(userOrderController.getMyOrderList))

    // coupon
    .get("/getMyCouponList", isAuthenticatedUserOrMerchant, expressAsyncHandler(userCouponController.getMyCouponList))



module.exports = routes