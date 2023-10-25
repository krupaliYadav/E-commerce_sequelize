const Op = require("sequelize").Op;
const User = require("../../models/user")
const Product = require("../../models/product")
const Discount = require("../../models/discount")
const Category = require("../../models/category")
const ProductImage = require("../../models/productImage")
const { paginate } = require('../../common/middleware/pagination')
const ProductColorVariant = require("../../models/productColorVariant")
const { BadRequestException } = require("../../common/exceptions/index")
const { HTTP_STATUS_CODE, IMAGE_PATH } = require("../../helper/constants.helper")

const getProductList = async (req, res) => {
    const { limit, offset, merchantId, search } = req.query

    let where = {}
    if (merchantId) {
        where = { merchantId: merchantId }
    }
    if (search) {
        where[Op.or] = [
            { productName: { [Op.like]: `%${search}%` } },
        ];
    }

    let options = {
        include: [
            {
                model: User,
                attributes: { exclude: ['deletedAt', 'createdAt', 'updatedAt', 'isActive', 'image', 'password', 'accessToken'] }
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

        attributes: { exclude: ['merchantId', 'createdAt', 'updatedAt', 'deletedAt', 'categoryId'] }
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

const ProductStatus = async (req, res) => {
    const productId = req.params.productId
    const { status } = req.body
    if (!status) throw new BadRequestException("Status is required.")
    if (status != '2' && status != '3') throw new BadRequestException('Status must be either 2 or 3.')
    const product = await Product.findByPk(productId)
    if (product) {
        await Product.update({ isApproved: status }, { where: { id: productId } })
        return res.status(HTTP_STATUS_CODE.OK).json({ status: HTTP_STATUS_CODE.OK, success: true, message: "Product status change successfully." })
    } else {
        throw new BadRequestException("Product details not found.")
    }
}
module.exports = {
    getProductList,
    ProductStatus
}