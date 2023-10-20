const User = require("../../models/user")
const Order = require("../../models/order")
const { HTTP_STATUS_CODE } = require("../../helper/constants.helper")
const { BadRequestException } = require("../../common/exceptions/index")

const getAllOrderList = async (req, res) => {
    const merchantId = req.merchant
    const { limit, offset } = req.query
    const limitData = parseInt(limit, 10) || 10;
    const offsetData = parseInt(offset, 10) || 0;

    let data = await Order.findAll({
        where: { merchantId: merchantId },
        include: [{
            model: User,
            attributes: { exclude: ['deletedAt', 'createdAt', 'updatedAt', 'isActive', 'image', 'password', 'roleId'] }
        }],
        attributes: {
            exclude: ['deletedAt', 'createdAt', 'updatedAt'],
        },
        limit: limitData,
        offset: offsetData,
        order: [['createdAt', 'DESC']]
    })

    const totalCount = await Order.count({ where: { merchantId: merchantId } })
    const filterCount = data?.length
    return res.status(HTTP_STATUS_CODE.OK).json({ status: HTTP_STATUS_CODE.OK, success: true, message: "Order details loaded successfully.", data: { totalCount, filterCount, data } })
}

const changeOrderStatus = async (req, res) => {
    const merchantId = req.merchant
    const orderId = req.params.orderId
    const { status } = req.body
    if (!status) throw new BadRequestException("Order status is required.")
    if (![0, 1, 2, 3, 4].includes(status)) {
        throw new BadRequestException('Invalid status value.')
    }
    const order = await Order.findOne({ where: { id: orderId, merchantId: merchantId } });
    if (!order) {
        throw new BadRequestException("Order details not found.")
    } else {
        await Order.update({ status: status }, { where: { id: orderId } });
        res.status(HTTP_STATUS_CODE.OK).json({ status: HTTP_STATUS_CODE.OK, success: true, message: "Order status updated successfully." })
    }
}

module.exports = {
    getAllOrderList,
    changeOrderStatus
}
