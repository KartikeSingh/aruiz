const avatar = require("../models/avatar")
const stats = require("../models/stats")
const datax = require("../models/data");
const getFollowers = require("./getFollowers");
const data = require("../models/data");

module.exports = async function statsUpdate(client) {
    let channels = await stats.find(),
        avatars = await avatar.countDocuments(),
        botData = await data.findOne({ id: client.user.id }) || await data.create({ id: client.user.id }),
        whitelisted = 162 + ((await datax.findOne({ id: client.user.id }))?.whitelist?.length || 0),
        count = new Map();

    channels.forEach(async data => {
        const channel = client.channels.cache.get(data.channel),
            memberCount = count.get(data.guild) || (await client.guilds.fetch(data.guild)).approximateMemberCount,
            values = [memberCount, avatars, whitelisted, , await getFollowers(), botData.avatarsCreated];

        count.set(data.guild, memberCount);

        if (channel) channel.setName(client.vNames[data.type].replace("{count}", values[data.type])).catch((e) => { console.log(e) })
    })

    channels = null;

    setTimeout(() => {
        statsUpdate(client)
    }, 10000)
}