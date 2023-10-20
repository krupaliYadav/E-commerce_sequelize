const Op = require('sequelize').Op
const User = require("../../models/user")
const Role = require("../../models/role")
const Address = require("../../models/address")
const Product = require("../../models/product")
const { paginate } = require('../../common/middleware/pagination')
const { HTTP_STATUS_CODE } = require("../../helper/constants.helper")
const { BadRequestException } = require("../../common/exceptions/index")

const getUser = async (req, res) => {
    const { offset, limit, role, search, userId } = req.query;
    let where = {};
    if (role) {
        where = { roleId: role }
    }
    if (search) {
        where[Op.or] = [
            { firstName: { [Op.like]: `%${search}%` } },
            { lastName: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
        ];
    }

    if (userId) {
        where = { id: userId }
    }
    const options = {
        attributes: { exclude: ['deletedAt', 'updatedAt', 'createdAt', 'password', 'image'] },
        include: [
            { model: Role, attributes: ['name'] },
            { model: Address, attributes: ['id', 'address'] },
        ],
    };

    const totalCount = await User.count({})
    let { count, rows } = await paginate({ model: User, offsetData: offset, limitData: limit, where: where, options: options });

    if (rows.length > 0) {
        rows = rows.map((val) => {
            let plainData = val.get({ plain: true })
            if (plainData.roleId !== 3) {
                delete plainData.totalNumOfProduct
            }
            return plainData
        })
    }
    return res.status(HTTP_STATUS_CODE.OK).json({ status: HTTP_STATUS_CODE.OK, success: true, message: "User list loaded successfully.", data: { totalCount, filterCount: count, rows } })
}

const changeUserStatus = async (req, res) => {
    const userId = req.params.userId
    const { status } = req.body
    if (!status) throw new BadRequestException("Status is required.")
    console.log(userId);
    const user = await User.findOne({ where: { id: userId }, raw: true })

    if (user) {
        await User.update({ isActive: status }, { where: { id: userId } })
        if (user.roleId == 3) {
            // de-active all product related to merchant
            await Product.update({ isActive: status }, { where: { merchantId: userId } })
        }
        return res.status(HTTP_STATUS_CODE.OK).json({ status: HTTP_STATUS_CODE.OK, success: true, message: "Product status change successfully." })
    } else {
        throw new BadRequestException("Product details not found.")
    }
}
module.exports = {
    getUser,
    changeUserStatus
}
