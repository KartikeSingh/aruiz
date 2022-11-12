const user = require("../../models/user");

module.exports = {
    data: {
        name: "points",
        description: "Manage points of a user",
        options: [{
            name: "user",
            type: 6,
            description: "User agianst whom you wanna take the action",
            required: true,
        }, {
            name: "action",
            type: 4,
            description: "What action do you want to take",
            required: true,
            choices: [{
                name: "Add Points",
                value: 1
            }, {
                name: "Take Points",
                value: -1
            }]
        }, {
            name: "points",
            type: 4,
            description: "Points you want to change",
            required: true,
            minValue: 1
        }],
    },
    timeout: 3000,

    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const
            points = interaction.options.getInteger("points"),
            action = interaction.options.getInteger("action"),
            u = interaction.options.getUser("user"),
            userData = await user.findOneAndUpdate({ id: u.id, guild: interaction.guild.id }, { $inc: { balance: action * points } }, { new: true }) || await user.create({ id: u.id, guild: interaction.guild.id, balance: action * points });

        interaction.editReply({
            embeds: [{
                color: "GREEN",
                title: "✅ User Updated",
                description: `New balance \`${userData.balance}\` Points`
            }]
        });
    }
}