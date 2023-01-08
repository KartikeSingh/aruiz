const { MessageEmbed } = require("discord.js");
const avatar = require("../../models/avatar");
const guild = require("../../models/guild");
const user = require("../../models/user");
const page = require('discord-pagination-advanced');

module.exports = {
    data: {
        name: "watchlist",
        description: "Manage watchlist system",
        options: [{
            name: "add",
            type: 1,
            description: "Add a user to watchlist",
            options: [{
                name: "user",
                type: 6,
                description: "User who'm you want to add in watchlist",
                required: true,
            }]
        }, {
            name: "remove",
            type: 1,
            description: "remove a user from watchlist",
            options: [{
                name: "user",
                type: 6,
                description: "User who'm you want to remove from watchlist",
                required: true,
            }]
        }, {
            name: "view",
            type: 1,
            description: "View the watchlist",
        }],
    },
    timeout: 3000,

    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const option = interaction.options.getSubcommand(),
            u = interaction.options.getUser("user"),
            guildData = await guild.findOne({ id: interaction.guildId }) || await guild.create({ id: interaction.guildId });

        if (option === "view") {
            if (guildData.watchlist.length === 0) return interaction.editReply({
                embeds: [{
                    color: "RED",
                    title: "❌ Watchlist Empty"
                }]
            });

            const pages = [new MessageEmbed({
                title: "📋 Member Watch List",
                color: "YELLOW",
                description: "",
            })];

            let ind = 0;

            for (let i = 0; i < guildData.watchlist.length; i++) {
                const id = guildData.watchlist[i],
                    data = await user.findOne({ id, guild: process.env.GUILD }) || await user.create({ id, guild: process.env.GUILD }),
                    avData = await avatar.findOne({ id }),
                    member = await interaction.guild.members.fetch(id).catch(e => {
                        return {
                            user: client.users.cache.get(id)
                        }
                    }),
                    string = `**${member.user?.tag}** (\`${member.user?.id || data.id}\`)\n> **Invited By:** ${parseInt(data.invitedBy) ? `<@${data.invitedBy}>` : `\`${data.invitedBy || "Unknown"}\``}\n> **Verified:** \`${avData?.url ? "True" : "False"}\`\n> **Member Level:** \`${data.level}\`\n> **Join Date:** <t:${Math.floor((data.joinedAt || member.joinedTimestamp) / 1000)}>\n> **Last Message:** <t:${Math.floor((data.lastMessage || 0) / 1000)}>\n> **Last Command:** <t:${Math.floor((data.lastCommand || 0) / 1000)}>`;

                if (pages[ind].description.length + string.length > 4000) ind++;

                if (!pages[ind]) pages[ind] = new MessageEmbed({
                    color: "YELLOW",
                    description: "",
                })

                pages[ind].description += `${string}\n\n`;
            }

            if (ind === 0) return interaction.editReply({
                embeds: pages,
            });

            page(interaction, pages);
        } else if (option === "add") {
            if (guildData.watchlist.includes(u.id)) return interaction.editReply({
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
        } else if (option === "remove") {
            if (!guildData.watchlist.includes(u.id)) return interaction.editReply({
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
        }
    }
}