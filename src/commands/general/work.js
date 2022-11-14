const users = require('../../models/user');

module.exports = {
    data: {
        name: "work",
        description: "Work for 1 hour and come back to claim your LB Coins",
        options: [],
    },
    timeout: 5000,

    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const user = await users.findOne({ id: interaction.user.id, guild: interaction.guild.id }) || await users.create({ id: interaction.user.id, guild: interaction.guild.id });

        if (user.timeouts.work > Date.now()) return interaction.editReply({
            embeds: [{
                color: "RED",
                title: "⏰ Timeout",
                description: `You can work again <t:${Math.floor(user.timeouts.work / 1000)}:R>`
            }]
        });

        const max = 100, min = 20, reward = Math.floor(Math.random() * (max - min) + min);

        const newData = await users.findOneAndUpdate({ id: interaction.user.id, guild: interaction.guild.id }, { $inc: { balance: reward }, "timeouts.work": Date.now() + 3600000 }, { new: true });

        interaction.editReply({
            embeds: [{
                color: "RANDOM",
                title: "⚒️ Worked Successfully",
                description: `You earned \`${reward}\` 🪙, you can work again <t:${Math.floor(newData.timeouts.work / 1000)}:R>`
            }]
        });
    }
}