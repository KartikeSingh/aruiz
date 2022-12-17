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
                    color: "WHITE",
                    description: "**📃 __Avatar Model Tutorial__**\n- Go to [Ready Player Me](https://readyplayer.me/avatar) to create and customize your avatar.\n- Once avatar has been created you will be prompted to claim your avatar.\n- Once Claimed, go to My Avatars > then copy .glb URL and paste here.",
                    image: {
                        url: "https://cdn.discordapp.com/attachments/723104565708324915/1052605263418495087/Group_1769271.png"
                    }
                }, {
                    color: "WHITE",
                    image: {
                        url: "https://media.discordapp.net/attachments/1052077851068878888/1053370126667354162/Screen_Shot_2022-12-15_at_9.34.11_AM.png?width=1166&height=665"
                    },
                    description:"**🔥 __Flex Your Avatar__**\nClick on the \`Flex Avatar\` button below to flex your avatar in <#1052968945533059202>"
                }],
                components: [new MessageActionRow({
                    components: [
                        new MessageButton({
                            customId: "set",
                            style: "PRIMARY",
                            label: "Set Avatar",
                            emoji:"⚙️"
                        }),
                        new MessageButton({
                            style: "SUCCESS",
                            customId: 'flex',
                            label: "Flex Avatar",
                            emoji:"🔥"
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