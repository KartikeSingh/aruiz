const statsUpdate = require("../utility/statsUpdate");

module.exports = async (client) => {
    console.log(`${client.user.tag} is online!`);

    client.guilds.cache.forEach(async guild => {
        const vanity = await guild.fetchVanityData().catch(() => { return {}; });
        const invs = await guild.invites.fetch();

        if (vanity.code) client.invites.set(vanity.code, vanity.uses);
        invs.forEach(inv => client.invites.set(inv.code, inv.uses))
    });
    
    client.application.commands.set(client.commands.map(v => v.data));

    statsUpdate(client);

    client.oc = client.channels.cache.get(process.env.ORACLE);

    client.watchlist();

    setInterval(() => {
        client.watchlist();
    }, 1800000)
}
