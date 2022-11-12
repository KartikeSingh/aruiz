const { Schema, model } = require('mongoose');

const shopSchema = new Schema({
    id: String,
    name: String,
    description: String,
    guild: String,
    image: String,
    closed: {
        type: Boolean,
        default: false
    }
})

module.exports = model("Shop_Config_economy_aruiz_2", shopSchema);