const routes = require("express").Router()
const { merchantProductController, merchantOrderController } = require("../controller/index")
const expressAsyncHandler = require("express-async-handler")
const validator = require("../helper/validator.helper")
const { addDiscountValidation } = require("../common/validation")
const { isAuthenticatedMerchant, isAuthenticatedAdminOrMerchant } = require('../common/middleware/authenticate.middleware')

routes
    // product
    .post("/addProduct", isAuthenticatedMerchant, expressAsyncHandler(merchantProductController.addProduct))
    .get("/getMyProductList", isAuthenticatedMerchant, expressAsyncHandler(merchantProductController.getMyProductList))
    .post("/updateProduct/:productId", isAuthenticatedMerchant, expressAsyncHandler(merchantProductController.updateProduct))
    .post("/UpdateIsAvailable/:productId", isAuthenticatedMerchant, expressAsyncHandler(merchantProductController.UpdateIsAvailable))

    // order
    .get("/getAllOrderList", isAuthenticatedMerchant, expressAsyncHandler(merchantOrderController.getAllOrderList))
    .post("/changeOrderStatus/:orderId", isAuthenticatedMerchant, expressAsyncHandler(merchantOrderController.changeOrderStatus))

    // discount
    .post("/addDiscount", isAuthenticatedAdminOrMerchant, validator.body(addDiscountValidation), expressAsyncHandler(merchantProductController.addDiscount))

module.exports = routes