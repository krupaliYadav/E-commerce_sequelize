const Op = require("sequelize").Op;
const User = require("../../models/user")
const Product = require("../../models/product")
const Discount = require("../../models/discount")
const Category = require("../../models/category")
const ProductImage = require("../../models/productImage")
const ProductColorVariant = require("../../models/productColorVariant")
const { BadRequestException } = require("../../common/exceptions/index")
const { HTTP_STATUS_CODE, IMAGE_PATH } = require("../../helper/constants.helper")

const getProductList = async (req, res) => {
    const { limit, offset, merchantId } = req.query
    const limitData = parseInt(limit, 10) || 10;
    const offsetData = parseInt(offset, 10) || 0;

    let where = {}
    if (merchantId) {
        where = { merchantId: merchantId }
    }

    let data = await Product.findAll({
        where: where,
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
        limit: limitData,
        offset: offsetData,
        order: [['id', 'DESC']],
        attributes: { exclude: ['merchantId', 'createdAt', 'updatedAt', 'deletedAt', 'categoryId'] }
    })

    const totalCount = await Product.count({})
    const filterCount = data.length
    if (data.length > 0) {
        data = data.map((val) => {
            const plainData = val.get({ plain: true })
            plainData.productimages = plainData.productimages.map((img) => {
                return { imgPath: `${IMAGE_PATH.PRODUCT_IMAGE_URL}${img.imagePath}`, id: img.id }
            })
            return plainData
        })

    }
    return res.status(HTTP_STATUS_CODE.OK).json({ status: HTTP_STATUS_CODE.OK, success: true, message: "Product list loaded successfully.", data: { totalCount, filterCount, data } })
}

const ProductStatus = async (req, res) => {
    const productId = req.params.productId
    const { status } = req.body
    if (!status) throw new BadRequestException("Status is required.")

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