const avatar = require("../../models/avatar");
const user = require("../../models/user");

module.exports = {
    data: {
        name: "member-report",
        description: "View a user's report",
        options: [{
            name: "user",
            type: 6,
            description: "User who'm you want to remove from watchlist",
            required: true,
        }],
    },
    timeout: 3000,

    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const
            u = interaction.options.getUser("user"),
            data = await user.findOne({ id: u.id }) || await user.create({ id: u.id }),
            avData = await avatar.findOne({ id: u.id }),
            member = interaction.guild.members.cache.get(u.id);

        interaction.editReply({
            embeds: [{
                author: {
                    iconURL: member.user.displayAvatarURL(),
                    name: member.user.tag
                },
                title: "📋 Member Report",
                color: "YELLOW",
                fields: [{
                    name: "Join Date",
                    value: `<t:${Math.floor((data.joinedAt || member.joinedTimestamp) / 1000)}>`,
                    inline: true,
                }, {
                    name: "Invited By",
                    value: data.invitedBy ? `<@${data.invitedBy}>` : "Unknown",
                    inline: true,
                }, {
                    name: "Verified",
                    value: avData?.url ? "True" : "False",
                    inline: true,
                }, {
                    name: "Member Level",
                    value: `${data.level}`,
                    inline: true
                }, {
                    name: "Last Message",
                    value: `<t:${Math.floor((data.lastMessage || 0) / 1000)}>`,
                    inline: true
                }, {
                    name: "Last Command",
                    value: `<t:${Math.floor((data.lastCommand || 0) / 1000)}>`,
                    inline: true
                }]
            }]
        })

    }
}