const { model, Schema } = require('mongoose');

module.exports = model('aruiz_bot_settings', new Schema({
    id: String,
    whitelist: {
        type: [String],
        default: []
    }
}));