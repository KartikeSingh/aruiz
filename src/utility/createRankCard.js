const { Canvas, loadImage, GlobalFonts } = require("@napi-rs/canvas");
const { join } = require('path');

const calcPercentage = require("./calcPercentage");
const calcPercentageBar = require("./calcPercentageBar");
const drawCircleAvatar = require("./drawCircleAvatar");

if (!GlobalFonts.has("Absolute Zero")) GlobalFonts.registerFromPath(join(__dirname, "./font.otf"), "Absolute Zero");

module.exports = async (data) => {
    const card = new Canvas(720, 350);
    const ctx = card.getContext("2d");

    // Background
    ctx.fillStyle = "#212026";
    ctx.fillRect(0, 0, card.width, card.height);

    // Username & Avatar
    drawCircleAvatar(ctx,
        calcPercentage(card, 12, "w"),
        calcPercentage(card, 32, "h"),
        50,
        await loadImage(
            data.avatar
        ),
        5,
        "#929194"
    );
    ctx.font = 'italic 15px "Arial"';
    ctx.fillStyle = "#85838c";
    ctx.fillText(
        data.name,
        calcPercentage(card, 5, "w"),
        calcPercentage(card, 55, "h")
    );

    // Stats
    // Title
    ctx.font = '35px "Absolute Zero"';
    ctx.fillStyle = "#fefefe";
    ctx.textAlign = "right";
    ctx.fillText("POUND SCORE", calcPercentage(card, 95, "w"), calcPercentage(card, 20, "h"));

    // Total
    ctx.font = '90px "Absolute Zero"';
    ctx.fillStyle = "#f900ff";
    ctx.textAlign = "right";
    ctx.fillText(data.xp + "", calcPercentage(card, 95, "w"), calcPercentage(card, 50, "h"));

    // Coins
    ctx.font = '16px "Absolute Zero"';
    ctx.fillStyle = "#fcfcfc";
    ctx.textAlign = "right";
    ctx.fillText(`LB COIN: ${data.balance}`, calcPercentage(card, 90, "w"), calcPercentage(card, 60, "h"));
    // Grade
    ctx.textAlign = "left";
    ctx.fillStyle = "#f900ff";
    ctx.fillText("B", calcPercentage(card, 92, "w"), calcPercentage(card, 60, "h"));

    // Percentages
    // Level
    ctx.font = '16px "Absolute Zero"';
    ctx.fillStyle = "#fcfcfc";
    ctx.textAlign = "left";
    ctx.fillText(`Level: ${data.level}`, calcPercentage(card, 5, "w"), calcPercentage(card, 70, "h"));
    // Bar
    ctx.fillStyle = "#939195";
    ctx.fillRect(
        calcPercentage(card, 5, "w"),
        calcPercentage(card, 75, "h"),
        calcPercentage(card, 89, "w"),
        6
    );
    // Bar filled
    ctx.fillStyle = "rgb(233,250,42)";
    ctx.fillRect(
        calcPercentage(card, 5, "w"),
        calcPercentage(card, 75, "h"),
        calcPercentageBar(card, (data.xp / data.requiredXp) * 100),
        6
    );
    // Straks
    ctx.font = '16px "Absolute Zero"';
    ctx.fillStyle = "#fcfcfc";
    ctx.textAlign = "left";
    ctx.fillText(
        `STREAK: ${data.dailyStreak} DAYS`,
        calcPercentage(card, 5, "w"),
        calcPercentage(card, 85, "h")
    );
    // Bar
    ctx.fillStyle = "#939195";
    ctx.fillRect(
        calcPercentage(card, 5, "w"),
        calcPercentage(card, 90, "h"),
        calcPercentage(card, 89, "w"),
        6
    );
    // Bar filled
    ctx.fillStyle = "rgb(233,250,42)";
    ctx.fillRect(
        calcPercentage(card, 5, "w"),
        calcPercentage(card, 90, "h"),
        calcPercentageBar(card, (data.dailyStreak / 50) * 100),
        6
    );

    return card.toBuffer("image/png");
}