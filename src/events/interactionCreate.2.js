const axios = require("axios");
const { Modal, TextInputComponent, MessageActionRow, MessageEmbed } = require('discord.js');
const avatar = require("../models/avatar");

module.exports = async (client, interaction) => {
    if (!interaction.customId) return;

    const [type, id, index] = interaction.customId.split("-");

    if (type === "set") {
        await interaction.showModal(new Modal({
            customId: "setSubmit",
            title: "Avatar Setup",
            components: [
                new MessageActionRow({
                    components: [new TextInputComponent({
                        customId: "model",
                        label: "Model URL",
                        placeholder: "model .gbl url",
                        required: true,
                        style: "SHORT"
                    })]
                })
            ]
        }))
    } else if (type === "setSubmit") {
        await interaction.deferReply({ ephemeral: true })

        const model = interaction.fields.getTextInputValue("model");

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
    }
}