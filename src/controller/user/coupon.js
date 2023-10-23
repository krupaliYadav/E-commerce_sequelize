const Op = require("sequelize").Op
const Coupon = require("../../models/coupon")
const CouponData = require("../../models/couponCode")
const { paginate } = require('../../common/middleware/pagination')
const { HTTP_STATUS_CODE } = require("../../helper/constants.helper")

const getMyCouponList = async (req, res) => {
    const { user: userId, merchant: merchantId } = req;
    const { limit, offset } = req.query

    let where = { userId: userId || merchantId, isDeleted: '0' }
    let options = {
        include: [
            {
                model: Coupon,
                where: {
                    startDate: { [Op.lte]: new Date() },
                    endDate: { [Op.gte]: new Date() },
                    isActive: '1'
                },
                attributes: { exclude: [, 'deletedAt', 'createdAt', 'updatedAt', 'addedBy', 'isActive', 'couponUser'] }
            }
        ],
        attributes: {
            exclude: ['isDeleted', 'createdAt', 'updatedAt'],
        },
    }

    const rows = await paginate({ model: CouponData, offsetData: offset, limitData: limit, where: where, options: options });
    const totalCount = await CouponData.count({ where: { userId: userId || merchantId, isDeleted: '0' } })
    const filterCount = rows?.length
    return res.status(HTTP_STATUS_CODE.OK).json({ status: HTTP_STATUS_CODE.OK, success: true, message: "Coupon details loaded successfully.", data: { totalCount, filterCount, rows } })

}

module.exports = {
    getMyCouponList
}