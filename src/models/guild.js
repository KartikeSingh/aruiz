const { Schema, model } = require('mongoose');

const itemSchema = new Schema({
    id: String,
    shopOwners: [String],
    marketplaceOwners: [String],
})

module.exports = model("Guild_Config_aruiz", itemSchema);