const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const User = require("../../models/user")
const Role = require("../../models/role")
const { sequelize } = require("../../../config/database")
const Reward = require("../../models/reward")
const Address = require("../../models/address")
const Referral = require("../../models/referral")
const { HTTP_STATUS_CODE } = require("../../helper/constants.helper")
const { BadRequestException, ConflictRequestException } = require("../../common/exceptions/index")

const singUp = async (req, res) => {
    const t = await sequelize.transaction();
    let { email, password, roleId, address, phoneNumber, isReferral, referralId } = req.body
    let referralDetails = {}

    // validations
    const user = await User.findOne({ where: { email: email } })
    if (user) {
        throw new ConflictRequestException("An account already exists with this email address.")
    }

    const isPhoneNumber = await User.findOne({ where: { phoneNumber: phoneNumber } })
    if (isPhoneNumber) {
        throw new ConflictRequestException("This phone number already exists! Use a different phone number")
    }

    const isRoleExits = await Role.findByPk(roleId)
    if (!isRoleExits) throw new BadRequestException('RoleId not exits.')

    if (isReferral && isReferral != 'true' && isReferral != 'false') throw new BadRequestException('isReferral must be either true or false.')
    if (isReferral == 'true') {
        if (!referralId) {
            throw new BadRequestException('Referral id is required.')
        } else {
            referralDetails = await User.findOne({ where: { id: referralId, isActive: '1' } })
            if (!referralDetails) {
                throw new BadRequestException('Referral details not found.')
            }
        }
    }

    req.body.password = bcrypt.hashSync(password, 10)
    const data = await User.create(req.body, { transaction: t })

    // add address in address table
    if (address) {
        await Address.create({
            userId: data?.id, address
        }, { transaction: t })
    }


    // if user is referred by then add in referral table and also added reward amount in referral's wallet
    if (isReferral == 'true') {
        let rewardDetails = await Reward.findOne({ plain: true })
        await Referral.create({
            userId: data.id,
            referralId: referralId,
            rewardAmount: rewardDetails.rewardAmount
        }, { transaction: t })

        data.isReferred = '1'
        // const referralData = await User.findOne({ where: { id: referralId, isActive: '1' } })
        if (referralDetails) {
            referralDetails.walletAmount += rewardDetails.rewardAmount
            await referralDetails.save({ transaction: t })
        }
    }
    const token = jwt.sign({ id: data.id }, process.env.JWT_SEC, { expiresIn: process.env.JWT_EXPIRES })
    data.accessToken = token
    await data.save({ transaction: t })
    await t.commit();
    return res.status(HTTP_STATUS_CODE.CREATED).json({ status: HTTP_STATUS_CODE.CREATED, success: true, message: "SignUp SuccessFully..", data: { userId: data.id, token } });

}

const login = async (req, res) => {
    let { email, password } = req.body
    const user = await User.findOne({ where: { email: email } })

    if (!user || !bcrypt.compareSync(password, user?.password)) {
        throw new BadRequestException("Invalid email or password")
    }
    const token = jwt.sign({ id: user?.id }, process.env.JWT_SEC, { expiresIn: process.env.JWT_EXPIRES })
    user.accessToken = token
    await user.save()
    res.status(HTTP_STATUS_CODE.OK).json({ status: HTTP_STATUS_CODE.OK, success: true, message: "Login SuccessFully..", data: { userId: user?.id, token, role: user.roleId } });
}

module.exports = {
    singUp,
    login
}