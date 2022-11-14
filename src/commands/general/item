const users = require('../../models/user');
const items = require('../../models/item');
const shops = require('../../models/shop');
const fixIt = require('../../utility/fixIt');
const fixNumber = require('../../utility/fixNumber');

module.exports = {
    data: {
        name: "item",
        description: "Get information about an item",
        options: [{
            name: "info",
            description: "Get information of an item",
            type: 1,
            options: [{
                name: "item-name",
                description: "ID of the item you want to know about",
                type: 3,
                required: true
            }]
        }, {
            name: "buy",
            description: "Buy a item",
            type: 1,
            options: [{
                name: "item-name",
                description: "ID of the item you want to buy",
                type: 3,
                required: true
            }, {
                name: "units",
                description: "amount of item(s) you want to buy",
                type: 4,
                minValue: 1,
                required: true
            }]
        }, {
            name: "sell",
            description: "Sell an item",
            type: 1,
            options: [{
                name: "item-name",
                description: "ID of the item you want to sell",
                type: 3,
                required: true
            }, {
                name: "units",
                description: "amount of item(s) you want to sell",
                type: 4,
                minValue: 1,
                required: true
            }]
        }, {
            name: "use",
            description: "Use a item",
            type: 1,
            options: [{
                name: "item-name",
                description: "Name of the item you want to use",
                type: 3,
                required: true
            }]
        }],
    },

    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        let name = interaction.options.getString("item-name"),
            r = new RegExp(`^${name?.toLowerCase()}$`, "i"),
            item = await items.findOne({ name: { $regex: r } }) || {},
            user = await users.findOne({ id: interaction.user.id, guild: interaction.guild.id }),
            shop = await shops.findOne({ id: item.shop }) || {},
            option = interaction.options.getSubcommand(),
            units = interaction.options.getInteger("units");

        if (option === "info") {
            if (!item?.id) return interaction.editReply({
                embeds: [{
                    title: "❌ Item Not Found",
                    color: "#ff0000"
                }]
            });

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
                        value: item.name,
                        inline: true
                    }, {
                        name: "Item points",
                        value:`\`\`\`\n${fixNumber(item.points || 0)} Points\n\`\`\``,
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
                        value: item.role !== "0" ? `Role` : item.lootbox ? `Lootbox Limits ( min - max )` : "\u200b",
                        name: item.role !== "0" ? `<@&${item.role}>` : item.lootbox ? `\`\`\`\n${item.lootbox?.split("-")[0]} - ${item.lootbox?.split("-")[1]}\n\`\`\`` : "\u200b",
                        inline: true
                    }]
                }]
            })
        } else if (option === "buy") {
            if (!item?.id) return interaction.editReply({
                embeds: [{
                    color: "#ff0000",
                    title: "❌ Item does not exist"
                }]
            });

            if (shop.closed) return interaction.editReply({
                embeds: [{
                    color: "#ff0000",
                    title: "Shop is closed right now"
                }]
            });

            if (item.pieces - units < 0) return interaction.editReply({
                embeds: [{
                    color: "#ff0000",
                    title: "Shop does not have enough of this item",
                    description: `Remaining itemss: \`${item.pieces}\``
                }]
            });

            if (user.items.filter(v => v === item.id).length + units > item.userLimit) return interaction.editReply({
                embeds: [{
                    color: "#ff0000",
                    title: "You can't buy more ( or this much ) of this item",
                    description: `Amount of items allowed to hold: \`${item.userLimit}\``
                }]
            });

            const points = (item.points || 0) * units;

            if (points > user.balance) return interaction.editReply({
                embeds: [{
                    color: "#ff0000",
                    title: "You do not have enough points to buy this item",
                    description: `Points needed to buy \`${units}\` units of \`${item.name}\` are \`${item.points * units}\` Points but you have \`${user.balance}\` Points`
                }]
            });

            interaction.editReply({
                embeds: [{
                    color: "#50C878",
                    title: "✅ Purchase successfull",
                    description:`Successfully purchased \`${units}\` **${item.name}** for \`${points}\` Points`
                }]
            })

            const $inc = { balance: -points };

             await users.findOneAndUpdate({ id: user.id, guild: interaction.guild.id }, { $inc, $push: { items: { $each: new Array(units).fill(item.id) } } }, { new: true });
            await items.findOneAndUpdate({ id: item.id }, { $inc: { pieces: -units } })
        } else if (option === "sell") {
            if (!item?.id) return interaction.editReply({
                embeds: [{
                    color: "#ff0000",
                    title: "❌ Item does not exist"
                }]
            });

            const av = user.items.filter(v => v === item.id);

            if (av.length < units) return interaction.editReply({
                embeds: [{
                    color: "#ff0000",
                    title: `❌ You do not have ${units} of this item, you just have ${av.length}`
                }]
            });

            const points = Math.floor(item.points * units * 0.6);

            const sell = await fixIt(client, interaction, "yes-no", interaction.user, null, `Do you want to sell ${units} ${item.name} for ${points}\nReact with ✔ to **sell** the items\nReact with ❌ to cancel`);

            if (sell === true) {
                interaction.editReply({
                    embeds: [{
                        color: "#50C878",
                        title: `✅ Item sold for ${sp} successfully`
                    }]
                });

                const newItems = user.items.filter(v => v !== item.id);

                for (let i = av.length - units; i > 0; i--)newItems.push(item.id);

                await users.findOneAndUpdate({ id: user.id , guild: interaction.guild.id}, { $inc: { balance: points }, items: newItems })
            } else if (sell === false) {
                interaction.editReply({
                    embeds: [{
                        color: "#50C878",
                        title: "✅ Command cancelled successfully"
                    }]
                })
            }
        } else if (option === "use") {
            if (!item?.id) return interaction.editReply({
                embeds: [{
                    color: "#ff0000",
                    title: "❌ Item does not exist"
                }]
            });

            if (user.items.filter(v => v === item.id).length < 1) return interaction.editReply({
                embeds: [{
                    color: "#ff0000",
                    title: "❌ You do not have this item"
                }]
            });

            const r = interaction.guild.roles.cache.get(item.role);
            const newItems = user.items.filter(v => v !== item.id);

            for (let i = user.items.filter(v => v === item.id).length - 1; i > 0; i--)newItems.push(item.id);

            if (item.type === "1") {
                if (!r) return interaction.editReply({
                    embeds: [{
                        color: "#ff0000",
                        title: "❌ Role does not exist"
                    }]
                });

                if (r.position >= interaction.guild.me.roles.highest.position) return interaction.editReply({
                    embeds: [{
                        color: "#ff0000",
                        title: "❌ This role is above my highest role, So I can't give it to you, Please contact the admins"
                    }]
                });

                interaction.member.roles.add(r);

                interaction.editReply({
                    embeds: [{
                        color: "#50C878",
                        title: "Item used successfully",
                        description: `I gave you ${r.toString()} role`
                    }]
                });

                await users.findOneAndUpdate({ id: user.id, guild: interaction.guild.id }, { items: newItems });
            } else if (item.type === "2") {
                const v = item.lootbox?.split("-").map(v => parseInt(v)) || [], min = v[0], max = v[1],
                    amount = Math.floor(Math.random() * (max - min) + min);

                interaction.editReply({
                    embeds: [{
                        color: "#50C878",
                        title: `🎁 ${item.name} Opened`,
                        description: `Congrats you got **${amount}** Points`
                    }]
                });

                await users.findOneAndUpdate({ id: user.id , guild: interaction.guild.id}, { $inc: { balance: amount } });
            } else {
                interaction.editReply({
                    embeds: [{
                        color: "#50C878",
                        title: `🎁 ${item.name} Used`,
                        description: "Sent the mail, stay patient!"
                    }]
                });

                client.users.cache.get(client.owners[0])?.send({
                    embeds: [{
                        color: "RANDOM",
                        title: "🦅 Item Used",
                        description: `${interaction.user.toString()} used **${item.name}**\n\nAutomated Reply:\n${item.reply}`
                    }]
                }).catch(() => null)

                await users.findOneAndUpdate({ id: user.id, guild: interaction.guild.id }, { items: newItems });
            }
        }
    }
}
