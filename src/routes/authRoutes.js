const routes = require("express").Router()
const { authController } = require("../controller/index")
const expressAsyncHandler = require("express-async-handler")
const validator = require("../helper/validator.helper")
const { signUpValidation, login } = require("../common/validation")

routes
    .post("/signup", validator.body(signUpValidation), expressAsyncHandler(authController.singUp))
    .post("/login", validator.body(login), expressAsyncHandler(authController.login))

module.exports = routes