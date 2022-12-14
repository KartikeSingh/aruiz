require('dotenv').config();

// Database Setup
const mongoose = require('mongoose');
const fetch = require('node-fetch');

mongoose.connect(process.env.MONGO_URI).then(() => console.log("Database Connected")).catch((e) => console.log(e))

// Discord Client Setup
const Client = require('./utility/Client');

const client = new Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS"] });

client.login(process.env.TOKEN);

// Web Server Setup
const { Canvas, loadImage } = require('@napi-rs/canvas')
const user = require('./models/user');
const express = require('express');
const data = require('./models/data');
const axios = require('axios');

const app = express();

app.use(express.json())

app.get('/', (req, res) => res.sendStatus(200));

app.get('/user/:id/info', async (req, res) => {
    const { id } = req.params;

    const userData = await client.users.fetch(id).catch(() => null);

    if (!userData) return res.status(404).send({
        error: true,
        message: "User not found"
    });

    const users = (await user.find({ guild: process.env.GUILD }).lean()).map((v, i) => {
        v.rank = i + 1;
        return v;
    }), data = users.filter(x => x.id === id)[0];

    if (!data) return res.status(404).send({
        error: true,
        message: "User Data not found"
    });

    res.send({
        username: userData.username,
        coins: data.balance,
        rank: data.rank,
        streak: data.dailyStreak,
        avatar: userData.displayAvatarURL({ format: 'png' }),
        score: data.xp || 0
    })
});

app.get('/user/:id/avatar', async (req, res) => {
    const { id } = req.params;

    const userData = await client.users.fetch(id).catch(() => null);

    if (!userData) return res.status(404).send({
        error: true,
        message: "User not found"
    });

    const canvas = new Canvas(512, 512),
        ctx = canvas.getContext('2d');

    try {
        ctx.drawImage(await loadImage(userData.displayAvatarURL({ format: 'png', size: 512 })), 0, 0, 512, 512);
    } catch (e) {
        return res.status(404).send({
            error: true,
            message: "User not found"
        });
    }

    res.type('png')
    res.send(canvas.toBuffer('image/png'))
});

app.post('/user/create', async (req, res) => {
    let { id, score, want, commited } = req.body || {};

    if (typeof id !== "string") return res.status(400).send({
        error: true,
        message: "ID was not provided in request body"
    });

    if (typeof score !== "number") return res.status(400).send({
        error: true,
        message: "Pound score was not provided in request body"
    });

    if (!want) return res.status(400).send({
        error: true,
        message: "wanted was not provided in request body"
    });

    if (!commited) return res.status(400).send({
        error: true,
        message: "commited was not provided in request body"
    });

    try {
        want = JSON.parse(want)
    } catch { }

    try {
        commited = JSON.parse(commited)
    } catch { }

    if (!Array.isArray(want)) return res.status(400).send({
        error: true,
        message: "wanted list was in a invalid JSON format"
    });

    if (!Array.isArray(commited)) return res.status(400).send({
        error: true,
        message: "commited list was in a invalid JSON format"
    });

    const data = await user.findOne({ id, guild: process.env.GUILD });

    if (data) return res.status(400).send({
        error: true,
        message: "User already exist in database"
    });

    await user.create({
        id,
        guild: process.env.GUILD,
        commitedTo: commited,
        wantTo: want,
        xp: score
    });

    res.send({
        message: "User created",
    })
});

// Discord Login
app.get('/login/discord', async (req, res) => {
    if (!client.user) return res.send("Bot is loading, try again later!")

    const { code } = req.query;

    if (!code) return res.redirect(`https://discord.com/oauth2/authorize?client_id=${client.user.id}&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}&response_type=code&scope=identify%20email`);

    const response = await (await fetch(`https://discord.com/api/oauth2/token?grant_type=authorization_code&client_id=${client.user.id}&client_secret=${process.env.CLIENT_SECRET}&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}&code=${code}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `grant_type=authorization_code&client_id=${client.user.id}&client_secret=${process.env.CLIENT_SECRET}&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}&code=${code}`
    })).json();

    console.log(response)

    if (response.error) return res.send(response);

    const _data = await (await fetch(`https://discord.com/api/v10/users/@me`, {
        headers: {
            Authorization: `Bearer ${response.access_token}`
        }
    })).json();

    console.log(_data)

    const { email } = _data;

    if (!email) return res.send("Error: You didn't gave us access to check your email");

    const botData = await data.findOne({ id: client.user.id }) || await data.create({ id: client.user.id });

    if (botData.whitelist.includes(email)) res.send(`Error: You are already whitelisted. (email: ${email})`);
    else {
        await data.findOneAndUpdate({ id: client.user.id }, { $push: { whitelist: email } });

        res.send(`You are whitelisted successfully. (email: ${email})`);
    }
});

app.get('/emails', async (req, res) => {
    const botData = await data.findOne({ id: client.user.id }) || await data.create({ id: client.user.id });

    res.send(botData.whitelist)
})

app.listen(process.env.PORT || 3001, () => console.log(`Web Server Started!`));