const botConfig = require('../../models/guild');

module.exports = {
    data: {
        name: "marketpalace",
        description: "Add / Remove a Marketplace Owner",
        options: [{
            name: "user",
            type: 6,
            description: "User whom you want to make (or remove) a Marketplace Owner",
            required: true
        }, {
            name: "action",
            type: 3,
            description: "You want to make them a Marketplace Owner or remove them from that position",
            required: true,
            choices: [{
                name: "Make A Owner",
                value: "owner"
            }, {
                name: "Remove From Ownership",
                value: "notOwner"
            }]
        }],
    },

    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const guild = await botConfig.findOne({ id: interaction.guild.id }) || await botConfig.create({ id: interaction.guild.id }),
            user = interaction.options.getUser("user"),
            owner = interaction.options.getString("action") === "owner";

        if (!owner && !guild.marketplaceOwners.includes(user.id)) return interaction.editReply({
            embeds: [{
                title: "❌ Mentioned user is not a Marketplace Owner",
                color: "#ff0000"
            }]
        });

        interaction.editReply({
            embeds: [{
                title: `Succesffuly ${owner ? "added" : "removed"} ${user.username} ${owner ? "as" : "from the position of"} marketplace owner`,
                color: "#50C878"
            }]
        })

        if (owner) await botConfig.findOneAndUpdate({ id: interaction.guild.id }, { $push: { marketplaceOwners: user.id } })
        else await botConfig.findOneAndUpdate({ id: interaction.guild.id }, { $pull: { marketplaceOwners: { $in: [user.id] } } })
    }
}
