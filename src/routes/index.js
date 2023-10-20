const routes = require("express").Router()
const authRoutes = require("./authRoutes")
const adminRoutes = require("./adminRoutes")
const merchantRoutes = require("./merchantRoutes")
const userRoutes = require("./userRoutes")

routes
    .use("/auth", authRoutes)
    .use("/admin", adminRoutes)
    .use("/merchant", merchantRoutes)
    .use("/users", userRoutes)

module.exports = routes