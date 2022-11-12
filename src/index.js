require('dotenv').config();

// Database Setup
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(() => console.log("Database Connected")).catch((e) => console.log(e))

// Discord Client Setup
const Client = require('./utility/Client');

const client = new Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS"] });

client.login(process.env.TOKEN);

// Web Server Setup
const express = require('express');

const app = express();

app.get('/', (req, res) => res.sendStatus(200));

app.listen(process.env.PORT || 3001, () => console.log(`Web Server Started!`));