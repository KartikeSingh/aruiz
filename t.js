const axios  = require("axios");

axios.get("https://twitter.com/BlockPound_").then(v => console.log(v)).catch(v => console.log(v.response.data))