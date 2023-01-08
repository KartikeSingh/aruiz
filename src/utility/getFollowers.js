const axios = require("axios");

module.exports = async (username = "BlockPound_") => await axios.get(`https://api.twitter.com/2/users/by/username/${username}?user.fields=public_metrics`, {
    headers: {
        Authorization: `Bearer ${process.env.TWITTER_ACCESS_TOKEN}`
    }
}).then(v => v.data.data.public_metrics.followers_count).catch(e => console.log(e.response.data) || 0)