const Op = require("sequelize").Op;
const formidable = require("formidable")
const Category = require("../../models/category")
const { paginate } = require('../../common/middleware/pagination')
const { fileUpload, deleteFile } = require("../../helper/fileUpload")
const { BadRequestException } = require("../../common/exceptions/index")
const { HTTP_STATUS_CODE, IMAGE_PATH } = require("../../helper/constants.helper")


const addCategory = async (req, res) => {
    const form = formidable({ multiples: true })
    form.parse(req, async (err, fields, files) => {
        let { name } = fields
        if (!name) return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ status: HTTP_STATUS_CODE.BAD_REQUEST, success: true, message: "Category name is required." })
        const isCategoryExits = await Category.findOne({ where: { name: name } })
        if (isCategoryExits) return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ status: HTTP_STATUS_CODE.BAD_REQUEST, success: true, message: "Category name already exits" })

        if (files.image) {
            const result = await fileUpload(files.image, ['jpeg', 'png', 'jpg'], 'category')
            if (result.success === false) {
                res.status(result.status).json(result)
            } else {
                fields.image = result
            }
        } else {
            return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ status: HTTP_STATUS_CODE.BAD_REQUEST, success: true, message: "Category image is required." })
        }

        await Category.create(fields)
        return res.status(HTTP_STATUS_CODE.OK).json({ status: HTTP_STATUS_CODE.OK, success: true, message: "Category added successfully." })
    })
}

const getAllCategory = async (req, res) => {
    let { offset, limit, search } = req.query
    let where = {}
    if (search) {
        where.name = { [Op.like]: `%${search}%`, }
    }
    const options = {
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
    };

    const totalCount = await Category.count({})
    const { count, rows } = await paginate({ model: Category, offsetData: offset, limitData: limit, where: where, options: options });
    if (rows.length > 0) {
        rows.map((val) => {
            let plainData = val.get({ plain: true })
            plainData.image = `${IMAGE_PATH.CATEGORY_IMAGE_URL}${plainData.image}`
            return plainData
        })
    }
    res.status(HTTP_STATUS_CODE.OK).json({ status: HTTP_STATUS_CODE.OK, success: true, message: "Category list loaded successfully.", data: { totalCount, filterCount: count, rows } })
}

const getSingleCategory = async (req, res) => {
    const { categoryId } = req.params

    const data = await Category.findOne({
        where: { id: categoryId },
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
    })
    if (data) {
        data.image = `${IMAGE_PATH.CATEGORY_IMAGE_URL}${data.image}`
    } else {
        throw new BadRequestException('Category details not found.')
    }

    res.status(HTTP_STATUS_CODE.OK).json({ status: HTTP_STATUS_CODE.OK, success: true, message: "Category list loaded successfully.", data })
}

const updateCategory = async (req, res) => {
    const { categoryId } = req.params
    let form = formidable({ multiples: true })
    form.parse(req, async (err, fields, files) => {
        let { name } = fields

        let category = await Category.findByPk(categoryId)
        if (category) {
            if (name) {
                const isCategoryExits = await Category.findOne({ where: { name: name } })
                if (isCategoryExits !== null && isCategoryExits?.id.toString() !== categoryId) return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ status: HTTP_STATUS_CODE.BAD_REQUEST, success: true, message: "Category name already exits" })
            }

            if (files.image) {
                let result = await fileUpload(files.image, ['jpg', 'png', 'jpeg'], 'category')
                if (result.success === false) {
                    res.status(result.status).json(result)
                } else {
                    fields.image = result
                }
                await deleteFile('category', category.image)
            }

            await Category.update(fields, { where: { id: categoryId } })
            return res.status(HTTP_STATUS_CODE.OK).json({ status: HTTP_STATUS_CODE.OK, success: true, message: "Category updated successfully." })

        } else {
            return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ status: HTTP_STATUS_CODE.BAD_REQUEST, success: true, message: "Category details not found." })
        }

    })

}

const deleteCategory = async (req, res) => {
    const { categoryId } = req.params
    const category = await Category.findOne({ where: { id: categoryId } });

    if (!category) {
        throw new BadRequestException("Category details not found.")
    } else {
        await Category.destroy({ where: { id: categoryId } });
        res.status(HTTP_STATUS_CODE.OK).json({ status: HTTP_STATUS_CODE.OK, success: true, message: "Category deleted successfully." })
    }
}

const changeCategoryStatus = async (req, res) => {
    const { categoryId } = req.params
    const { status } = req.body
    if (!status) throw new BadRequestException("Category status is required.")
    const category = await Category.findOne({ where: { id: categoryId } });

    if (!category) {
        throw new BadRequestException("Category details not found.")
    } else {
        await Category.update({ isActive: status }, { where: { id: categoryId } });
        return res.status(HTTP_STATUS_CODE.OK).json({ status: HTTP_STATUS_CODE.OK, success: true, message: "Category status updated successfully." })
    }
}

module.exports = {
    addCategory,
    getAllCategory,
    getSingleCategory,
    updateCategory,
    deleteCategory,
    changeCategoryStatus,
}
