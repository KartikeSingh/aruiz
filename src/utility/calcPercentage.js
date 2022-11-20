module.exports = calcPercentage = (card, percentage, type) =>
  (percentage * (type === "w" ? card.width : card.height)) / 100;