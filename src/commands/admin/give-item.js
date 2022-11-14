const { MessageEmbed } = require("discord.js");
const item = require("../../models/item");
const user = require("../../models/user");

module.exports = {
    data: {
        name: "give-item",
        description: "Give item to a user",
        options: [{
            name: "user",
            type: 6,
            description: "User whom you wanna to give the item",
            required: true,
        }, {
            name: "item",
            type: 3,
            description: "The item name",
            required: true,
        }, {
            name: "units",
            type: 4,
            description: "units you want to give",
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

        await user.findOneAndUpdate({ id: u.id, guild: interaction.guild.id }, { $push: { items: new Array(units).fill(itemData.id) } });

        interaction.editReply({
            embeds: [{
                color: "GREEN",
                title: "✅ Items Added",
                description: `**${u.username}**'s got \`${units}\` of **${itemData.name}** item`
            }]
        });
    }
}