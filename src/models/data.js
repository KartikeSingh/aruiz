const { model, Schema } = require('mongoose');

module.exports = model('aruiz_bot_settings', new Schema({
    id: String,
    whitelist: {
        type: [String],
        default: []
    },
    wantTo: {
        type: [String],
        default: []
    },
    commitedTo: {
        type: [String],
        default: []
    },
    avatarsCreated: {
        type: Number,
        default: 0
    }
}));