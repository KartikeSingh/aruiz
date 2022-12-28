const { Canvas, loadImage, GlobalFonts } = require("@napi-rs/canvas");
const { join } = require('path');

if (!GlobalFonts.has("Absolute Zero")) GlobalFonts.registerFromPath(join(__dirname, "./font.otf"), "Absolute Zero");
if (!GlobalFonts.has("Inter Light")) GlobalFonts.registerFromPath(join(__dirname, "./Inter-Light.ttf"), "Inter Light");
if (!GlobalFonts.has("Inter Regular")) GlobalFonts.registerFromPath(join(__dirname, "./Inter-Regular.ttf"), "Inter Regular");
if (!GlobalFonts.has("Inter Medium")) GlobalFonts.registerFromPath(join(__dirname, "./Inter-Medium.ttf"), "Inter Medium");
if (!GlobalFonts.has("SF PRO")) GlobalFonts.registerFromPath(join(__dirname, "./sf-pro-text-bold.ttf"), "SF PRO");


const roles = ["1056677083604066445", "1056674165110882305", "1056335558856687766", "1056334675209097216", "1056334670083674112", "1056334664480075866", "1056334648063565864", "1056334659522404412", "1056333900131078214", "1056333897660633218", "1056333855671451698", "1056333825472483370", "1056333384412037184"].map((v, i) => {
    return {
        i,
        v
    }
}),
    names = ["Pounder", "OG Alpha", "Alpha", "Deca", "Nona", "Octa", "Hepta", "Hexa", "Penta", "Tetra", "Tri", "Di", "Mono"];

let capule;

loadImage("https://cdn.discordapp.com/attachments/723104565708324915/1056907306064957470/badge_purple_2_2.png").then(x => {
    capule = x;
});

module.exports = async (user, avatar, data) => {
    const card = new Canvas(325, 410);
    const ctx = card.getContext("2d");

    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, card.width, card.height)

    const av = await loadImage(avatar?.url).catch(() => null);

    if (av) ctx.drawImage(av, 13, 108, 293, 295);

    // Username & Avatar
    ctx.fillStyle = "#FFFFFF";

    const username = [user.username.slice(0, 15), user.username.slice(15)];

    ctx.font = '15px "SF PRO"';

    ctx.fillText(
        username[0],
        15,
        20
    );
    ctx.fillText(
        username[1],
        15,
        35
    );

    // xp
    ctx.textAlign = "right";
    ctx.font = '9px "Inter Light"';
    ctx.fillText(`Daily XP: ${data.xp || 0}/${data.requiredXp}`, 300, 82);

    // Level
    ctx.textAlign = "left";
    ctx.fillStyle = "#FFFFFF";

    ctx.font = '10px "Inter Light"';
    ctx.fillText(`RANK`, 15, 58);

    ctx.font = '10px "Absolute Zero"';
    ctx.fillText(`POUND SCORE`, 200, 39);

    ctx.font = '24px "Inter Regular"';
    ctx.fillText(`#${data.rank || 0}`, 49, 58);

    const level = roles.filter(v => user.roles.cache.has(v.v))[0]?.i,
        name = names[level] || "None";

    ctx.font = '10px "Inter Light"';
    ctx.fillText(`LEVEL`, 15, 82);

    ctx.fillStyle = "#FA00ff";
    ctx.font = '24px "Inter Regular"';
    ctx.fillText(name, 50, 82);
    ctx.font = '26px "Absolute Zero"';
    const score = (data.xp || 0) > 500 ? 500 : data.xp || 0;
    ctx.fillText(`${"0".repeat(4 - score.toString().length)}${score}`, 200, 25);


    // Bar
    ctx.lineJoin = "round";
    ctx.lineWidth = 10;
    ctx.fillStyle = "#494B4E";
    ctx.strokeStyle = "#494B4E";
    ctx.fillRect(
        19,
        93,
        280,
        1
    );
    ctx.strokeRect(
        19,
        93,
        280,
        1
    );

    // Bar filled
    ctx.fillStyle = "#FA00ff";
    ctx.strokeStyle = "#FA00ff";
    ctx.fillRect(
        19,
        93,
        ((data.xp || 0) / data.requiredXp) * 280,
        1
    );
    ctx.strokeRect(
        19,
        93,
        ((data.xp || 0) / data.requiredXp) * 280,
        1
    );

    return card.toBuffer("image/png");
}