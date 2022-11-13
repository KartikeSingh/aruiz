const { MessageEmbed } = require("discord.js");
const item = require("../../models/item");
const user = require("../../models/user");

module.exports = {
    data: {
        name: "give",
        description: "Give something to another user",
        options: [{
            name: "coin",
            type: 1,
            description: "Give coin to other users",
            options: [{
                name: "user",
                type: 6,
                description: "User to whom you want to give the coins",
                required: true,
            }, {
                name: "coins",
                type: 4,
                description: "Amount of coins you want to give to the user",
                required: true,
                minValue: 1
            }]
        }, {
            name: "item",
            type: 1,
            description: "Give item to other users",
            options: [{
                name: "user",
                type: 6,
                description: "User to whom you want to give the items",
                required: true,
            }, {
                name: "item",
                type: 3,
                description: "Name of the item you want to give to the user",
                required: true,
            }, {
                name: "quantity",
                type: 4,
                description: "Quantity of the item you want to give to the user",
                required: true,
                minValue: 1
            }]
        }],
    },
    timeout: 3000,

    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const option = interaction.options.getSubcommand(),
            user = interaction.options.getUser("user"),
            rawItem = interaction.options.getString("item"),
            coins = interaction.options.getInteger("coins"),
            quantity = interaction.options.getInteger("quantity"),
            user1Data = await user.findOne({ guild: interaction.guildId, id: interaction.user.id }) || await user.create({ guild: interaction.guildId, id: interaction.user.id }),
            user2Data = await user.findOne({ guild: interaction.guildId, id: user?.id }) || await user.create({ guild: interaction.guildId, id: user?.id });
        if (option === "coin") {
            if (user1Data.balance < coins) return interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor("RED")
                        .setTitle("❌ Not Enough Balance")
                        .setDescription(`You can't give \`${coins}\` ${client.currencyName}`)
                ]
            });

            await user.findOneAndUpdate({ guild: interaction.guildId, id: interaction.user.id }, { $inc: { balance: -coins } });
            await user.findOneAndUpdate({ guild: interaction.guildId, id: user?.id }, { $inc: { balance: coins } });

            interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor("Green")
                        .setTitle("✅ Coins Given")
                        .setDescription(`${interaction.user.toString()} successfully gave \`${coins}\` ${client.currencyName} to ${user.toString()}`)
                ]
            });
        } else if (option === "item") {
            const itemData = await item.findOne({ shop: interaction.guildId, name: rawItem });

            if (!itemData?.id) return interaction.editReply({
                embeds: [
                    new MessageEmbed({
                        title: "❌ Item does not exist"
                    }).setColor("RED")
                ]
            });

            const av = user1Data.items.filter(v => v === itemData.id);

            if (av.length < quantity) return interaction.editReply({
                embeds: [
                    new MessageEmbed({
                        title: "❌ Invalid Transaction",
                        description: `You do not have \`${quantity}\` **${itemData.name}**, you just have \`${av.length}\``
                    }).setColor("RED")
                ]
            });

            const newItems = user1Data.items.filter(v => v !== itemData.id);

            for (let i = av.length - quantity; i > 0; i--) newItems.push(itemData.id);

            await user.findOneAndUpdate({ id: user1Data.id, guild: interaction.guild.id }, { items: newItems })
            await user.findOneAndUpdate({ id: user2Data.id, guild: interaction.guild.id }, { $push: { items: new Array(quantity).fill(itemData.id) } })

            interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor("GREEN")
                        .setTitle("✅ Item Transfered")
                        .setDescription(`${interaction.user.toString()} successfully gave  \`${quantity}\` **${itemData.name}** to ${user.toString()}`)
                ]
            });
        }
    }
}