module.exports = async (client) => {
    console.log(`${client.user.tag} is online!`);

    client.application.commands.set(client.commands.map(v => v.data)).then(x => x.forEach(c => console.log(`</${c.name}:${c.id}>`)))
}
