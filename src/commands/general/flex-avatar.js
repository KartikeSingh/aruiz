const { MessageEmbed} = require("discord.js");
const avatar = require("../../models/avatar")

module.exports = {
    data: {
        name: "flex-avatar",
        description: "Flex your avatar",
        options: [],
    },
    timeout: 3000,

    run: async (client, interaction) => {
        await interaction.deferReply({});

        const user = interaction.user,
            av = await avatar.findOne({ id: user.id });

        if (!av?.url) return interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setColor("RED")
                    .setTitle("❌ No Avatar Setted")
            ]
        });

        interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setColor("#FA00ff")
                    .setTitle(`${user.username}`)
                    .setURL(av.url)
                    .setImage(av.url)
            ]
        });
    }
}