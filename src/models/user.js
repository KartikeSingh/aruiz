const { model, Schema } = require('mongoose');

module.exports = model('aruiz_bot_user', new Schema({
    id: String,
    name: String,
    guild: String,
    items: [String],
    wantTo: [String],
    commitedTo: [String],
    balance: {
        type: Number,
        default: 0
    },
    timeouts: {
        type: Object,
        default: {}
    },
    dailyStreak: {
        type: Number,
        default: 0
    },
    xp: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 0
    },
    lastXP: {
        type: Number,
        default: 0
    },
}));