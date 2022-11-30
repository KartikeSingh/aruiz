const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
    data: {
        name: "whitelist",
        description: "Get whitelisted",
        options: [],
    },
    timeout: 3000,

    run: async (client, interaction) => {
        interaction.reply({
            embeds: [{
                title: "📨 Get Whitelisted"
            }],
            ephemeral: true,
            components: [new MessageActionRow({
                components: [new MessageButton({
                    style: "LINK",
                    url: process.env.REDIRECT_URI,
                    label: "Authorize",
                })]
            })]
        })
    }
}