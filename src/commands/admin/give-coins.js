const user = require("../../models/user");

module.exports = {
    data: {
        name: "give-coins",
        description: "give coins to a user",
        options: [{
            name: "user",
            type: 6,
            description: "User whom you wanna to give the coins",
            required: true,
        }, {
            name: "coins",
            type: 4,
            description: "coins you want to change",
            required: true,
            minValue: 1
        }],
    },
    timeout: 3000,

    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const
            coins = interaction.options.getInteger("coins"),
            u = interaction.options.getUser("user"),
            userData = await user.findOneAndUpdate({ id: u.id, guild: interaction.guild.id }, { $inc: { balance:  coins } }, { new: true }) || await user.create({ id: u.id, guild: interaction.guild.id, balance: points });

        interaction.editReply({
            embeds: [{
                color: "GREEN",
                title: "✅ Coins Added",
                description: `**${u.username}**'s new balance \`${userData.balance}\` Points`
            }]
        });
    }
}