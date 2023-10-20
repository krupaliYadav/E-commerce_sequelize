const Op = require("sequelize").Op
const Coupon = require("../../models/coupon")
const CouponData = require("../../models/couponCode")
const { HTTP_STATUS_CODE } = require("../../helper/constants.helper")

const getMyCouponList = async (req, res) => {
    const { user: userId, merchant: merchantId } = req;
    console.log(userId, merchantId);
    const { limit, offset } = req.query
    const limitData = parseInt(limit, 10) || 10;
    const offsetData = parseInt(offset, 10) || 0;

    let data = await CouponData.findAll({
        where: { userId: userId || merchantId, isDeleted: '0' },
        include: [
            {
                model: Coupon,
                where: {
                    startDate: { [Op.lte]: new Date() },
                    endDate: { [Op.gte]: new Date() },
                    isActive: '1'
                },
                attributes: { exclude: [, 'deletedAt', 'createdAt', 'updatedAt', 'addedBy', 'isActive'] }
            }
        ],
        limit: limitData,
        offset: offsetData,
        order: [['createdAt', 'DESC']],
        attributes: {
            exclude: ['isDeleted', 'createdAt', 'updatedAt'],
        },
    })
    const totalCount = await CouponData.count({ where: { userId: userId || merchantId, isDeleted: '0' } })
    const filterCount = data?.length
    return res.status(HTTP_STATUS_CODE.OK).json({ status: HTTP_STATUS_CODE.OK, success: true, message: "Coupon details loaded successfully.", data: { totalCount, filterCount, data } })

}

module.exports = {
    getMyCouponList
}