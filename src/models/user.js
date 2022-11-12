const { model, Schema } = require('mongoose');

module.exports = model('aruiz_bot_user', new Schema({
    id: String,
    name: String,
    guild: String,
    items: [String],
    points: {
        type: Number,
        default: 0
    },
    balance: {
        type: Number,
        default: 0
    },
}));