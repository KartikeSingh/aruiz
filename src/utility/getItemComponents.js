const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = (userData, item, shop) => {
    const owned = userData.items.filter(v => v === item.id).length;

    return [new MessageActionRow({
        components: [
            new MessageButton({
                customId: "buy",
                label: "Buy",
                style: "SUCCESS",
                emoji: "💸",
                disabled: item.pieces < 0 || owned > item.userLimit || userData.balance < item.points || shop.closed
            }),
            new MessageButton({
                customId: "use",
                label: "Use",
                style: "PRIMARY",
                emoji: "🧧",
                disabled: owned === 0
            }),
            new MessageButton({
                customId: "sell",
                label: "Sell",
                style: "DANGER",
                emoji: "📈",
                disabled: owned === 0
            }),
            new MessageButton({
                customId: "own",
                label: `Owned ${owned}`,
                style: "SECONDARY",
                emoji: "🏦",
                disabled: true
            })
        ]
    })]
}