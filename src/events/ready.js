const statsUpdate = require("../utility/statsUpdate");

module.exports = async (client) => {
    console.log(`${client.user.tag} is online!`);

    client.application.commands.set(client.commands.map(v => v.data));

    statsUpdate(client);

    client.oc = client.channels.cache.get(process.env.ORACLE);
}
