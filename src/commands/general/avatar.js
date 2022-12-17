const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

module.exports = {
    data: {
        name: "avatar-create",
        description: "Create a new avatar",
    },
    timeout: 3000,

    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true })

        interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setColor("WHITE")
                    .setTitle("📃 Avatar Model Tutorial")
                    .setImage("https://cdn.discordapp.com/attachments/723104565708324915/1052605263418495087/Group_1769271.png")
                    .setDescription("- Go to [Ready Player Me](https://readyplayer.me/avatar) to create and customize your avatar.\n- Once avatar has been created you will be prompted to claim your avatar.\n- Once Claimed, go to My Avatars > then copy .glb URL and paste here.")
            ],
            components: [
                new MessageActionRow({
                    components: [
                        new MessageButton({
                            customId: "set-" + interaction.user.id,
                            style: "PRIMARY",
                            label: "Upload Avatar"
                        })
                    ]
                })
            ]
        });
    }
}