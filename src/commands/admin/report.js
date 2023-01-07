const avatar = require("../../models/avatar");
const guild = require("../../models/guild");
const user = require("../../models/user");

module.exports = {
    data: {
        name: "report",
        description: "Manage report syste,",
        options: [{
            name: "view",
            type: 1,
            description: "View a user's report",
            options: [{
                name: "user",
                type: 6,
                description: "User who's report you want to view",
                required: true,
            }]
        }, {
            name: "watchlist-add",
            type: 1,
            description: "Add a user to watchlist",
            options: [{
                name: "user",
                type: 6,
                description: "User who'm you want to add in watchlist",
                required: true,
            }]
        }, {
            name: "watchlist-remove",
            type: 1,
            description: "remove a user from watchlist",
            options: [{
                name: "user",
                type: 6,
                description: "User who'm you want to remove from watchlist",
                required: true,
            }]
        }, {
            name: "watchlist-channel",
            type: 1,
            description: "Set the watchlist log channel",
            options: [{
                name: "channel",
                type: 7,
                description: "Channel to send the logs in!",
                required: true,
            }]
        }],
    },
    timeout: 3000,

    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const option = interaction.options.getSubcommand(),
            u = interaction.options.getUser("user"),
            channel = interaction.options.getChannel("channel");

        if (option === "view") {
            const data = await user.findOne({ id: u.id }) || await user.create({ id: u.id }),
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
        } else if (option === "watchlist-add") {
            const data = await guild.findOne({ id: interaction.guildId }) || await guild.create({ id: interaction.guildId });

            if (data.watchlist.includes(u.id)) return interaction.editReply({
                embeds: [{
                    color: "RED",
                    title: "❌ User Aready Added"
                }]
            });

            await guild.findOneAndUpdate({ id: interaction.guildId }, { $push: { watchlist: u.id } });

            interaction.editReply({
                embeds: [{
                    color: "GREEN",
                    title: "✅ User Added Successfully"
                }]
            })
        } else if (option === "watchlist-remove") {
            const data = await guild.findOne({ id: interaction.guildId }) || await guild.create({ id: interaction.guildId });

            if (!data.watchlist.includes(u.id)) return interaction.editReply({
                embeds: [{
                    color: "RED",
                    title: "❌ User Not Added"
                }]
            });

            await guild.findOneAndUpdate({ id: interaction.guildId }, { $pull: { watchlist: u.id } });

            interaction.editReply({
                embeds: [{
                    color: "GREEN",
                    title: "✅ User Removed Successfully"
                }]
            })
        } else if (option === "watchlist-channel") {
            const data = await guild.findOne({ id: interaction.guildId }) || await guild.create({ id: interaction.guildId });

            if (data.watchlistChannel === channel.id) return interaction.editReply({
                embeds: [{
                    color: "RED",
                    title: "❌ Channel Already Selected"
                }]
            });

            await guild.findOneAndUpdate({ id: interaction.guildId }, { watchlistChannel: channel.id });

            interaction.editReply({
                embeds: [{
                    color: "GREEN",
                    title: "✅ Channel Selected"
                }]
            });
        }
    }
}