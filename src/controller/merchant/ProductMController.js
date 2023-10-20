const Op = require("sequelize").Op;
const formidable = require("formidable")
const Product = require("../../models/product")
const Category = require("../../models/category")
const Discount = require("../../models/discount")
const ProductImage = require("../../models/productImage")
const { fileUpload } = require("../../helper/fileUpload")
const { addProductValidation } = require("../../common/validation")
const ProductColorVariant = require("../../models/productColorVariant")
const { BadRequestException } = require("../../common/exceptions/index")
const { HTTP_STATUS_CODE, IMAGE_PATH } = require("../../helper/constants.helper")

const addProduct = async (req, res) => {
    const merchantId = req.merchant
    let form = formidable({ multiples: true })
    form.parse(req, async (err, fields, files) => {
        try {
            const { categoryId, productName, price, highlights, description, warranty, quantity, colorVariant, deliveryInDays } = fields
            let imgData = []

            const validation = addProductValidation.filter((field) => !fields[field])
            if (validation.length > 0) {
                return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ status: HTTP_STATUS_CODE.BAD_REQUEST, success: false, message: `The ${validation.join(', ')} is required.` })
            }

            const isCategoryExits = await Category.findOne({ where: { id: categoryId, isActive: '1' } })
            if (!isCategoryExits) {
                return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ status: HTTP_STATUS_CODE.BAD_REQUEST, success: false, message: 'Category id does not exits.' })
            }

            if (files.image) {
                files.image = Array.isArray(files.image) ? files?.image : [files.image]
                imgData = await Promise.all(files.image.map(async (newImg) => {
                    return await new Promise(async (resolve, reject) => {
                        const result = await fileUpload(newImg, ["jpeg", "png", "jpg"], 'products')
                        if (result.success === false) {
                            reject(result)
                        } else {
                            resolve(result)
                        }
                    })
                }))

            } else {
                return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ status: HTTP_STATUS_CODE.BAD_REQUEST, success: false, message: 'Product image is required.' })
            }

            const product = await Product.create({
                merchantId: merchantId,
                categoryId: categoryId,
                productName: productName,
                price: price,
                highlights: highlights,
                description: description,
                warranty: warranty,
                quantity: quantity,
                deliveryInDays: deliveryInDays
            })

            if (product) {
                const data = imgData.map((val) => {
                    return { productId: product.id, imagePath: val }
                })
                await ProductImage.bulkCreate(data)
                if (colorVariant) {
                    colorVariant.map(val => val.productId = product.id)
                    await ProductColorVariant.bulkCreate(colorVariant)
                }
            }
            return res.status(HTTP_STATUS_CODE.OK).json({ status: HTTP_STATUS_CODE.OK, success: true, message: "Product added successfully." })


        } catch (error) {
            return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER).json({ status: HTTP_STATUS_CODE.INTERNAL_SERVER, success: false, message: error.message })
        }
    })
}

const getMyProductList = async (req, res) => {
    const merchantId = req.merchant
    const { limit, offset } = req.query
    const limitData = parseInt(limit, 10) || 10;
    const offsetData = parseInt(offset, 10) || 0;

    let data = await Product.findAll({
        where: { merchantId: merchantId },
        include: [
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

    const totalCount = await Product.count({ where: { merchantId: merchantId } })
    const filterCount = data?.length
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

const updateProduct = async (req, res) => {
    const merchantId = req.merchant
    const productId = req.params.productId
    let form = formidable({ multiples: true })
    form.parse(req, async (err, fields, files) => {
        let { categoryId, colorVariant } = fields

        const product = await Product.findOne({ where: { id: productId, merchantId: merchantId } })
        if (!product) return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ status: HTTP_STATUS_CODE.BAD_REQUEST, success: true, message: "Product details not found." })

        // check category exits or not
        if (categoryId) {
            const isCategoryExits = await Category.findOne({ where: { id: categoryId, isActive: '1' } })
            if (!isCategoryExits) {
                return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ status: HTTP_STATUS_CODE.BAD_REQUEST, success: true, message: "Category not exits." })
            } else {
                fields.categoryId = categoryId
            }
        }

        if (files.image) {
            files.image = Array.isArray(files.image) ? files.image : [files.image];
            const imgData = await Promise.all(files.image.map(async (newImg) => {
                return await new Promise(async (resolve, reject) => {
                    const result = await fileUpload(newImg, ["jpeg", "png", "jpg"], 'products')
                    if (result.success === false) {
                        reject(result)
                    } else {
                        resolve({ productId: productId, imagePath: result })
                    }
                })
            }))
            await ProductImage.bulkCreate(imgData)
        }

        if (colorVariant) {
            colorVariant.map(val => val.productId = productId)
            await ProductColorVariant.destroy({ where: { productId: productId } })
            await ProductColorVariant.bulkCreate(colorVariant)
        }

        await Product.update(fields, { where: { id: productId } })
        return res.status(HTTP_STATUS_CODE.OK).json({ status: HTTP_STATUS_CODE.OK, success: true, message: "Product updated successfully." })
    })
}

const UpdateIsAvailable = async (req, res) => {
    const merchantId = req.merchant
    const productId = req.params.productId
    const { status } = req.body
    if (!status) throw new BadRequestException("Status is required.")

    const product = await Product.findOne({ where: { id: productId, merchantId: merchantId } })
    if (product) {
        await Product.update({ isAvailable: status }, { where: { id: productId } })
        return res.status(HTTP_STATUS_CODE.OK).json({ status: HTTP_STATUS_CODE.OK, success: true, message: "Product status change successfully." })
    } else {
        throw new BadRequestException("Product details not found.")
    }
}

const addDiscount = async (req, res) => {
    const adminId = req.admin
    const merchantId = req.merchant

    let { productId, discount, startDate, endDate } = req.body

    const product = await Product.findOne({ where: { id: productId } })
    if (product) {

        if (merchantId && merchantId !== undefined) {
            const productData = await Product.findOne({ where: { id: productId, merchantId: merchantId } })
            if (!productData) {
                throw new BadRequestException("Product details not found.")
            }
        }

        const discountData = await Discount.findOne({
            where: { productId: productId, startDate: { [Op.lte]: new Date() }, endDate: { [Op.gte]: new Date() } }
        })
        if (discountData) {
            throw new BadRequestException("Discount is already added for this product.")
        } else {
            await Discount.create({
                productId: productId,
                memberId: adminId || merchantId,
                discount: discount,
                startDate: startDate,
                endDate: endDate
            })
            return res.status(HTTP_STATUS_CODE.OK).json({ status: HTTP_STATUS_CODE.OK, success: true, message: "Discount added successfully." })
        }
    } else {
        throw new BadRequestException('Product details not found.')
    }

}


module.exports = {
    addProduct,
    getMyProductList,
    updateProduct,
    UpdateIsAvailable,
    addDiscount
}