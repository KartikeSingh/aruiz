const user = require("../../models/user");

module.exports = {
    data: {
        name: "leaderboard",
        description: "Show the balance leaderboard",
        options: [],
    },
    timeout: 3000,

    run: async (client, interaction) => {
        if (interaction.deferReply) await interaction.deferReply({ ephemeral: true });

        const top = await user.find({ guild: interaction.guild.id }).sort({ balance: -1 }).limit(10);

        interaction[interaction.editReply ? "editReply" : "reply"]({
            embeds: [{
                color: "RANDOM",
                title: `👑 Balance Leaderboard`,
                description: `\`Rank.\` **Balance** - **User**\n${top.map((v, i) => `\`${i + 1}.\` **\t\t${v.balance}** <@${v.id}>`).join("\n")}`
            }]
        })
    }
}