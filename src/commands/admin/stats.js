const { MessageEmbed } = require("discord.js");
const avatar = require("../../models/avatar");
const datax = require("../../models/data");
const stats = require("../../models/stats");

module.exports = {
    data: {
        name: "stats",
        description: "Manage the stats in the server",
        options: [{
            name: "list",
            type: 1,
            description: "Get a list of all stats voice channel",
        }, {
            name: "add",
            type: 1,
            description: "Add a new stats channel",
            options: [{
                name: "channel",
                type: 7,
                description: "The channel to set as a stat channel",
                required: true,
                channel_types: [2]
            }, {
                name: "type",
                type: 4,
                description: "The type of stats channel",
                required: true,
                choices: [{
                    name: "members",
                    value: 0
                }, {
                    name: "avatars",
                    value: 1
                }, {
                    name: "whitelist",
                    value: 2
                }]
            }]
        }, {
            name: "remove",
            type: 1,
            description: "Remove a stats channel",
            options: [{
                name: "channel",
                type: 7,
                description: "The channel to remove from a stat channel",
                required: true,
                channel_types: [2]
            }]
        }],
    },
    timeout: 3000,

    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const option = interaction.options.getSubcommand(),
            channel = interaction.options.getChannel("channel"),
            type = interaction.options.getInteger("type"),
            data = await stats.find({ guild: interaction.guildId });

        if (option === "list") {
            if (data.length === 0) return interaction.editReply({
                embeds: [{
                    title: "❌ No Stat Channels",
                    color: "RED"
                }]
            });

            interaction.editReply({
                embeds: [{
                    title: "📜 Stat Channels",
                    description: data.map((v, i) => `\`${i + 1}.\` <#${v.channel}>`).join("\n")
                }]
            });
        } else if (option === "add") {
            const count = [(await interaction.guild.fetch())?.approximateMemberCount, await avatar.countDocuments({}), 162 + ((await datax.findOne({ id: client.user.id }))?.whitelist?.length || 0)]

            channel.setName(client.vNames[type].replace("{count}", count[type]))
                .then(async () => {
                    await stats.create({
                        guild: interaction.guildId,
                        channel: channel.id,
                        type
                    });

                    interaction.editReply({
                        embeds: [
                            new MessageEmbed()
                                .setColor("GREEN")
                                .setTitle("✅ Stats Channel Setted")
                        ]
                    })
                })
                .catch( () => {
                    interaction.editReply({
                        embeds: [
                            new MessageEmbed()
                                .setColor("RED")
                                .setTitle("❌ Stats Channel Creation Failed")
                        ]
                    })
                })
        }else if (option === "remove") {
            if(!data.some(v => v.channel === channel.id))return interaction.editReply({
                embeds: [{
                    title: "❌ Not A Stats Channel",
                    color: "RED"
                }]
            });

            channel.delete()
                .then(async () => {
                    await stats.findOneAndDelete({
                        guild: interaction.guildId,
                        channel: channel.id,
                    });

                    interaction.editReply({
                        embeds: [
                            new MessageEmbed()
                                .setColor("GREEN")
                                .setTitle("✅ Stats Channel Deleted")
                        ]
                    })
                })
                .catch( () => {
                    interaction.editReply({
                        embeds: [
                            new MessageEmbed()
                                .setColor("RED")
                                .setTitle("❌ Stats Channel Deletion Failed")
                        ]
                    })
                })
        }
    }
}