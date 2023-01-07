const user = require("../../models/user");

module.exports = {
    data: {
        name: "balance",
        description: "Check your balance",
        options: [],
    },
    timeout: 3000,

    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const guildData = await user.findOne({ guild: interaction.guildId, id: interaction.user.id }) || await user.create({ guild: interaction.guildId, id: interaction.user.id, name: interaction.member.displayName });

        interaction.editReply({
            embeds: [{
                color: "RANDOM",
                title: `🎭 ${interaction.user.username}'s Information`,
                fields: [{
                    name: "👛 Balance",
                    value: (guildData.balance || 0) + " Points",
                    inline: true
                }]
            }]
        });
    
        await user.findOneAndUpdate({ guild: interaction.guildId, id: interaction.user.id }, { lastCommand: Date.now() });
    }
}