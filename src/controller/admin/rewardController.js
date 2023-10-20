const User = require("../../models/user")
const Reward = require("../../models/reward")
const { HTTP_STATUS_CODE } = require("../../helper/constants.helper")
const { BadRequestException } = require("../../common/exceptions/index")

const addReward = async (req, res) => {
    const adminId = req.admin;
    const managerId = req.manager;
    const { rewardAmount } = req.body

    await Reward.create({
        addedBy: adminId || managerId,
        rewardAmount: rewardAmount
    })

    return res.status(HTTP_STATUS_CODE.OK).json({ status: HTTP_STATUS_CODE.OK, success: true, message: "Referral reward added successfully." })
}

const updateReward = async (req, res) => {
    const adminId = req.admin;
    const managerId = req.manager;
    const rewardId = req.params.rewardId
    const { rewardAmount } = req.body

    const reward = await Reward.findOne({ where: { id: rewardId } })
    if (reward) {
        await Reward.destroy({ where: { id: rewardId } })
        await Reward.create({
            updatedBy: adminId || managerId,
            rewardAmount: rewardAmount
        })
        return res.status(HTTP_STATUS_CODE.OK).json({ status: HTTP_STATUS_CODE.OK, success: true, message: "Referral reward updated successfully." })
    } else {
        throw new BadRequestException('Reward details not found.')
    }

}

const getRewardList = async (req, res) => {
    const { previewsRewards } = req.query

    const data = await Reward.findAll({
        paranoid: previewsRewards != 1,
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
        include: [{
            model: User,
            attributes: { exclude: ['deletedAt', 'createdAt', 'updatedAt', 'isActive', 'image', 'password', 'roleId'] }
        }]
    })

    return res.status(HTTP_STATUS_CODE.OK).json({ status: HTTP_STATUS_CODE.OK, success: true, message: "Referral reward details successfully.", data })
}

module.exports = {
    addReward,
    updateReward,
    getRewardList
}
