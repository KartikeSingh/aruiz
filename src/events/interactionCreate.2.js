const axios = require("axios");
const { Modal, TextInputComponent, MessageActionRow, MessageEmbed, MessageButton, MessageAttachment } = require('discord.js');
const avatar = require("../models/avatar");
const users = require("../models/user");
const createAvatar = require("../utility/createAvatar");

const roles = ["1032705263154765824", "1032705446420684850", "1032705920637087804", "1032682130280550411", "1032706161721491516"].map((v, i) => {
    return {
        index: i,
        v
    }
});
const name = ["LV. 5", "LV. 4", "LV. 3", "LV. 2", "LV. 1"];

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

        const ind = roles.filter(v => interaction.member.roles.cache.has(v.v))[0]?.index,
            level = name[ind] || "\u200b",
            data = await users.findOne({ id: interaction.user.id, guild: interaction.guild.id });

        interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setColor("#FA00ff")
                    .setImage(img)
                    .setTitle(`${interaction.user.username}`)
                    .setURL(img)
                    .setDescription(`${level}\n**Pound Score: \`${data?.xp}\`** `)

            ]
        });

        client.channels.cache.get(client.oracle)?.send({
            embeds: [{
                description: `${interaction.user.toString()} just updated their avatar`,
                image: {
                    url: img
                }
            }]
        })
    } else if (type === "flex") {
        await interaction.deferReply({ ephemeral: true });

        const user = interaction.user,
            av = await avatar.findOne({ id: user.id }),
            datas = (await users.find({ guild: interaction.guild.id }).sort({ xp: -1 }).lean()).map((v, i) => {
                v.rank = i + 1;

                return v;
            }),
            data = datas.filter(v => v.id === user.id)[0] || await users.create({ id: interaction.user.id, guild: interaction.guild.id });

        data.avatar = user.displayAvatarURL({ dynamic: false });
        data.requiredXp = 100;
        data.rank = data.rank || datas.length;

        for (let i = 1; i <= data.level; i++)data.requiredXp += 5 * (i ^ 2) + (50 * i) + 100;

        if (!av?.url) return interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setColor("RED")
                    .setTitle("❌ No Avatar Setted")
                    .setDescription("Create your avatar in <#1052988278321717309>")
            ]
        });

        interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setColor("#3ba55b")
                    .setTitle(`✅ Avatar Flexed Successfully`)

            ]
        });

        interaction.guild.channels.cache.get("1052968945533059202")?.send({
            embeds: [
                new MessageEmbed()
                    .setColor("#5b63f3")
                    .setImage("attachment://avatar.png")
            ],
            components: [new MessageActionRow({
                components: [
                    new MessageButton({
                        style: "PRIMARY",
                        customId: 'flex',
                        label: "Click to flex your avatar",
                    })
                ]
            })],
            files: [new MessageAttachment(await createAvatar(user, av, data), "avatar.png")]
        });

        client.channels.cache.get(client.oracle)?.send({
            embeds: [{
                description: `${interaction.user.toString()} just flexed their avatar in <#1052968945533059202>`,
            }]
        })
    } else if (type === "coins") {
        await interaction.deferReply({ ephemeral: true });

        const guildData = await users.findOne({ guild: interaction.guildId, id: interaction.user.id }) || await users.create({ guild: interaction.guildId, id: interaction.user.id, name: interaction.member.displayName });

        interaction.editReply({
            embeds: [{
                color: "RANDOM",
                title: `🎭 ${interaction.user.username}'s Balance`,
                description: (guildData.balance || 0) + " Points"
            }]
        });
    } else if (type === "work") {
        await interaction.deferReply({ ephemeral: true });

        const user = await users.findOne({ id: interaction.user.id, guild: interaction.guild.id }) || await users.create({ id: interaction.user.id, guild: interaction.guild.id });

        if (user.timeouts.work > Date.now()) return interaction.editReply({
            embeds: [{
                color: "RED",
                title: "⏰ Timeout",
                description: `You can work again <t:${Math.floor(user.timeouts.work / 1000)}:R>`
            }]
        });

        const max = 100, min = 20, reward = Math.floor(Math.random() * (max - min) + min);

        const newData = await users.findOneAndUpdate({ id: interaction.user.id, guild: interaction.guild.id }, { $inc: { balance: reward }, "timeouts.work": Date.now() + 3600000 }, { new: true });

        interaction.editReply({
            embeds: [{
                color: "RANDOM",
                title: "⚒️ Worked Successfully",
                description: `You earned \`${reward}\` 🪙, you can work again <t:${Math.floor(newData.timeouts.work / 1000)}:R>`
            }]
        });
    } else if (type === "daily") {
        await interaction.deferReply({ ephemeral: true });

        const user = await users.findOne({ id: interaction.user.id, guild: interaction.guild.id }) || await users.create({ id: interaction.user.id, guild: interaction.guild.id });

        if (user.timeouts.daily > Date.now()) return interaction.editReply({
            embeds: [{
                color: "RED",
                title: "⏰ Timeout",
                description: `You can claim daily reward again <t:${Math.floor(user.timeouts.daily / 1000)}:R>`
            }]
        });

        const max = 300, min = 200, reward = Math.floor(Math.random() * (max - min) + min) + (5 * user.dailyStreak);

        const newData = await users.findOneAndUpdate({ id: interaction.user.id, guild: interaction.guild.id }, { $inc: { balance: reward }, "timeouts.daily": Date.now() + 24 * 3600000, dailyStreak: Date.now() - user.timeouts.daily > 32 * 3600000 ? 0 : user.dailyStreak + 1 }, { new: true });

        interaction.editReply({
            embeds: [{
                color: "RANDOM",
                title: "💰 Daily Reward Claimed",
                description: `You earned \`${reward}\` 🪙 and now you have a streak of **${newData.dailyStreak}** 🔥, you can claim your daily again <t:${Math.floor(newData.timeouts.daily / 1000)}:R>`
            }]
        });
    }
}
