const { model, Schema } = require('mongoose');

module.exports = model('pound_score_hisotry_aruiz', new Schema({
    id: String,
    data: [{
        score: Number,
        date: String
    }]
}))