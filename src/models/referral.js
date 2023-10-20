const { sequelize, DataTypes } = require("../../config/database")

const Referral = sequelize.define('referral', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    referralId: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    rewardAmount: {
        type: DataTypes.INTEGER,
    }
}, {
    paranoid: true,
    timestamps: true
})

module.exports = Referral