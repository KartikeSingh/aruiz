require('dotenv').config();

// Database Setup
const mongoose = require('mongoose');
const fetch = require('node-fetch');

mongoose.connect(process.env.MONGO_URI).then(() => console.log("Database Connected")).catch((e) => console.log(e))

// Discord Client Setup
const Client = require('./utility/Client');

const client = new Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS", "GUILD_MEMBERS"] });

client.login(process.env.TOKEN);

// Web Server Setup
const { Canvas, loadImage } = require('@napi-rs/canvas')
const user = require('./models/user');
const express = require('express');
const data = require('./models/data');
const avatar = require('./models/avatar');
const poundHistory = require('./models/poundHistory');
const getPoints = require('./utility/getPoints');

const app = express();

app.use(express.json())

app.get('/', (req, res) => res.sendStatus(200));

app.get('/user/:id/info', async (req, res) => {
    const auth = req.headers.authorization;

    if (auth !== process.env.API_KEY) return res.status(403).send({
        error: true,
        message: "Invalid API key"
    });

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

    const avatarData = await avatar.findOne({ id: data.id });

    res.send({
        username: userData.username,
        coins: data.balance,
        rank: data.rank,
        streak: data.dailyStreak,
        avatar: avatarData?.url || userData.displayAvatarURL({ format: 'png' }),
        score: data.xp || 0
    })
});

app.get('/user/:id/avatar', async (req, res) => {
    const auth = req.headers.authorization;

    if (auth !== process.env.API_KEY) return res.status(403).send({
        error: true,
        message: "Invalid API key"
    });

    const { id } = req.params;

    const userData = await client.users.fetch(id).catch(() => null);

    if (!userData) return res.status(404).send({
        error: true,
        message: "User not found"
    });

    const avatarData = await avatar.findOne({ id: userData.id });

    if (!avatarData) return res.status(404).send({
        error: true,
        message: "Avatar not found"
    });

    const canvas = new Canvas(512, 512),
        ctx = canvas.getContext('2d');

    try {
        ctx.drawImage(await loadImage(avatarData.url), 0, 0, 512, 512);
    } catch (e) {
        return res.status(404).send({
            error: true,
            message: "User not found"
        });
    }

    res.type('png')
    res.send(canvas.toBuffer('image/png'))
});

app.get('/user/:id/score', async (req, res) => {
    const auth = req.headers.authorization;

    if (auth !== process.env.API_KEY) return res.status(403).send({
        error: true,
        message: "Invalid API key"
    });

    const { id } = req.params;

    const userData = await client.users.fetch(id).catch(() => null);

    if (!userData) return res.status(404).send({
        error: true,
        message: "User not found"
    });

    const data = await user.findOne({ id }) || await user.create({ id }),
        d = new Date(),
        history = await poundHistory.findOne({ id: id }) || await poundHistory.create({ id: id, data: [{ date: `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`, score: data.poundScore }] }),
        dates = [];

    d.setDate(d.getDate() - 7 + (6 - d.getDay()))

    while (dates.length < 8) {
        dates.push(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`)
        d.setDate(d.getDate() - 7);
    }

    res.send({
        previous_scores: dates.map(v => {
            return {
                date: v,
                score: getPoints(v, history.data)
            }
        }),
        current_score: {
            score: data.poundScore
        }
    });
});

app.post('/user/score/update', async (req, res) => {
    const auth = req.headers.authorization;

    if (auth !== process.env.API_KEY) return res.status(403).send({
        error: true,
        message: "Invalid API key"
    });

    const { discord_user_id: id, pound_score_modification: change, score_modification_timesamp: time } = req.body;

    const userData = await client.users.fetch(id).catch(() => null);

    if (!userData) return res.status(404).send({
        error: true,
        message: "User not found"
    });

    const data = await user.findOneAndUpdate({ id }, { $inc: { poundScore: change } }, { new: true }) || await user.create({ id, poundScore: change }),
        d = new Date(time),
        his = await poundHistory.findOne({ id }) || await poundHistory.create({ id }),
        date = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

    his.data = his.data.filter(v => v.date !== date);
    his.data.push({ date: `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`, score: data.poundScore });

    const history = await poundHistory.findOneAndUpdate({ id }, { data: his.data }, { new: true });

    res.send({
        previous_scores: history.data,
        current_score: {
            score: data.poundScore
        }
    })
});

app.get('/user/:id/avatar/update', async (req, res) => {
    const auth = req.headers.authorization;

    if (auth !== process.env.API_KEY) return res.status(403).send({
        error: true,
        message: "Invalid API key"
    });

    const { id } = req.params;

    const userData = await client.users.fetch(id).catch(() => null);


    if (!userData) return res.status(404).send({
        error: true,
        message: "User not found"
    });

    const avatarData = await avatar.findOne({ id: userData.id });
    res.send(new Date(avatarData?.updatedAt || 0));
});

app.post('/user/create', async (req, res) => {
    const auth = req.headers.authorization;

    if (auth !== process.env.API_KEY) return res.status(403).send({
        error: true,
        message: "Invalid API key"
    });

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

app.get('/:email/signup', async (req, res) => {
    const auth = req.headers.authorization;

    if (auth !== process.env.API_KEY) return res.status(403).send({
        error: true,
        message: "Invalid API key"
    });

    const email = req.params.email,
        data = await user.findOne({ email, guild: process.env.GUILD });
    const userData = await client.users.fetch(data?.id).catch(() => null);

    if (!data || !userData) return res.status(404).send({
        error: true,
        message: "User not found"
    });

    res.send({
        username: userData.username,
        coins: data.balance,
        rank: data.rank,
        streak: data.dailyStreak,
        score: data.xp || 0,
        wantTo: ["Gain Muscle", "Lose Weight", "Both"],
        commitedTo: ["1-3 days a week", "Study", "2-4 days a week", "3-6 days a week"]
    })
})

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

    if (response.error) return res.send(response);

    const _data = await (await fetch(`https://discord.com/api/v10/users/@me`, {
        headers: {
            Authorization: `Bearer ${response.access_token}`
        }
    })).json();


    const { email } = _data;

    await user.findOneAndUpdate({ id: _data.id, guild: process.env.GUILD }, { email }) || await user.create({ id: _data.id, guild: process.env.GUILD, email })

    if (!email) return res.send("Error: You didn't gave us access to check your email");

    const botData = await data.findOne({ id: client.user.id }) || await data.create({ id: client.user.id });

    if (botData.whitelist.includes(email)) res.send(`Error: You are already whitelisted. (email: ${email})`);
    else {
        await data.findOneAndUpdate({ id: client.user.id }, { $push: { whitelist: email } });

        res.send(`You are whitelisted successfully. (email: ${email})`);
    }
});

app.get('/emails', async (req, res) => {
    const auth = req.headers.authorization;

    if (auth !== process.env.API_KEY) return res.status(403).send({
        error: true,
        message: "Invalid API key"
    });

    const botData = await data.findOne({ id: client.user.id }) || await data.create({ id: client.user.id });

    res.send(botData.whitelist)
})

app.listen(process.env.PORT || 3001, () => console.log(`Web Server Started!`));

client.vNames = ["Members: {count}", "Verified: {count}", "Whitelisted: {count}", "Followers: {count}", "Unique Avatars: {count}", "OG Capsule HLDR's:", "Capsule HLDR's:"]

process.setMaxListeners(69);