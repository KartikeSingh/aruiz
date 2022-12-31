const axios = require("axios");
const { Modal, TextInputComponent, MessageActionRow, MessageEmbed, MessageButton, MessageAttachment } = require('discord.js');
const avatar = require("../models/avatar");
const botData = require("../models/data");
const users = require("../models/user");
const createAvatar = require("../utility/createAvatar");

const timeout = new Map();

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
            scene: "fullbody-posture-v1-transparent",
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

        await botData.findOneAndUpdate({ id: client.user.id }, { $inc: { avatarsCreated: 1 } }) || await botData.create({ id: client.user.id, avatarsCreated: 1 });

        const old = await avatar.findOne({ id: interaction.user.id });
        const av = await avatar.findOneAndUpdate({ id: interaction.user.id }, { url: img, updatedAt: Date.now() }, { new: true }) || await avatar.create({ id: interaction.user.id, url: img, updatedAt: Date.now() })

        const user = interaction.user,
            datas = (await users.find({ guild: interaction.guild.id }).sort({ xp: -1 }).lean()).map((v, i) => {
                v.rank = i + 1;

                return v;
            }),
            data = datas.filter(v => v.id === user.id)[0] || await users.create({ id: interaction.user.id, guild: interaction.guild.id });

        user.roles = interaction.guild.members.cache.get(interaction.user.id)?.roles;
        data.avatar = user.displayAvatarURL({ dynamic: false });
        data.requiredXp = 100;
        data.rank = data.rank || datas.length;

        for (let i = 1; i <= data.level; i++)data.requiredXp += 5 * (i ^ 2) + (50 * i) + 100;
        interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setColor("#FA00ff")
                    .setImage("attachment://avatar.png")
            ],
            files: [new MessageAttachment(await createAvatar(user, av, data), "avatar.png")]
        });

        client.channels.cache.get(client.oracle)?.send({
            embeds: [{
                description: `${interaction.user.toString()} ${(!old || !old?.url) ? "created their very first avatar!" : "updated their avatar!"}`,
                image: {
                    url: img
                }
            }]
        })
    } else if (type === "flex") {
        if (timeout.get(interaction.user.id) > Date.now()) return interaction.reply({
            embeds: [{
                color: "RED",
                title: "⏰ Timeout",
                description: `You can flex your avatar again <t:${Math.floor(timeout.get(interaction.user.id) / 1000)}:R>`
            }],
            ephemeral: true
        });

        timeout.set(interaction.user.id, Date.now() + 600000)

        await interaction.deferReply({ ephemeral: true });

        const user = interaction.user,
            av = await avatar.findOne({ id: user.id }),
            datas = (await users.find({ guild: interaction.guild.id }).sort({ xp: -1 }).lean()).map((v, i) => {
                v.rank = i + 1;

                return v;
            }),
            data = datas.filter(v => v.id === user.id)[0] || await users.create({ id: interaction.user.id, guild: interaction.guild.id });

        user.roles = interaction.guild.members.cache.get(interaction.user.id)?.roles;
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

        if (user.claimWorkAt > Date.now()) return interaction.editReply({
            embeds: [{
                color: "RED",
                title: "⏰ Timeout",
                description: `You have to claim your paycheck <t:${Math.floor(user.claimWorkAt / 1000)}:R>, by clicking **paycheck** button`
            }]
        });
        else if (user.claimWorkAt !== 0 && user.claimWorkAt < Date.now()) return interaction.editReply({
            embeds: [{
                color: "RED",
                title: "⏰ Timeout",
                description: `Claim your paycheck via \`Paycheck\` button`
            }]
        });

        interaction.editReply({
            embeds: [{
                color: "RANDOM",
                title: "⚒️ Select Work Hour ",
                description: `${interaction.user.toString()}, , thank you for showing up to work today. working in The Compound consists of talking on chat. How many hours will you work today?`
            }],
            components: [
                new MessageActionRow({
                    components: [1, 2, 3, 4].map(hour => new MessageButton({
                        customId: 'chooseHours-' + hour,
                        label: `${hour} hour`,
                        style: "PRIMARY",
                    }))
                })
            ], fetchReply: true
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

        const max = 52, min = 152, reward = Math.floor(Math.random() * (max - min) + min) + (5 * user.dailyStreak);

        const newData = await users.findOneAndUpdate({ id: interaction.user.id, guild: interaction.guild.id }, { $inc: { balance: reward }, "timeouts.daily": Date.now() + 24 * 3600000, dailyStreak: Date.now() - user.timeouts.daily > 32 * 3600000 ? 0 : user.dailyStreak + 1 }, { new: true });

        interaction.editReply({
            embeds: [{
                color: "RANDOM",
                title: "💰 Daily Reward Claimed",
                description: `${interaction.user.toString()} here is your daily bonus. You earned \`${reward}\` LB Coins`
            }]
        });

        client.oc?.send({
            embeds: [{
                color: "RANDOM",
                title: `💰 ${interaction.user.username} Claimed Daily Reward`,
                description: `They recived \`${reward}\` 🪙 and now they have a streak of **${newData.dailyStreak}** 🔥`
            }]
        }).catch(() => { })
    } else if (type === "chooseHours") {
        interaction.update({
            embeds: [{
                color: "GREEN",
                title: `Thank you, Come back in ${id} hours to claim your paycheck`
            }],
            components: []
        });

        await users.findOneAndUpdate({ id: interaction.user.id, guild: interaction.guild.id }, { claimWorkAt: Date.now() + parseInt(id) * 3600000, workHour: parseInt(id) }, { new: true });
    } else if (type === "paycheck") {
        await interaction.deferReply({ ephemeral: true });

        const datas = (await users.find({ guild: interaction.guild.id }).sort({ xp: -1 }).lean()).map((v, i) => {
            v.rank = i + 1;

            return v;
        }), user = datas.filter(v => v.id === interaction.user.id)[0] || await users.create({ id: interaction.user.id, guild: interaction.guild.id });

        user.rank = user.rank || datas.length;

        if (!user.claimWorkAt) return interaction.editReply({
            embeds: [{
                color: "RED",
                title: "⏰ Not Working",
                description: `Click on \`work\` button to work before claiming a pay check`
            }]
        });

        if (Date.now() < user.claimWorkAt) return interaction.editReply({
            embeds: [{
                color: "RED",
                title: "⏰ Not Enough",
                description: `You can claim your paycheck <t:${Math.floor(user.claimWorkAt / 1000)}:R>`
            }]
        });

        const min = 92, max = 302, p = 1 - user.rank / datas.length;

        const rawReward = Math.round(max * p),
            reward = (rawReward < min ? min : rawReward) * user.workHour;
        const newData = await users.findOneAndUpdate({ id: interaction.user.id, guild: interaction.guild.id }, { claimWorkAt: 0, workHour: 0, $inc: { balance: reward } }, { new: true });

        interaction.editReply({
            embeds: [{
                color: "RANDOM",
                title: "💰 Paycheck Claimed",
                description: `${interaction.user.toString()}, here is your paycheck for your last work. You earned **${reward}** LB Coins`
            }]
        });

        client.oc?.send({
            embeds: [{
                color: "RANDOM",
                title: `⚒️ ${interaction.user.username} Worked Successfully`,
                description: `Claimed their paycheck of \`${reward}\` LB Coins!`
            }]
        }).catch(() => { })
    }
}
