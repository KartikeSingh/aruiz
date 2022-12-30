const getTwitterFollowers = require('get-twitter-followers');

module.exports = async (username = "BlockPound_") => {
    return new Promise(res => {

        getTwitterFollowers({
            consumer_key: process.env.TWITTER_CONSUMER_KEY,
            consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
            access_token: process.env.TWITTER_ACCESS_TOKEN_KEY,
            access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
            access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
        }, username).then(followers => {
            res(followers?.length || 0);
        }).catch(() => res(0));
    })
}