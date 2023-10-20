const { sequelize, DataTypes } = require("../../config/database")

const Reward = sequelize.define('reward', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    addedBy: {
        type: DataTypes.BIGINT,
    },
    updatedBy: {
        type: DataTypes.BIGINT,
    },
    rewardAmount: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    paranoid: true,
    timestamps: true
})

module.exports = Reward