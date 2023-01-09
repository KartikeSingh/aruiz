const { Message } = require('discord.js');
const guildConfigs = require('../models/guild');
const users = require('../models/user');
const getResponse = require('../utility/getResponse');
const banned = ["promotion", "sponsorship", "partnership", "ticket", "chatter", "dm"].map(v => v.trim().toLowerCase());

/**
 * 
 * @param {*} client 
 * @param {Message} message 
 * @returns 
 */
module.exports = async (client, message) => {
    const data = await guildConfigs.findOne({ id: message.guild.id }) || {},
        text = message.content.toLowerCase();

    if (banned.some(v => text.includes(v)) && !message.member.permissions.has("MANAGE_GUILD") && !message.member.permissions.has("MANAGE_MESSAGES")) {
        message.author.send({
            embeds: [{
                color: "RED",
                title: "Soliciting is not allowed in The Compound"
            }]
        });

        return await message.delete().catch(() => null);
    }

    if (message.channel.id === process.env.CHAT_CHANNEL && !message.author.bot) {
        const response = await getResponse(message.content, message.author.id);

        if (response) message.reply(response.trim());
    }

    if (!data.xp || data?.ignoreXP?.includes(message.channel.id) || message.author.bot) return;

    const userData = await users.findOne({ user: message.author.id, guild: message.guild.id }) || await users.create({ user: message.author.id, guild: message.guild.id });

    await users.findOneAndUpdate({ user: message.author.id, guild: message.guild.id }, { lastMessage: Date.now() });

    if (userData.lastXP + (data.xpTimeout || 1000) > Date.now()) return;
    let xp = Math.floor(((Math.random() * (data.xpLimit.up - data.xpLimit.down)) + data.xpLimit.down) * data.xpRate),
        reqXP = 100;

    userData.xp += xp;

    for (let i = 1; i <= userData.level; i++)reqXP += 5 * (i ^ 2) + (50 * i) + 100;

    if (userData.xp >= reqXP) {
        userData.level += 1;
        data.levelReward = data.levelReward || {};

        const r = data.levelReward[userData.level], role = message.guild.roles.cache.get(r),
            channel = message.guild.channels.cache.get(data.xpLevelUp.channel) || message.channel;

        if (r !== undefined) {
            message.member.roles.add(role, `Level reward for reaching ${userData.level} level`).then(() => {
                reply(data.levelRewardMessage.success, channel, message, userData, data, role)
            }).catch(() => {
                reply(data.levelRewardMessage.fail, channel, message, userData, data, role);
            })
        } else {
            reply(data.xpLevelUp.message, channel, message, userData, data);
        }
    }

    await users.findOneAndUpdate({ user: message.author.id, guild: message.guild.id }, {
        xp: userData.xp,
        level: userData.level,
        lastXP: Date.now()
    });
}

function reply(content, channel, message, userData, data, role) {
    if (!data.xpLevelUp.enable) return;

    channel.send({ content: content.replace(/{mention}/g, message.author.toString()).replace(/{level}/, userData.level).replace(/{xp}/, userData.xp).replace(/{role}/, role?.name) });
}