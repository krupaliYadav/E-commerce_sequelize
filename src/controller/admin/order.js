const User = require("../../models/user")
const Order = require("../../models/order")
const { HTTP_STATUS_CODE } = require("../../helper/constants.helper")
const { BadRequestException } = require("../../common/exceptions/index")

const getAllOrders = async (req, res) => {
    let { offset, limit, search } = req.query
    const limitData = parseInt(limit, 10) || 10;
    const offsetData = parseInt(offset, 10) || 0;

    let data = await Order.findAll({
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
        order: [['id', 'DESC']],
        limit: limitData,
        offset: offsetData
    })
    const totalCount = await Order.count()
    const filterCount = data.length

    return res.status(HTTP_STATUS_CODE.OK).json({ status: HTTP_STATUS_CODE.OK, success: true, message: "Order details loaded successfully.", data: { totalCount, filterCount, data } })
}

module.exports = {
    getAllOrders,
}
