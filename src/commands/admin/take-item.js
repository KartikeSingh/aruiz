const { MessageEmbed } = require("discord.js");
const item = require("../../models/item");
const user = require("../../models/user");

module.exports = {
    data: {
        name: "take-item",
        description: "take item from a user",
        options: [{
            name: "user",
            type: 6,
            description: "User from whom you wanna to take the item",
            required: true,
        }, {
            name: "item",
            type: 3,
            description: "The item name",
            required: true,
        }, {
            name: "units",
            type: 4,
            description: "units you want to take",
            required: true,
            minValue: 1
        }],
    },
    timeout: 3000,

    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const
            units = interaction.options.getInteger("units"),
            itemName = interaction.options.getString("item"),
            u = interaction.options.getUser("user"),
            itemData = await item.findOne({ name: itemName }),
            userData = await user.findOne({ id: u.id, guild: interaction.guild.id }) || await user.create({ id: u.id, guild: interaction.guild.id });

        if (!itemData) return interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setColor("RED")
                    .setTitle("❌ Invalid Item Name")
            ]
        });

        const owned = userData.items.filter(x => x === itemData.id).length;

        if (owned < units) return interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setColor("RED")
                    .setTitle("❌ Invalid Units")
                    .setDescription(`User only have \`${owned}\` units, So you can't take \`${units}\` units from them!`)
            ]
        });

        const newItems = userData.items.filter(x => x !== itemData.id);
        for (let i = units; i < owned; i++)newItems.push(itemData.id);

        await user.findOneAndUpdate({ id: u.id, guild: interaction.guild.id }, {  items: newItems });

        interaction.editReply({
            embeds: [{
                color: "GREEN",
                title: "✅ Items Taken",
                description: `**${u.username}**'s lost \`${units}\` of **${itemData.name}** item`
            }]
        });
    }
}