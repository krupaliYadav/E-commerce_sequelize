const User = require("../../models/user")
const Order = require("../../models/order")
const { paginate } = require('../../common/middleware/pagination')
const { HTTP_STATUS_CODE } = require("../../helper/constants.helper")
const { BadRequestException } = require("../../common/exceptions/index")

const getAllOrders = async (req, res) => {
    let { offset, limit } = req.query

    const option = {
        include: [
            {
                model: User,
                attributes: { exclude: ['deletedAt', 'createdAt', 'updatedAt', 'isActive', 'image', 'password', 'roleId', 'accessToken'] }
            },
            {
                model: User,
                as: "merchant",
                attributes: { exclude: ['deletedAt', 'createdAt', 'updatedAt', 'isActive', 'image', 'password', 'roleId', 'accessToken'] }
            },
        ],
        attributes: {
            exclude: ['deletedAt', 'createdAt', 'updatedAt'],
        },
    }
    const { count, rows } = await paginate({ model: Order, offsetData: offset, limitData: limit, options: option });

    return res.status(HTTP_STATUS_CODE.OK).json({ status: HTTP_STATUS_CODE.OK, success: true, message: "Order details loaded successfully.", data: { totalCount: count, rows } })
}

module.exports = {
    getAllOrders,
}
