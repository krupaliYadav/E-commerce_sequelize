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
                attributes: { exclude: ['deletedAt', 'createdAt', 'updatedAt', 'isActive', 'image', 'password', 'roleId'] }
            },
            {
                model: User,
                as: "merchant",
                attributes: { exclude: ['deletedAt', 'createdAt', 'updatedAt', 'isActive', 'image', 'password', 'roleId'] }
            },
        ],
        attributes: {
            exclude: ['deletedAt', 'createdAt', 'updatedAt'],
        },
    }
    const rows = await paginate({ model: Order, offsetData: offset, limitData: limit, options: option });

    const totalCount = await Order.count()
    const filterCount = rows.length
    return res.status(HTTP_STATUS_CODE.OK).json({ status: HTTP_STATUS_CODE.OK, success: true, message: "Order details loaded successfully.", data: { totalCount, filterCount, rows } })
}

module.exports = {
    getAllOrders,
}
