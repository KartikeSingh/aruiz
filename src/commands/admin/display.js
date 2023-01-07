const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
    data: {
        name: "display",
        description: "Display a bot embed",
        options: [{
            name: "avatar",
            type: 1,
            description: "Display the avatar embed",
            options: [{
                name: "channel",
                type: 7,
                description: "The channel to send the embed in",
            }]
        }, {
            name: "economy",
            type: 1,
            description: "Display the economy embed",
            options: [{
                name: "channel",
                type: 7,
                description: "The channel to send the embed in",
            }]
        }, {
            name: "profile",
            type: 1,
            description: "Display the profile embed",
            options: [{
                name: "channel",
                type: 7,
                description: "The channel to send the embed in",
            }]
        }],
    },
    timeout: 3000,

    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true })

        const option = interaction.options.getSubcommand(),
            channel = interaction.options.getChannel("channel") || interaction.channel;

        if (option === "avatar") {
            channel.send({
                embeds: [{
                    color: "#3ba55b",
                    title: "Create Your Ready Player Me Avatar",
                    description: "- Go to [Ready Player Me](https://readyplayer.me/avatar) to create and customize your avatar.\n- Once avatar has been created you will be prompted to claim your avatar.\n- Once Claimed, go to My Avatars > then copy .glb URL > click set avatar.",
                }, {
                    color: "#3ba55b",
                    image: {
                        url: "https://cdn.discordapp.com/attachments/723104565708324915/1052605263418495087/Group_1769271.png"
                    }
                }],
                components: [new MessageActionRow({
                    components: [
                        new MessageButton({
                            customId: "set-c",
                            style: "PRIMARY",
                            label: "Create Avatar",
                        }),
                        new MessageButton({
                            customId: "set-u",
                            style: "PRIMARY",
                            label: "Update Avatar",
                        })
                    ]
                })]
            })
                .then((msg) => {
                    interaction.editReply({
                        embeds: [{
                            color: "GREEN",
                            title: "✅ Avatar Embed Sent",
                            description: `[Click me](${msg.url}) to jump to the avatar embed message in ${channel.toString()}`
                        }]
                    });
                })
                .catch((e) => {
                    console.log(e)
                    interaction.editReply({
                        embeds: [{
                            color: "RED",
                            title: "❌ Invalid Channel",
                            description: `Unable to send a message in ${channel.toString()}`
                        }]
                    });
                })
        } else if (option === "economy") {
            channel.send({
                embeds: [{
                    color: "#3ba55b",
                    title: "Interact With Oracle",
                    description: "Use the buttons below to interact with Oracle!",
                }],
                components: [new MessageActionRow({
                    components: [
                        new MessageButton({
                            customId: "work",
                            style: "PRIMARY",
                            label: "Work for LB Coins",
                        }),
                        new MessageButton({
                            customId: "paycheck",
                            style: "PRIMARY",
                            label: "Claim Paycheck",
                        }),
                        new MessageButton({
                            customId: "daily",
                            style: "PRIMARY",
                            label: "Claim Daily Bonus",
                        })
                    ]
                })]
            })
                .then((msg) => {
                    interaction.editReply({
                        embeds: [{
                            color: "GREEN",
                            title: "✅ Economy Embed Sent",
                            description: `[Click me](${msg.url}) to jump to the economy embed message in ${channel.toString()}`
                        }]
                    });
                })
                .catch((e) => {
                    console.log(e)
                    interaction.editReply({
                        embeds: [{
                            color: "RED",
                            title: "❌ Invalid Channel",
                            description: `Unable to send a message in ${channel.toString()}`
                        }]
                    });
                })
        } else if (option === "profile") {
            channel.send({
                embeds: [{
                    color: "#3ba55b",
                    title: "Oracle Profile Section",
                    description: "Use the buttons below to interact with Oracle!",
                }],
                components: [new MessageActionRow({
                    components: [
                        new MessageButton({
                            customId: "coins",
                            style: "PRIMARY",
                            label: "Check Balance",
                        }),
                        new MessageButton({
                            customId: "viewAssets",
                            style: "PRIMARY",
                            label: "My Assets",
                        }),
                        new MessageButton({
                            customId: "verifyWallet",
                            style: "PRIMARY",
                            label: "Verify Wallet",
                        })
                    ]
                })]
            })
                .then((msg) => {
                    interaction.editReply({
                        embeds: [{
                            color: "GREEN",
                            title: "✅ Profile Embed Sent",
                            description: `[Click me](${msg.url}) to jump to the profile embed message in ${channel.toString()}`
                        }]
                    });
                })
                .catch((e) => {
                    console.log(e)
                    interaction.editReply({
                        embeds: [{
                            color: "RED",
                            title: "❌ Invalid Channel",
                            description: `Unable to send a message in ${channel.toString()}`
                        }]
                    });
                })
        }
    }
}