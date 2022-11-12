const { Schema, model } = require('mongoose');

const itemSchema = new Schema({
    id: String,
    name: String,
    shop: String,
    reply: String,
    image: String,
    pieces: Number,
    points: {
        type: Number,
        default: 0
    },
    userLimit: Number,
    role: String,
    lootbox: String,
    response: String,
    description: {
        small: String,
        large: String,
    },
    type: String,
    data: Object,
})

module.exports = model("Item_Config_economy_aruiz", itemSchema);