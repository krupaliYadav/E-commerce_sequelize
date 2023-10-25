const Op = require("sequelize").Op
const Coupon = require("../../models/coupon")
const CouponCode = require("../../models/couponCode")
const { paginate } = require('../../common/middleware/pagination')
const { generateCouponCode } = require("../../helper/generateCode")
const { HTTP_STATUS_CODE } = require("../../helper/constants.helper")
const { BadRequestException } = require("../../common/exceptions/index");

const addCoupon = async (req, res) => {
    const adminId = req.admin

    let { discount, applyOnParches, startDate, endDate } = req.body

    const coupon = await Coupon.findOne({ where: { applyOnParches: applyOnParches } })
    if (coupon) throw new BadRequestException('Coupon is already applied on this amount on parches.')

    if (new Date(endDate) <= new Date()) throw new BadRequestException('Please select end date grater then today.')

    const code = generateCouponCode(8)

    await Coupon.create({
        discount: discount,
        addedBy: adminId,
        couponCode: code,
        discount: discount,
        applyOnParches: applyOnParches,
        startDate: startDate,
        endDate: endDate
    })
    return res.status(HTTP_STATUS_CODE.OK).json({ status: HTTP_STATUS_CODE.OK, success: true, message: "Coupon added successfully." })
}

const updateCoupon = async (req, res) => {
    const couponId = req.params.couponId
    let { applyOnParches, endDate } = req.body

    const couponData = await Coupon.findOne({ where: { id: couponId } })
    if (couponData) {

        if (applyOnParches) {
            const coupon = await Coupon.findOne({ where: { applyOnParches: applyOnParches } })
            if (coupon && coupon.id != couponId) throw new BadRequestException('Coupon is already applied on this amount on parches.')
        }

        if (endDate) {
            if (new Date(endDate) <= new Date()) throw new BadRequestException('Please select end date grater then today.')
        }
        await Coupon.update(req.body, { where: { id: couponId } })
    } else {
        throw new BadRequestException('Coupon details not found.')
    }

    return res.status(HTTP_STATUS_CODE.OK).json({ status: HTTP_STATUS_CODE.OK, success: true, message: "Coupon updated successfully." })
}

const changeCouponStatus = async (req, res) => {
    const couponId = req.params.couponId
    const { status } = req.body
    if (!status) throw new BadRequestException("Coupon status is required.")
    if (status != '0' && status != '1') throw new BadRequestException('Status must be either 0 or 1.')

    const coupon = await Coupon.findOne({ where: { id: couponId } });

    if (!coupon) {
        throw new BadRequestException("Coupon details not found.")
    } else {
        await Coupon.update({ isActive: status }, { where: { id: couponId } });
        return res.status(HTTP_STATUS_CODE.OK).json({ status: HTTP_STATUS_CODE.OK, success: true, message: "Coupon status updated successfully." })
    }
}

const getAllCoupon = async (req, res) => {
    let { offset, limit, startDate, endDate } = req.query

    let where = {}
    if (startDate) {
        where.startDate = { [Op.gte]: startDate }
    }
    if (endDate) {
        const adjustedEndDate = new Date(new Date(endDate).setUTCHours(23, 59, 59, 999));
        where.endDate = { [Op.lte]: adjustedEndDate }
    }
    const options = {
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
        include: [
            { model: CouponCode, attributes: { exclude: ['createdAt', 'updatedAt', 'isDeleted'] } },
        ],
    };
    const { count, rows } = await paginate({ model: Coupon, offsetData: offset, limitData: limit, where: where, options: options });

    res.status(HTTP_STATUS_CODE.OK).json({ status: HTTP_STATUS_CODE.OK, success: true, message: "Coupon list loaded successfully.", data: { totalCount: count, rows } })
}

const storeCouponForUser = async (totalAmount, userId) => {
    try {

        const eligibleCoupon = await Coupon.findOne({
            where: {
                applyOnParches: { [Op.lte]: totalAmount },
                startDate: { [Op.lte]: new Date() },
                endDate: { [Op.gte]: new Date() }
            }, order: [['applyOnParches', 'DESC']], plain: true
        });

        if (eligibleCoupon) {
            const couponCodeData = await CouponCode.findOne({ where: { userId: userId, couponCode: eligibleCoupon.couponCode } })
            if (!couponCodeData) {
                await CouponCode.create({ userId: userId, couponCode: eligibleCoupon.couponCode, couponId: eligibleCoupon.id })
                eligibleCoupon.couponUser += 1
                await eligibleCoupon.save()
            }
        }

    } catch (error) {
        console.log(error);
        return error
    }

}

const getCouponDiscountAmount = async (couponCode, userId) => {
    try {
        const couponData = await CouponCode.findOne({
            where: { couponCode: couponCode, userId: userId, isDeleted: '0' },
            include: [
                {
                    model: Coupon,
                    where: {
                        startDate: { [Op.lte]: new Date() },
                        endDate: { [Op.gte]: new Date() },
                        isActive: '1'
                    }
                }
            ],
        });

        if (couponData) {
            couponData.isDeleted = '1',
                couponData.applyOn = new Date()
            await couponData.save()
            return couponData.coupon.discount
        } else {
            return { success: false, message: 'Invalid or unavailable coupon. Please check again or uncheck the isUseCoupon option.' }
        }
    } catch (error) {
        return { success: false, message: error.message }
    }

}

module.exports = {
    addCoupon,
    updateCoupon,
    changeCouponStatus,
    getAllCoupon,
    storeCouponForUser,
    getCouponDiscountAmount
}