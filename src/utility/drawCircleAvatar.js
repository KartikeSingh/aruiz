/**
 * Draw a circle avatar with border optional
 * @param {number} x
 * @param {number} y
 * @param {number} size
 * @param {buffer} avatar
 * @param {number} sizeBorder
 * @param {string} borderSize
 */
module.exports = drawnCircleAvatar = (ctx, x, y, size, avatar, borderSize, colorBorder) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);

    if (colorBorder) {
        ctx.strokeStyle = colorBorder;
        ctx.lineWidth = borderSize ?? 20;
        ctx.stroke();
    }

    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, x - size, y - size, size * 2, size * 2);
    ctx.restore();
};