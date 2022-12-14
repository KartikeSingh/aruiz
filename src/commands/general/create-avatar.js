const axios = require("axios");
const { MessageEmbed } = require("discord.js");
const avatar = require("../../models/avatar");

module.exports = {
    data: {
        name: "create-avatar",
        description: "Create or edit your own avatar",
        options: [{
            name: "model",
            type: 3,
            description: "The model url (ends with .glb)",
            required: true,
        }],
    },
    timeout: 3000,

    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const model = interaction.options.getString("model");

        if (!model.endsWith(".glb")) return interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setColor("RED")
                    .setTitle("❌ Invalid Model URL")
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
                    .setDescription("Get your avatar model url from [here](https://readyplayer.me/hub/avatars)")
            ]
        });

        await avatar.findOneAndUpdate({ id: interaction.user.id }, { url: img }) || await avatar.create({ id: interaction.user.id, url: img })

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