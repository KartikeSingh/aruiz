const { MessageAttachment } = require('discord.js');
const user = require("../../models/user");
const createRankCard = require('../../utility/createRankCard');

module.exports = {
    data: {
        name: "rank",
        description: "Get rank card of a user",
        options: [{
            name: "user",
            type: 6,
            description: "User who's rank card you want to view",
        }],
    },
    timeout: 6000,

    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const u = interaction.options.getUser("user") || interaction.user,
            data = await user.findOne({ guild: interaction.guild.id, id: u.id }) || await user.create({ guild: interaction.guild.id, id: u.id });

        data.name = u.username;
        data.avatar = u.displayAvatarURL();
        data.requiredXp = 100;

        for (let i = 1; i <= data.level; i++)data.requiredXp += 5 * (i ^ 2) + (50 * i) + 100;

        interaction.editReply({
            embeds: [
                {
                    color: "RANDOM",
                    title: `${u.username}'s Pound Score Card`,
                    image: {
                        url: "attachment://image.png"
                    }
                }
            ],
            files: [new MessageAttachment(await createRankCard(data), "image.png")]
        })
    }
}