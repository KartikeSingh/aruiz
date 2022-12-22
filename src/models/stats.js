const { model, Schema } = require('mongoose');

module.exports = model('stat_aruiz_bot', new Schema({
    id: String,
    guild: String,
    channel: String,
    type: Number,
}))