const { MessageEmbed } = require('discord.js');
const avatar = require("../../models/avatar");

module.exports = {
    data: {
        name: "avatars-created",
        description: "Check the number of users who created avatar",
        options: [],
    },
    timeout: 3000,

    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const count = await avatar.countDocuments({});

        interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setColor("#FA00ff")
                    .setDescription(`Avatars created: **${count}**`)
            ]
        })
    }
}