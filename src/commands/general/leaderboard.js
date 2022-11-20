const { MessageAttachment } = require('discord.js');
const user = require("../../models/user");
const createLeaderBoard = require("../../utility/createLeaderBoard");

module.exports = {
    data: {
        name: "leaderboard",
        description: "Show the leaderboard",
        options: [{
            name: "type",
            type: 3,
            description: "Select the leaderboard type",
            choices: [{
                name: "Coins",
                value: "1"
            }]
        }],
    },
    timeout: 3000,

    run: async (client, interaction) => {
        if (interaction.deferReply) await interaction.deferReply({ ephemeral: true });

            const top = (await user.find({ guild: interaction.guild.id }).sort({ balance: -1 }).limit(10)).map(v => {
                const user = client.users.cache.get(v.id);

                v.name = user?.username || "Unknown";
                v.avatar = user?.displayAvatarURL() || "https://media.discordapp.net/ephemeral-attachments/1030503421113008308/1030506718679015565/ban.png";

                return v;
            });

            interaction[interaction.editReply ? "editReply" : "reply"]({
                embeds: [{
                    color: "RANDOM",
                    title: `👑 Leaderboard`,
                    image: {
                        url: "attachment://image.png"
                    }
                }],
                files: [new MessageAttachment(await createLeaderBoard(top), "image.png")]
            })
    }
}