const { Canvas, loadImage, GlobalFonts } = require("@napi-rs/canvas");
const { join } = require('path');

if (!GlobalFonts.has("Absolute Zero")) GlobalFonts.registerFromPath(join(__dirname, "./font.otf"), "Absolute Zero");

module.exports = async (user, avatar, data) => {
    const card = new Canvas(325, 396);
    const ctx = card.getContext("2d");

    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, card.width, card.height)

    const av = await loadImage(avatar?.url).catch(() => null);

    if (av) ctx.drawImage(av, 13, 93, 293, 295);

    // Username & Avatar
    ctx.fillStyle = "#FA00ff";
    ctx.font = 'bold 15px Arial';
    ctx.fillText(
        user.username,
        13,
        55
    );

    // Level
    ctx.textAlign = "left";

    ctx.font = '10px "Absolute Zero"';
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(`Rank`, 13, 20);

    ctx.font = '9px "Absolute Zero"';
    ctx.fillText(`POUND SCORE`, 205, 20);

    ctx.font = '15px "Absolute Zero"';
    ctx.fillText(`#${data.rank || 0}`, 57, 21);

    ctx.fillStyle = "#FA00ff";
    ctx.font = '10px "Absolute Zero"';
    ctx.fillText(`Level`, 110, 20);

    ctx.font = '15px "Absolute Zero"';
    ctx.fillText(`${data.level}`, 165, 21);
    ctx.font = '23px "Absolute Zero"';
    ctx.fillText(`${data.xp || 0}`, 206, 42);

    // Bar
    ctx.lineJoin = "round";
    ctx.lineWidth = 10;
    ctx.fillStyle = "#939195";
    ctx.strokeStyle = "#939195";
    ctx.fillRect(
        19,
        74,
        280,
        1
    );
    ctx.strokeRect(
        19,
        74,
        280,
        1
    );
    // Bar filled
    ctx.fillStyle = "#FA00ff";
    ctx.strokeStyle = "#FA00ff";
    ctx.fillRect(
        19,
        74,
        ((data.xp || 10) / data.requiredXp) * 280,
        1
    );
    ctx.strokeRect(
        19,
        74,
        ((data.xp || 10) / data.requiredXp) * 280,
        1
    );

    return card.toBuffer("image/png");
}