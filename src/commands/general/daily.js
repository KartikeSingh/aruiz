const users = require('../../models/user');

module.exports = {
    data: {
        name: "daily",
        description: "Claim your daily reward",
        options: [],
    },
    timeout: 5000,

    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const user = await users.findOne({ id: interaction.user.id, guild: interaction.guild.id }) || await users.create({ id: interaction.user.id, guild: interaction.guild.id });

        if (user.timeouts.daily > Date.now()) return interaction.editReply({
            embeds: [{
                color: "RED",
                title: "⏰ Timeout",
                description: `You can claim daily reward again <t:${Math.floor(user.timeouts.daily / 1000)}:R>`
            }]
        });

        const max = 300, min = 200, reward = Math.floor(Math.random() * (max - min) + min) + (5 * user.dailyStreak);

        const newData = await users.findOneAndUpdate({ id: interaction.user.id, guild: interaction.guild.id }, { $inc: { balance: reward }, "timeouts.daily": Date.now() + 24 * 3600000, dailyStreak: Date.now() - user.timeouts.daily > 32 * 3600000 ? 0 : user.dailyStreak + 1 }, { new: true });

        interaction.editReply({
            embeds: [{
                color: "RANDOM",
                title: "💰 Daily Reward Claimed",
                description: `You earned \`${reward}\` 🪙 and now you have a streak of **${newData.dailyStreak}** 🔥, you can claim your daily again <t:${Math.floor(newData.timeouts.daily / 1000)}:R>`
            }]
        });
    }
}