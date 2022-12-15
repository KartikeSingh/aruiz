const { model, Schema } = require('mongoose');

module.exports = model('user_avatar_aruiz', new Schema({
    id: String,
    url:String,
    updatedAt:Number,
}))