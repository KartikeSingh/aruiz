const shops = require('../../models/shop');
const Items = require('../../models/item');
const fixNumber = require('../../utility/fixNumber');
const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const user = require('../../models/user');
const getItemComponents = require('../../utility/getItemComponents');
const fixIt = require('../../utility/fixIt');

module.exports = {
    data: {
        name: "items",
        description: "Get items of a shop",
    },

    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const shop = await shops.findOne({ id: interaction.guild.id }),
            items = await Items.find({ shop: shop.id });

        if (!shop) return interaction.editReply({
            embeds: [{
                title: "❌ Shop Not Found",
                color: "#ff0000"
            }]
        });

        if (items.length === 0) return interaction.editReply({
            embeds: [{
                color: "RED",
                title: "❌ No Items Found In The Shop"
            }]
        });

        let endIndex = 25, startIndex = 0;
        const menus = [], change = endIndex;

        while (true) {
            const ind = Math.floor(endIndex / change) - 1;

            menus[ind] = new MessageActionRow({
                components: [
                    new MessageSelectMenu({
                        customId: 'menu' + ind,
                        placeholder: `Page ${ind + 1}`,
                        options: items.slice(startIndex, endIndex).map(v => {
                            return {
                                label: v.name,
                                value: v.name,
                                description: `Price: ${fixNumber(v.points)} Points`,
                            }
                        })
                    })
                ]
            });

            startIndex = endIndex;
            endIndex += change;

            if (endIndex >= items.length) break;
        }

        const msg = await interaction.editReply({
            embeds: [{
                color: "YELLOW",
                title: "🛒 Select An Item"
            }],
            components: menus,
            fetchReply: true
        });

        let menuUsed = false;

        const col = msg.createMessageComponentCollector({
            filter: i => i.user.id === interaction.user.id,
            time: 360000
        });

        col.on('collect', async int => {
            col.stop();

            int.deferUpdate();

            const userData = await user.findOne({ id: int.user.id, guild: int.guild.id }) || await user.create({ id: int.user.id, guild: int.guild.id });
            const item = await Items.findOne({ name: int.values[0], shop: items[0].shop });

            interaction.editReply({
                embeds: [{
                    color: "RANDOM",
                    title: `${item.name}'s details`,
                    description: `\`\`\`${item.description.large}\`\`\``,
                    image: {
                        url: item.image
                    },
                    fields: [{
                        name: "Item Name",
                        value: `\`\`\`\n${item.name}\n\`\`\``,
                        inline: true
                    }, {
                        name: "Item points",
                        value: `\`\`\`\n${fixNumber(item.points || 0)} Points\n\`\`\``,
                        inline: true
                    }, {
                        name: "Item pieces in stock",
                        value: `\`\`\`\n${item.pieces}\n\`\`\``,
                        inline: true
                    }, {
                        name: "Units a user can hold",
                        value: `\`\`\`\n${item.userLimit}\n\`\`\``,
                        inline: true
                    }, {
                        name: item.role !== "0" ? `Role` : item.lootbox ? `Lootbox Limits ( min - max )` : "\u200b",
                        value: item.role !== "0" ? `<@&${item.role}>` : item.lootbox ? `\`\`\`\n${item.lootbox?.split("-")[0]} - ${item.lootbox?.split("-")[1]}\n\`\`\`` : "\u200b",
                        inline: true
                    }]
                }],
                components: getItemComponents(userData, item, shop)
            });

            const itemName = item.name;

            const col2 = msg.createMessageComponentCollector({
                filter: i => i.user.id === interaction.user.id,
                time: 560000
            });

            col2.on('collect', async (int) => {
                await int.deferReply({ ephemeral: true });

                const shop = await shops.findOne({ id: interaction.guild.id });
                let userData = await user.findOne({ id: int.user.id, guild: int.guild.id });
                let item = await Items.findOne({ name: itemName, shop: items[0].shop });

                if (int.customId === "sell") {
                    const units = 1, points = Math.floor(item.points * units * 0.6);

                    const sell = await fixIt(client, int, "yes-no", int.user, null, `Do you want to sell \`${units}\` **${item.name}** for \`${points}\` Points\nReact with ✔ to **sell** the items\nReact with ❌ to cancel`, {}, {}, true, true);

                    if (sell === true) {
                        const newItems = userData.items.filter(v => v !== item.id);

                        for (let i = userData.items.filter(v => v === item.id).length - units; i > 0; i--)newItems.push(item.id);

                        userData = await user.findOneAndUpdate({ id: userData.id, guild: int.guild.id }, { $inc: { balance: points }, items: newItems }, { new: true });

                        int.editReply({
                            embeds: [{
                                color: "#50C878",
                                title: `✅ Item sold for ${points} successfully`
                            }],
                            components: []
                        });
                    } else if (sell === false) {
                        int.editReply({
                            embeds: [{
                                color: "#50C878",
                                title: "✅ Command cancelled successfully"
                            }]
                        })
                    }
                } else if (int.customId === "use") {
                    const r = int.guild.roles.cache.get(item.role);
                    const newItems = userData.items.filter(v => v !== item.id);

                    for (let i = userData.items.filter(v => v === item.id).length - 1; i > 0; i--)newItems.push(item.id);

                    if (item.type === "1") {
                        if (!r) return int.editReply({
                            embeds: [{
                                color: "#ff0000",
                                title: "❌ Role does not exist"
                            }]
                        });

                        if (r.position >= int.guild.me.roles.highest.position) return int.editReply({
                            embeds: [{
                                color: "#ff0000",
                                title: "❌ This role is above my highest role, So I can't give it to you, Please contact the admins"
                            }]
                        });

                        int.member.roles.add(r);

                        int.editReply({
                            embeds: [{
                                color: "#50C878",
                                title: "Item used successfully",
                                description: `I gave you ${r.toString()} role`
                            }]
                        });

                        userData = await user.findOneAndUpdate({ id: int.user.id, guild: int.guild.id }, { items: newItems }, { new: true });
                    } else if (item.type === "2") {
                        const v = item.lootbox?.split("-").map(v => parseInt(v)) || [], min = v[0], max = v[1],
                            amount = Math.floor(Math.random() * (max - min) + min);

                        int.editReply({
                            embeds: [{
                                color: "#50C878",
                                title: `🎁 ${item.name} Opened`,
                                description: `Congrats you got **${amount}** Points`
                            }]
                        });

                        userData = await user.findOneAndUpdate({ id: int.user.id, guild: int.guild.id }, { $inc: { balance: amount }, items: newItems },{new:true});
                    } else {
                        int.editReply({
                            embeds: [{
                                color: "#50C878",
                                title: `🎁 ${item.name} Used`,
                                description: "Sent the mail, stay patient!"
                            }]
                        });

                        userData = await user.findOneAndUpdate({ id: int.user.id, guild: int.guild.id }, { items: newItems }, { new: true });

                        client.users.cache.get(client.owners[0]).send({
                            embeds: [{
                                color: "RANDOM",
                                title: "🦅 Item Used",
                                description: `${int.user.toString()} used **${item.name}**\n\nAutomated Reply:\n${item.reply}`
                            }]
                        })

                    }
                } else if (int.customId === "buy") {
                    const units = 1, points = (item.points || 0) * units;

                    if (points > userData.balance) return int.editReply({
                        embeds: [{
                            color: "#ff0000",
                            title: "You do not have enough points to buy this item",
                            description: `Points needed to buy \`${units}\` units of \`${item.name}\` are \`${item.points * units}\` Points but you have \`${userData.balance}\` Points`
                        }]
                    });

                    int.editReply({
                        embeds: [{
                            color: "#50C878",
                            title: "✅ Purchase successfull",
                            description: `Successfully purchased \`${units}\` **${item.name}** for \`${points}\` Points`
                        }]
                    })

                    const $inc = { balance: -points };

                    userData = await user.findOneAndUpdate({ id: int.user.id, guild: interaction.guild.id }, { $inc, $push: { items: { $each: new Array(units).fill(item.id) } } }, { new: true });
                    item = await Items.findOneAndUpdate({ id: item.id }, { $inc: { pieces: -units } })
                }

                interaction.editReply({
                    components: getItemComponents(userData, item, shop)
                })
            })

            col2.on('end', () => {
                interaction.editReply({ components: [] });
            })
        })

        col.on('end', () => {
            if (menuUsed) return;

            interaction.editReply({ components: [] });
        })
    }
}