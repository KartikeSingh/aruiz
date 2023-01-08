// Imports
const { join } = require('path');
const { readdirSync } = require('fs');

const Discord = require('discord.js');
const guild = require('../models/guild');
const avatar = require('../models/avatar');
const user = require('../models/user');

module.exports = class Client extends Discord.Client {
    owners = ["723049421021118535"];
    oracle = ["1038998321785733161", "1059190655127130164"];

    events = readdirSync(join(__dirname, "../events"));
    categories = readdirSync(join(__dirname, "../commands"));

    invites = new Discord.Collection();
    commands = new Discord.Collection();
    timeouts = new Discord.Collection();

    constructor(options) {
        super(options);

        for (let i = 0; i < this.categories.length; i++) {
            const commands = readdirSync(join(__dirname, `../commands/${this.categories[i]}`)).filter(x => x.endsWith(".js"));

            for (let j = 0; j < commands.length; j++) {
                const command = require(`../commands/${this.categories[i]}/${commands[j]}`);

                if (!command || !command.run || !command.data) continue;

                command.category = this.categories[i]

                this.commands.set(command.data.name, command);
            }
        }

        for (let i = 0; i < this.events.length; i++) {
            const event = require(`../events/${this.events[i]}`);

            if (typeof event !== "function") continue;

            this.on(this.events[i].split(".")[0], (...args) => event(this, ...args));
        }
    }
}