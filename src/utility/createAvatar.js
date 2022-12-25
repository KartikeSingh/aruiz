const { Canvas, loadImage, GlobalFonts } = require("@napi-rs/canvas");
const { join } = require('path');

if (!GlobalFonts.has("Absolute Zero")) GlobalFonts.registerFromPath(join(__dirname, "./font.otf"), "Absolute Zero");
if (!GlobalFonts.has("Inter Light")) GlobalFonts.registerFromPath(join(__dirname, "./Inter-Light.ttf"), "Inter Light");
if (!GlobalFonts.has("Inter Regular")) GlobalFonts.registerFromPath(join(__dirname, "./Inter-Regular.ttf"), "Inter Regular");
if (!GlobalFonts.has("Inter Medium")) GlobalFonts.registerFromPath(join(__dirname, "./Inter-Medium.ttf"), "Inter Medium");

module.exports = async (user, avatar, data) => {
    const card = new Canvas(325, 396);
    const ctx = card.getContext("2d");
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, card.width, card.height)

    const av = await loadImage(avatar?.url).catch(() => null);

    if (av) ctx.drawImage(av, 13, 95, 293, 295);

    // Username & Avatar
    ctx.fillStyle = "#FFFFFF";
    ctx.font = '15px "Inter Medium"';
    ctx.fillText(
        user.username,
        15,
        65
    );

    // xp
    ctx.textAlign = "right";
    ctx.font = '9px "Inter Light"';
    ctx.fillText(`Daily XP: ${data.xp || 0}/${data.requiredXp}`, 300, 65);

    // Level
    ctx.textAlign = "left";
    ctx.fillStyle = "#FFFFFF";

    ctx.font = '10px "Inter Light"';
    ctx.fillText(`RANK`, 13, 27);

    ctx.font = '10px "Absolute Zero"';
    ctx.fillText(`POUND SCORE`, 205, 20);

    ctx.font = '26px "Inter Regular"';
    ctx.fillText(`#${data.rank || 0}`, 44, 30);

    let y = data.rank < 100 ? 0 : 20;

    ctx.fillStyle = "#FA00ff";
    ctx.font = '10px "Inter Light"';
    ctx.fillText(`LEVEL`, 100 + y, 27);

    ctx.font = '27px "Inter Regular"';
    ctx.fillText(`${data.level || 0}`, 132 + y, 30);
    ctx.font = '26px "Absolute Zero"';
    const score = (data.xp || 0) > 500 ? 500 : data.xp || 0;
    ctx.fillText(`${"0".repeat(4 - score.toString().length)}${score}`, 205, 42);

    // Bar
    ctx.lineJoin = "round";
    ctx.lineWidth = 10;
    ctx.fillStyle = "#494B4E";
    ctx.strokeStyle = "#494B4E";
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
        ((data.xp || 0) / data.requiredXp) * 280,
        1
    );
    ctx.strokeRect(
        19,
        74,
        ((data.xp || 0) / data.requiredXp) * 280,
        1
    );

    return card.toBuffer("image/png");
}