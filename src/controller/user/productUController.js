const Op = require("sequelize").Op;
const User = require("../../models/user")
const Cart = require("../../models/cart")
const Product = require("../../models/product")
const Category = require("../../models/category")
const Discount = require("../../models/discount")
const ProductImage = require("../../models/productImage")
const { sequelize } = require("../../../config/database")
const { paginate } = require('../../common/middleware/pagination')
const ProductColorVariant = require("../../models/productColorVariant")
const { BadRequestException } = require("../../common/exceptions/index")
const { HTTP_STATUS_CODE, IMAGE_PATH } = require("../../helper/constants.helper")

const getAllProducts = async (req, res) => {
    const { limit, offset, categoryId, productId, search } = req.query
    let where = { isApproved: '2', isActive: '1', isAvailable: '1' }
    if (categoryId) {
        where = { ...where, categoryId: categoryId }
    }
    if (productId) {
        where = { ...where, id: productId }
    }
    if (search) {
        where[Op.or] = [
            { productName: { [Op.like]: `%${search}%` } },
            sequelize.where(sequelize.col('category.name'), 'LIKE', `%${search}%`)
        ];
    }

    let options = {
        include: [
            {
                model: User,
                attributes: { exclude: ['deletedAt', 'createdAt', 'updatedAt', 'isActive', 'image', 'password'] }
            },
            {
                model: Category,
                attributes: { exclude: ['deletedAt', 'createdAt', 'updatedAt', 'image'] }
            },
            {
                model: ProductColorVariant,
                attributes: { exclude: ['productId', 'deletedAt', 'createdAt', 'updatedAt'] }
            },
            {
                model: ProductImage,
                attributes: { exclude: ['productId', 'deletedAt', 'createdAt', 'updatedAt', 'isActive'] }
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
        ],
        attributes: { exclude: ['merchantId', 'createdAt', 'updatedAt', 'deletedAt', 'categoryId'] },
    }

    let { count, rows } = await paginate({ model: Product, offsetData: offset, limitData: limit, where: where, options: options });

    if (rows.length > 0) {
        rows = rows.map((val) => {
            const plainData = val.get({ plain: true })
            plainData.productimages = plainData.productimages.map((img) => {
                return { imgPath: `${IMAGE_PATH.PRODUCT_IMAGE_URL}${img.imagePath}`, id: img.id }
            })
            return plainData
        })

    }
    return res.status(HTTP_STATUS_CODE.OK).json({ status: HTTP_STATUS_CODE.OK, success: true, message: "Product list loaded successfully.", data: { totalCount: count, rows } })
}

const addToCart = async (req, res) => {
    const { user: userId, merchant: merchantId } = req;

    let { productId, selectedVariantId, totalQuantity, } = req.body
    totalQuantity = parseInt(totalQuantity);

    const product = await Product.findOne({ where: { id: productId, isAvailable: '1', isActive: '1', isApproved: '2' } })

    if (product) {
        if (merchantId !== undefined && merchantId === product?.merchantId) {
            throw new BadRequestException('Oops! You cant buy your own product!')
        }

        if (selectedVariantId) {
            const variant = await ProductColorVariant.findOne({ where: { id: selectedVariantId, productId: productId } })
            if (!variant) {
                throw new BadRequestException("This variations is not matched with product variations.")
            }
        }
        const merchant = await Cart.findOne({ where: { userId: userId || merchantId }, raw: true })
        if (merchant !== null && merchant?.merchantId !== product.merchantId) {
            throw new BadRequestException("You can only add one merchant products in cart.")
        }

        await Cart.create({
            userId: userId || merchantId,
            merchantId: product.merchantId,
            productId: productId,
            variantId: selectedVariantId,
            totalQuantity: totalQuantity,
            isAvailable: product.isAvailable
        })
        return res.status(HTTP_STATUS_CODE.OK).json({ status: HTTP_STATUS_CODE.OK, success: true, message: "Product add to cart successfully." })
    } else {
        throw new BadRequestException("Product is deleted or unavailable.")
    }
}

const removeFromCart = async (req, res) => {
    const { user: userId, merchant: merchantId } = req;
    let { cartId } = req.params

    const cartData = await Cart.findOne({ where: { id: cartId, userId: userId || merchantId } })
    if (cartData) {
        await Cart.destroy({ where: { id: cartId, userId: userId || merchantId } })
        return res.status(HTTP_STATUS_CODE.OK).json({ status: HTTP_STATUS_CODE.OK, success: true, message: "Remove from cart successfully." })
    } else {
        throw new BadRequestException("Cart details not found.")
    }
}

const changeCartQuantity = async (req, res) => {
    const { user: userId, merchant: merchantId } = req;
    let { cartId } = req.params
    let { quantity } = req.body
    quantity = parseInt(quantity);

    const cartData = await Cart.findOne({ where: { id: cartId, userId: userId || merchantId } })
    if (cartData) {
        await Cart.update({ totalQuantity: quantity }, { where: { id: cartId, userId: userId || merchantId } })
        return res.status(HTTP_STATUS_CODE.OK).json({ status: HTTP_STATUS_CODE.OK, success: true, message: "Cart details update successfully." })
    } else {
        throw new BadRequestException("Cart details not found.")
    }
}

const getMyCartList = async (req, res) => {
    const { user: userId, merchant: merchantId } = req;
    let data = await Cart.findAll({
        where: { userId: userId || merchantId },
        include: [
            {
                model: User,
                as: 'merchant',
                attributes: { exclude: ['deletedAt', 'createdAt', 'updatedAt', 'isActive', 'image', 'password', 'roleId', 'isReferred', 'walletAmount', 'totalNumOfProduct', 'totalNumOfOrders'] }
            },
            {
                model: Product,
                attributes: { exclude: ['deletedAt', 'createdAt', 'updatedAt', 'isActive', 'isApproved', 'merchantId', 'categoryId', 'highlights', 'warranty', 'quantity'] },
                include: [
                    {
                        model: ProductImage,
                        attributes: { exclude: ['deletedAt', 'updatedAt', 'createdAt', 'productId'] }
                    },
                    {
                        model: Discount,
                        attributes: { exclude: ['deletedAt', 'createdAt', 'updatedAt', 'memberId', 'productId'] },
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
            },
        ],
        attributes: {
            exclude: ['userId', 'merchantId', 'productId', 'variantId', 'deletedAt', 'createdAt', 'updatedAt'],
            include: [
                [
                    sequelize.literal('(`Product`.`price` * `Cart`.`totalQuantity`) - (`Product`.`price` * `Cart`.`totalQuantity` * COALESCE(`Product->Discount`.`discount`, 0) / 100)'),
                    'totalPayableAmount',
                ],
            ],
        }
    })

    if (data.length > 0) {
        data = data.map((val) => {
            const plainData = val.get({ plain: true })
            plainData.totalPayableAmount = parseFloat(plainData.totalPayableAmount).toFixed(2)
            plainData.product.productimages = plainData.product.productimages.map((img) => {
                return { imgPath: `${IMAGE_PATH.PRODUCT_IMAGE_URL}${img.imagePath}`, id: img.id }
            })
            return plainData
        })
    }
    return res.status(HTTP_STATUS_CODE.OK).json({ status: HTTP_STATUS_CODE.OK, success: true, message: "Cart details loaded successfully.", data })
}

module.exports = {
    getAllProducts,
    addToCart,
    removeFromCart,
    changeCartQuantity,
    getMyCartList
}