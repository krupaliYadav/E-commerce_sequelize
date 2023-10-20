const Op = require('sequelize').Op
const Cart = require("../../models/cart")
const User = require("../../models/user")
const Order = require("../../models/order")
const Product = require("../../models/product")
const Address = require("../../models/address")
const Discount = require("../../models/discount")
const ProductImage = require("../../models/productImage")
const { orderPlaceValidation } = require("../../common/validation")
const { HTTP_STATUS_CODE } = require("../../helper/constants.helper")
const ProductColorVariant = require("../../models/productColorVariant")
const { BadRequestException } = require("../../common/exceptions/index")
const { storeCouponForUser, getCouponDiscountAmount } = require("../admin/couponController")

const orderPlace = async (req, res) => {
    const { user: userId, merchant: merchantId } = req;

    const { cartId, productId, addressId, quantity, variantId, isUsedWallet, isUsedCoupon, couponCode } = req.body

    let wallet = 0;
    let setData = {};
    let walletDetails = {}
    let walletAmountUsed;
    let totalPayableAmount;
    let totalAmount = 0
    let couponDiscount = 0

    // check address
    if (!addressId) throw new BadRequestException("Address id is required.")

    const address = await Address.findOne({ where: { id: addressId, userId: userId || merchantId }, raw: true })
    if (!address) throw new BadRequestException("This address not match for this user.")

    // if isUseWallet is true then cut it subtract from payable amount.
    if (isUsedWallet === true && !isUsedCoupon) {
        walletDetails = await User.findOne({ where: { id: userId || merchantId }, plain: true })
        wallet = walletDetails.walletAmount
    }

    if (isUsedCoupon === true) {
        if (!couponCode) throw new BadRequestException('If you want to use coupon then coupon code is required.')
        couponDiscount = await getCouponDiscountAmount(couponCode, userId)
        if (couponDiscount?.success == false) throw new BadRequestException(couponDiscount.message)
    }

    // if direct buy
    if (!cartId) {
        const validation = orderPlaceValidation.filter((field) => !req.body[field])
        if (validation.length > 0) throw new BadRequestException(`The ${validation.join(', ')} is required.`)

        const queryOptions = {
            where: { id: productId, isActive: '1' },
            include: [
                {
                    model: Discount,
                    attributes: { exclude: ['deletedAt', 'createdAt', 'updatedAt', 'memberId', 'productId'] },
                    where: { startDate: { [Op.lte]: new Date() }, endDate: { [Op.gte]: new Date() } },
                    required: false
                }
            ],
            raw: true
        };

        if (variantId) {
            queryOptions.include.push({ model: ProductColorVariant, where: { id: variantId }, attributes: { exclude: ['deletedAt', 'createdAt', 'updatedAt'] } });
        }
        const productData = await Product.findOne(queryOptions);

        if (productData) {
            if (merchantId !== undefined && merchantId === productData?.merchantId) {
                throw new BadRequestException('Oops! You cant buy your own product!')
            }

            let amount = productData.price * quantity
            totalAmount = amount - (amount * (productData?.['discount.discount'] + couponDiscount || 0) / 100)
            if (totalAmount >= wallet) {
                totalPayableAmount = totalAmount - wallet
                walletDetails.walletAmount = 0, walletAmountUsed = wallet
            } else {
                walletDetails.walletAmount = wallet - totalAmount
                totalPayableAmount = 0
                walletAmountUsed = wallet - walletDetails.walletAmount
            }

            setData = {
                userId: userId || merchantId,
                addressId: addressId,
                address: address.address,
                merchantId: productData.merchantId,
                productId: productData.id,
                productName: productData.productName,
                productDescription: productData.description,
                warranty: productData.warranty,
                price: productData.price,
                variantId: productData?.['productcolourvariants.id'],
                variantName: productData?.['productcolourvariants.colorName'],
                quantity: quantity,
                discount: productData?.['discount.discount'] || 0,
                totalPayableAmount: totalPayableAmount,
                walletAmountUsed: walletAmountUsed,
                couponDiscount: couponDiscount || 0

            }
        } else {
            throw new BadRequestException('Product details not found.')
        }

    } else {
        let cartData = await Cart.findOne({
            where: { id: cartId, userId: userId || merchantId },
            include: [{
                model: Product,
                attributes: { exclude: ['deletedAt', 'createdAt', 'updatedAt', 'isApproved', 'merchantId', 'categoryId', 'highlights', 'quantity'] },
                include: [
                    {
                        model: ProductImage,
                        attributes: { exclude: ['deletedAt', 'updatedAt', 'createdAt', 'productId'] }
                    },
                    {
                        model: Discount,
                        attributes: { exclude: ['deletedAt', 'createdAt', 'updatedAt'] },
                        where: {
                            startDate: { [Op.lte]: new Date() },
                            endDate: { [Op.gte]: new Date() }
                        },
                        required: false
                    }
                ]
            },
            {
                model: ProductColorVariant,
                attributes: { exclude: ['deletedAt', 'createdAt', 'updatedAt'] },
            }],
            raw: true
        })
        if (cartData) {
            if (cartData['product.isActive'] === '0') {
                throw new BadRequestException('This product is no longer available.')
            }

            totalAmount = ((cartData['product.price'] * cartData.totalQuantity) - (cartData['product.price'] * cartData.totalQuantity * cartData['product.discount.discount'] + couponDiscount || 0) / 100)
            if (totalAmount >= wallet) {
                totalPayableAmount = totalAmount - wallet
                walletDetails.walletAmount = 0, walletAmountUsed = wallet
            } else {
                walletDetails.walletAmount = wallet - totalAmount
                totalPayableAmount = 0, walletAmountUsed = wallet - walletDetails.walletAmount
            }

            setData = {
                userId: userId || merchantId,
                addressId: addressId,
                address: address.address,
                merchantId: cartData.merchantId,
                productId: cartData.productId,
                productName: cartData['product.productName'],
                productDescription: cartData['product.description'],
                warranty: cartData['product.warranty'],
                price: cartData['product.price'],
                variantId: cartData['productcolourvariant.id'],
                variantName: cartData['productcolourvariant.colorName'],
                quantity: cartData.totalQuantity,
                discount: cartData['product.discount.discount'] || 0,
                totalPayableAmount: totalPayableAmount,
                walletAmountUsed: walletAmountUsed,
                couponDiscount: couponDiscount || 0

            }
            await Cart.destroy({ where: { id: cartId } })
        } else {
            throw new BadRequestException('Cart details not found.')
        }

    }

    const order = await Order.create(setData)
    if (isUsedWallet === true && !isUsedCoupon) {
        walletDetails.walletAmount = walletDetails.walletAmount
        await walletDetails.save()
    }

    if (!isUsedCoupon && order) {
        await storeCouponForUser(totalAmount, userId || merchantId)
    }
    return res.status(HTTP_STATUS_CODE.OK).json({ status: HTTP_STATUS_CODE.OK, success: true, message: "Order placed successfully." })
}

const getMyOrderList = async (req, res) => {
    const { user: userId, merchant: merchantId } = req;
    const { limit, offset } = req.query
    const limitData = parseInt(limit, 10) || 10;
    const offsetData = parseInt(offset, 10) || 0;

    let data = await Order.findAll({
        where: { userId: userId || merchantId },
        include: [{
            model: User,
            as: 'merchant',
            attributes: { exclude: ['deletedAt', 'createdAt', 'updatedAt', 'isActive', 'image', 'password', 'roleId'] }
        }],
        limit: limitData,
        offset: offsetData,
        order: [['createdAt', 'DESC']],
        attributes: {
            exclude: ['deletedAt', 'createdAt', 'updatedAt', ''],
        },
    })
    const totalCount = await Order.count({ where: { userId: userId || merchantId } })
    const filterCount = data?.length
    return res.status(HTTP_STATUS_CODE.OK).json({ status: HTTP_STATUS_CODE.OK, success: true, message: "Order details loaded successfully.", data: { totalCount, filterCount, data } })
}

module.exports = {
    orderPlace,
    getMyOrderList
}