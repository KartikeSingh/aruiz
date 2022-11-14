const user = require("../../models/user");
const item = require("../../models/item");
const page = require('discord-pagination-advanced');

module.exports = {
    data: {
        name: "inventory",
        description: "Check your item's inventory",
        options: [{
            name: "user",
            type: 6,
            description: "User who's inventory you want to see",
        }],
    },
    timeout: "3000",

    run: async (client, interaction) => {
        await interaction.reply({
            ephemeral: true,
            embeds: [{
                title: "🏦 Checking Inventory",
                color: "YELLOW"
            }]
        });

        const u = interaction.options.getUser("user") || interaction.user;

        const userData = await user.findOne({ id: u.id, guild: interaction.guild.id }) || await user.create({ id: u.id, guild: interaction.guild.id });

        if (userData.items.length === 0) return interaction.editReply({
            embeds: [{
                color: "RED",
                title: "😞 Empty Inventory"
            }]
        });

        userData.items = [...new Set((userData.items.map(v => `${v}-${userData.items.filter(x => x === v).length}`)))];

        const pages = [], rows = 10;

        let offset = 0;

        for (let j = 0; j < userData.items.length; j++) {
            const i = j - offset,
                rawData = userData.items[j].split("-"),
                data = await item.findOne({ id: rawData[0], shop: interaction.guild.id }),
                ind = Math.floor(i / rows);

            if (data) {
                const string = `\`${i + 1}.\` **${data.name}**\n> Owned **${rawData[1]}**`;

                pages[ind] ? pages[ind].description += `\n\n${string}` : pages.push({
                    title: `🎁 ${u.username}'s Inventory`,
                    description: string
                });
            }
            else offset++;
        }

        page(interaction, pages, { deleteMessage: false, editReply: true });
    }
}