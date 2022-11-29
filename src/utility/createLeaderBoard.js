const { Canvas, loadImage, GlobalFonts } = require("@napi-rs/canvas");
const { join } = require('path');

const calcPercentage = require("./calcPercentage");
const drawCircleAvatar = require("./drawCircleAvatar");

const stars = ["https://media.discordapp.net/attachments/1040099075015589979/1043542030724370512/Screen_Shot_2022-11-12_at_8.21_2_2.png", "https://media.discordapp.net/attachments/1040099075015589979/1043542109380169838/Screen_Shot_2022-11-12_at_8.21_5_1.png", "https://media.discordapp.net/attachments/1040099075015589979/1043542176992346132/Screen_Shot_2022-11-12_at_8.21_7_1.png"];
const starSize = 30;

if (!GlobalFonts.has("Absolute Zero")) GlobalFonts.registerFromPath(join(__dirname, "./font.otf"), "Absolute Zero");

module.exports = async (users) => {
    const card = new Canvas(1000, 800);
    const ctx = card.getContext("2d");

    const drawRowTable = (h) =>
        ctx.fillRect(
            calcPercentage(card, 5, "w"),
            calcPercentage(card, h, "h"),
            calcPercentage(card, 89, "w"),
            60
        );

    // Background
    ctx.fillStyle = "#202026";
    ctx.fillRect(0, 0, card.width, card.height);

    // Title
    ctx.fillStyle = "#fcfcfc";
    ctx.font = '45px "Absolute Zero"';
    ctx.fillText("TOP " + (users.length > 10 ? 10 : users.length), calcPercentage(card, 5, "w"), calcPercentage(card, 10, "h"));

    // Table
    // Titles
    ctx.fillStyle = "#fcfcfc";
    ctx.font = '12px "Absolute Zero"';
    ctx.fillText("RANK", calcPercentage(card, 9, "w"), calcPercentage(card, 20, "h"));
    ctx.fillText("MEMBER", calcPercentage(card, 20, "w"), calcPercentage(card, 20, "h"));
    ctx.fillText("LEVEL", calcPercentage(card, 55, "w"), calcPercentage(card, 20, "h"));
    ctx.fillText("DAY Streak", calcPercentage(card, 64.5, "w"), calcPercentage(card, 20, "h"));
    ctx.fillText("POUND SCORE", calcPercentage(card, 79, "w"), calcPercentage(card, 20, "h"));

    for (let i = 0, y1 = 25, y2 = 30, pos = 0; i < (users.length > 10 ? 10 : users.length); i++, y1 += 9, y2 += 9, pos += 9) {
        ctx.fillStyle = "#3a393a";

        drawRowTable(y1);

        ctx.fillStyle = "#fcfcfc";
        ctx.font = '17px "Arial"';

        if (i < 3) {
            if (typeof stars[i] === "string") stars[i] = await loadImage(stars[i]);

            ctx.drawImage(stars[i], calcPercentage(card, 11, "w") -starSize/3 , calcPercentage(card, y2, "h") - starSize, starSize, starSize)
        }
        else ctx.fillText(`${i + 1}`, calcPercentage(card, 11, "w"), calcPercentage(card, y2, "h"));

        const user = users[i],
            av = await loadImage(user.avatar).catch(e => console.log(e));

        if (av) drawCircleAvatar(ctx,
            calcPercentage(card, 20, "w"),
            calcPercentage(card, 29 + pos, "h"),
            15,
            av,
            3,
            "#929194"
        );

        ctx.fillText(
            user.name,
            calcPercentage(card, 23, "w"),
            calcPercentage(card, 30 + pos, "h")
        );

        ctx.font = 'bold 17px "Arial"';
        ctx.textAlign = "center";

        ctx.fillText(
            user.level + "",
            calcPercentage(card, 58, "w"),
            calcPercentage(card, 30 + pos, "h")
        );

        ctx.fillText(
            user.dailyStreak + "",
            calcPercentage(card, 70, "w"),
            calcPercentage(card, 30 + pos, "h")
        );

        ctx.font = 'bold 20px "Absolute Zero"';
        ctx.textAlign = "center";
        ctx.fillStyle = "#f900ff";

        ctx.fillText(
            user.xp + "",
            calcPercentage(card, 85, "w"),
            calcPercentage(card, 30 + pos, "h")
        );

        // Reset styles
        ctx.font = '17px "Arial"';
        ctx.textAlign = "left";
        ctx.fillStyle = "#fcfcfc";
    }

    return card.toBuffer("image/png");
}