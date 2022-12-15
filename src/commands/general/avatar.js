const axios = require("axios");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const avatar = require("../../models/avatar")

module.exports = {
    data: {
        name: "avatar",
        description: "View my avatar",
        options: [ {
            name: "create",
            type: 1,
            description: "Create a new avatar",
        }],
    },
    timeout: 3000,

    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true })

        const option = interaction.options.getSubcommand(),
            user = interaction.user;

        if (option === "set") {
            const model = interaction.options.getString("model");

            if (!model.endsWith(".glb")) return interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor("RED")
                        .setTitle("❌ Invalid Model URL")
                        .setImage("https://cdn.discordapp.com/attachments/723104565708324915/1052605263418495087/Group_1769271.png")
                        .setDescription("Get your avatar model url from [here](https://readyplayer.me/hub/avatars)")
                ]
            });

            interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor("YELLOW")
                        .setTitle("🟡 Loading Avatar")
                ]
            });

            const arr = model.split("/"),
                id = arr[arr.length - 1].split(".")[0],
                gender = await axios.get(`https://api.readyplayer.me/v1/avatars/${id}.json`).then(x => x.data.outfitGender).catch(x => null);

            if (!gender) return interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor("RED")
                        .setTitle("❌ Invalid Model URL")
                        .setImage("https://cdn.discordapp.com/attachments/723104565708324915/1052605263418495087/Group_1769271.png")
                        .setDescription("Get your avatar model url from [here](https://readyplayer.me/hub/avatars)")
                ]
            });

            const img = await axios.post("https://render.readyplayer.me/render", {
                model,
                scene: "fullbody-portrait-v1",
                armature: gender === "feminine" ? "ArmatureTargetFemale" : "ArmatureTargetMale",
            }).then(x => x.data.renders[0]).catch((e) => console.log(e));

            if (!img) return interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor("RED")
                        .setTitle("❌ Invalid Model URL")
                        .setImage("https://cdn.discordapp.com/attachments/723104565708324915/1052605263418495087/Group_1769271.png")
                        .setDescription("Get your avatar model url from [here](https://readyplayer.me/hub/avatars)")
                ]
            });

            await avatar.findOneAndUpdate({ id: interaction.user.id }, { url: img, updatedAt: Date.now() }) || await avatar.create({ id: interaction.user.id, url: img, updatedAt: Date.now() })

            interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor("#FA00ff")
                        .setTitle("New Avatar")
                        .setImage(img)
                ]
            })
        } else if (option === "create") {
            interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor("WHITE")
                        .setTitle("📃 Avatar Model Tutorial")
                        .setImage("https://cdn.discordapp.com/attachments/723104565708324915/1052605263418495087/Group_1769271.png")
                        .setDescription("- Go to [Ready Player Me](https://readyplayer.me/) to create and customize your avatar.\n- Once avatar has been created you will be prompted to claim your avatar.\n- Once Claimed, go to My Avatars > then copy .glb URL and paste here.")
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
}