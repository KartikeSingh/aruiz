const { Schema, model } = require('mongoose');

const itemSchema = new Schema({
    id: String,
    shopOwners: {
        type: [String],
        default: []
    },
    marketplaceOwners: {
        type: [String],
        default: []
    },
    ignoreXP: {
        type: [String],
        default: []
    },
    xp: {
        type: Boolean,
        default: false
    },
    xpTimeout: {
        type: Number,
        default: 60000
    },
    xpLevelUp: {
        message: {
            type: String,
            default: "Congrats {mention} 🎉 on reaching {level} level"
        },
        channel: {
            type: String,
            default: "0"
        },
        enable: {
            type: Boolean,
            default: true
        }
    },
    xpRate: {
        type: Number,
        default: 1
    },
    xpLimit: {
        up: {
            type: Number,
            default: 20
        },
        down: {
            type: Number,
            default: 5
        },
    },
    levelRewardMessage: {
        success: {
            type: String,
            default: "Congrats {mention} 🎉 on reaching {level} level, and you got **{role}** role as a reward 🎉"
        },
        fail: {
            type: String,
            default: "Congrats {mention} 🎉 on reaching {level} level, you were supposed to get **{role}** role as a reward but I was unable to give you the role"
        },
    },
    levelReward: {
        type: Object,
        default: {}
    },
})

module.exports = model("Guild_Config_aruiz", itemSchema);