const calcPercentage = require("./calcPercentage");

module.exports = calcPercentageBar = (card, total) => (total * calcPercentage(card, 89, "w")) / 100;