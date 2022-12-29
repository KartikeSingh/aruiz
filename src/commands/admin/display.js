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
        },{
            name: "economy",
            type: 1,
            description: "Display the economy embed",
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
                                customId: "set",
                                style: "SUCCESS",
                                label: "Set Avatar",
                            })
                        ]
                    })]
                })
                    .then((msg) => {
                        interaction.editReply({
                            embeds: [{
                                color: "GREEN",
                                title: "✅ Game Embed Sent",
                                description: `[Click me](${msg.url}) to jump to the game embed message in ${channel.toString()}`
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
            }else if (option === "economy") {
                channel.send({
                    embeds: [{
                        color: "#3ba55b",
                        title: "Interact With Oracle",
                        description: "Use the buttons below to interact with Oracle!",
                    }, {
                        color: "#3ba55b",
                        image: {
                            url: "https://media.discordapp.net/attachments/1052077851068878888/1053372707263238314/Screen_Shot_2022-12-16_at_10.06.09_AM.png"
                        }
                    }],
                    components: [new MessageActionRow({
                        components: [
                            new MessageButton({
                                customId: "coins",
                                style: "SUCCESS",
                                label: "My Balance",
                            }),
                            new MessageButton({
                                customId: "work",
                                style: "SUCCESS",
                                label: "Work",
                            }),
                            new MessageButton({
                                customId: "paycheck",
                                style: "SUCCESS",
                                label: "Paycheck",
                            }), 
                            new MessageButton({
                                customId: "daily",
                                style: "SUCCESS",
                                label: "Claim",
                            })
                        ]
                    })]
                })
                    .then((msg) => {
                        interaction.editReply({
                            embeds: [{
                                color: "GREEN",
                                title: "✅ Game Embed Sent",
                                description: `[Click me](${msg.url}) to jump to the game embed message in ${channel.toString()}`
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