const avatar = require("../models/avatar")
const stats = require("../models/stats")
const datax = require("../models/data");
const getFollowers = require("./getFollowers");
const data = require("../models/data");

module.exports = async function statsUpdate(client) {
    let channels = await stats.find(),
        guild = client.guilds.cache.get(process.env.GUILD),
        avatars = await avatar.countDocuments(),
        botData = await data.findOne({ id: client.user.id }) || await data.create({ id: client.user.id }),
        whitelisted = 162 + ((await datax.findOne({ id: client.user.id }))?.whitelist?.length || 0),
        count = new Map(),
        foll = await getFollowers();

    await guild?.members?.fetch().catch(() => null);

    channels.forEach(async data => {
        const channel = client.channels.cache.get(data.channel),
            memberCount = count.get(guild?.id) || (await client.guilds.fetch(guild?.id).catch(() => { return {} })).memberCount || 0,
            values = [memberCount, avatars, whitelisted, foll, botData.avatarsCreated];

        if (!channel) return;

        if ((memberCount !== client.guilds.cache.get(data.guild).members.cache.size)) {
            await client.guilds.cache.get(data.guild).members.fetch();
        }

        values.push(
            guild?.members?.cache?.filter(v => v.roles.cache.has("1056674165110882305"))?.size || 0,
            guild?.members?.cache?.filter(v => v.roles.cache.has("1056335558856687766"))?.size || 0
        );

        count.set(data.guild, memberCount);

        if (channel) channel.setName(client.vNames[data.type].replace("{count}", values[data.type])).catch((e) => { console.log(e) })
    })

    channels = null;

    setTimeout(() => {
        statsUpdate(client)
    }, 10000)
}