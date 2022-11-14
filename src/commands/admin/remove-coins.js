const user = require("../../models/user");

module.exports = {
    data: {
        name: "remove-coins",
        description: "remove coins from a user",
        options: [{
            name: "user",
            type: 6,
            description: "User from whom you wanna to remove the coins",
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
            userData = await user.findOneAndUpdate({ id: u.id, guild: interaction.guild.id }, { $inc: { balance: -coins } }, { new: true }) || await user.create({ id: u.id, guild: interaction.guild.id, balance: -points });

        interaction.editReply({
            embeds: [{
                color: "GREEN",
                title: "✅ Coins Taken",
                description: `**${u.username}**'s new balance \`${userData.balance}\` Points`
            }]
        });
    }
}