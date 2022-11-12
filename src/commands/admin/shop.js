const shops = require('../../models/shop');
const guilds = require('../../models/guild');
const fixIt = require('../../utility/fixIt');
const items = require('../../models/item');
const createID = require('create-random-id').randomID;

module.exports = {
    data: {
        name: "shop",
        description: "Create or manage your shop in the server",
        options: [
            {
                name: "close",
                type: 1,
                description: "Temporarily close your shop",
            }, {
                name: "open",
                type: 1,
                description: "Open your shop",
            }, {
                name: "edit",
                type: 1,
                description: "Edit your shop",
                options: [{
                    name: "name",
                    description: "New name for the shop",
                    type: 3,
                }, {
                    name: "description",
                    description: "Description of the shop",
                    type: 3,
                }, {
                    name: "image",
                    description: "Direct Link of new image of the shop",
                    type: 3,
                }]
            }, {
                name: "add-item",
                type: 1,
                description: "Add a new item to your shop",
                options: [
                    {
                        name: "name",
                        description: "Name of the item",
                        type: 3,
                        required: true
                    }, {
                        name: "type",
                        description: "Type of the item",
                        type: 3,
                        required: true,
                        choices: [{
                            name: "💰 Chest",
                            value: "2"
                        }, {
                            name: "👜 Role",
                            value: "1"
                        }, {
                            name: "💬 Reply",
                            value: "3"
                        }]
                    }, {
                        name: "small-description",
                        description: "Small description of the item",
                        type: 3,
                        required: true
                    }, {
                        name: "points",
                        minValue: 1,
                        description: "points needed to purchase this item",
                        type: 4,
                        required: true,
                    }, {
                        name: "large-description",
                        description: "Large description of the item",
                        type: 3,
                    }, {
                        name: "image",
                        description: "Direct Image link of the item",
                        type: 3,
                    }, {
                        name: "reply",
                        description: "The message I should send to the owner, when this item is used",
                        type: 3,
                    }, {
                        name: "lootbox",
                        description: "Lootbox limits, min-max example: 5-10",
                        type: 3,
                    }, {
                        name: "role",
                        description: "What role to give, if a user uses this item",
                        type: 8,
                    }, {
                        name: "pieces",
                        description: "How many of these are in stock ( available to sell )",
                        type: 4,
                    }, {
                        name: "user-limit",
                        description: "How many of this item a person can hold at a time",
                        type: 4,
                    },]
            }, {
                name: "edit-item",
                type: 1,
                description: "Edit a item of your shop",
                options: [{
                    name: "item-name",
                    description: "name of the item you want to edit",
                    type: 3,
                    required: true
                }, {
                    name: "name",
                    description: "new Name of the item",
                    type: 3,
                }, {
                    name: "points",
                    minValue: 1,
                    description: "points needed to purchase this item",
                    type: 4,
                }, {
                    name: "type",
                    description: "Type of the item",
                    type: 3,
                    choices: [{
                        name: "💰 Chest",
                        value: "2"
                    }, {
                        name: "👜 Role",
                        value: "1"
                    }, {
                        name: "💬 Reply",
                        value: "3"
                    }]
                }, {
                    name: "small-description",
                    description: "Small description of the item",
                    type: 3,
                }, {
                    name: "large-description",
                    description: "Large description of the item",
                    type: 3,
                }, {
                    name: "image",
                    description: "Direct Image link of the item",
                    type: 3,
                }, {
                    name: "role",
                    description: "What role to give, if a user uses this item, type 0 for no role reward",
                    type: 8,
                }, {
                    name: "reply",
                    description: "The message I should send to the owner, when this item is used",
                    type: 3,
                }, {
                    name: "lootbox",
                    description: "Lootbox limits, min-max example: 5-10",
                    type: 3,
                }, {
                    name: "pieces",
                    description: "How many of these are in stock ( available to sell )",
                    type: 4,
                }, {
                    name: "user-limit",
                    description: "How many of this item a person can hold at a time",
                    type: 4,
                },]
            }, {
                name: "remove-item",
                type: 1,
                description: "Remove a item form your shop",
                options: [{
                    name: "item-name",
                    description: "name of the item you want to edit",
                    type: 3,
                    required: true
                }]
            }],
    },

    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        let option = interaction.options.getSubcommand(),
            name = interaction.options.getString("name"),
            itemName = interaction.options.getString("item-name"),
            r2 = new RegExp(`^${name?.toLowerCase()?.replace(/\$/g, "\\$")}$`, "i"),
            r3 = new RegExp(`^${itemName?.toLowerCase()?.replace(/\$/g, "\\$")}$`, "i"),
            item = await items.findOne({
                $or: [
                    { name: { $regex: r2 } },
                    { name: { $regex: r3 } },
                ]
            }) || {},
            shop = await shops.findOne({ id: interaction.guild.id }) || await shops.create({ id: interaction.guild.id }),
            guild = await guilds.findOne({ id: interaction.guild.id }) || {},
            points = interaction.options.getInteger("points"),
            pieces = interaction.options.getInteger("pieces") || 100,
            userLimit = interaction.options.getInteger("user-limit") || 100,
            role = interaction.options.getRole("role")?.id || "0",
            reply = interaction.options.getString("reply"),
            lootbox = interaction.options.getString("lootbox"),
            type = interaction.options.getString("type"),
            small_description = interaction.options.getString("small-description"),
            large_description = interaction.options.getString("large-description"),
            description = interaction.options.getString("description"),
            image = interaction.options.getString("image");

        if (!guild.marketplaceOwners?.includes(interaction.user.id)
            && !client.owners.includes(interaction.user.id)
        ) return interaction.editReply({
            embeds: [{
                title: "❌ You do not have permissions to either use this command or access the provided shop",
                color: "#ff0000"
            }]
        });

        if (shop && !guild.marketplaceOwners?.includes(interaction.user.id)
            && interaction.guild.ownerId !== interaction.user.id
            && !client.owners.includes(interaction.user.id)
        ) return interaction.editReply({
            embeds: [{
                title: "❌ You do not have access to the shop",
                color: "#ff0000"
            }]
        });

        if (option === "close") {
            if (!shop?.id) return interaction.editReply({
                embeds: [{
                    color: "#ff0000",
                    title: "❌ Shop not found"
                }]
            });

            if (shop.closed) return interaction.editReply({
                embeds: [{
                    color: "#ff0000",
                    title: "❌ Shop is already closed"
                }]
            });

            interaction.editReply({
                embeds: [{
                    color: "#50C878",
                    title: "✅ Successfully close the shop 🏪",
                    fields: [{
                        name: "Shop Name",
                        value: shop.name,
                        inline: true
                    }, {
                        name: "Shop ID",
                        value: shop.id,
                        inline: true
                    }]
                }]
            });

            await shops.findOneAndUpdate({ id: interaction.guild.id }, { closed: true });
        } else if (option === "open") {
            if (!shop?.id) return interaction.editReply({
                embeds: [{
                    color: "#ff0000",
                    title: "❌ Shop not found"
                }]
            });

            if (!shop.closed) return interaction.editReply({
                embeds: [{
                    color: "#ff0000",
                    title: "❌ Shop is already open"
                }]
            });

            interaction.editReply({
                embeds: [{
                    color: "#50C878",
                    title: "✅ Successfully opened the shop 🏪",
                    fields: [{
                        name: "Shop Name",
                        value: shop.name,
                        inline: true
                    }, {
                        name: "Shop ID",
                        value: shop.id,
                        inline: true
                    }]
                }]
            });

            await shops.findOneAndUpdate({ id: interaction.guild.id }, { closed: false });
        } else if (option === "edit") {

            if (!shop?.id) return interaction.editReply({
                embeds: [{
                    color: "#ff0000",
                    title: "❌ Shop not found"
                }]
            });

            if (!name && !image && !description) return interaction.editReply({
                embeds: [{
                    color: "#ff0000",
                    title: "❌ Either provide a new image or name or description to edit"
                }]
            });

            name = name || shop.name;
            image = image || shop.image;
            description = (description || shop.description).replace(/\-\-/g, "\n");

            interaction.editReply({
                embeds: [{
                    color: "#50C878",
                    title: "✅ Successfully change the name of the shop 🏪",
                    fields: [{
                        name: "Shop's Old Name",
                        value: shop.name + ".",
                        inline: true
                    }, {
                        name: "Shop's New Name",
                        value: name + ".",
                        inline: true
                    }, {
                        name: "Shop ID",
                        value: shop.id,
                        inline: true
                    }, {
                        name: "Shop Description",
                        value: (description || "").slice(0, 256) + (description.length > 256 ? "..." : "") || "No Description",
                        inline: true
                    }],
                    image: {
                        url: image
                    }
                }]
            });

            await shops.findOneAndUpdate({ id: interaction.guild.id }, { name, image, description });
        } else if (option === "add-item") {
            if (!shop?.id) return interaction.editReply({
                embeds: [{
                    color: "#ff0000",
                    title: "❌ Invalid Shop ID was provided"
                }]
            });

            if (item?.id) return interaction.editReply({
                embeds: [{
                    color: "#ff0000",
                    title: "❌ An Item already exist with the name " + item?.name
                }]
            });

            if (pieces < 1) pieces = await fixIt(client, interaction, "pieces", interaction.user, "number");
            if (userLimit < 1) userLimit = await fixIt(client, interaction, "user limit", interaction.user, "number");

            if (pieces === undefined || userLimit === undefined) return;

            if (type === "1" && (!role || role === "0")) return interaction.editReply({
                embeds: [{
                    color: "RED",
                    title: "❌ Invalid Input",
                    description: "You selected the role type item but didn't provided a role, So please try again next time and put a role in role option"
                }]
            });

            if (type === "2" && !lootbox) return interaction.editReply({
                embeds: [{
                    color: "RED",
                    title: "❌ Invalid Input",
                    description: "You selected the chest type item but didn't provided anything in lootbox, So please try again next time and put a fill the lootbox option"
                }]
            });

            const lb = (lootbox || "").split("-").map(v => parseInt(v));

            if (type === "2" && (lb.some(v => !v || v < 1) || lb[0] > lb[1])) return interaction.editReply({
                embeds: [{
                    color: "RED",
                    title: "❌ Invalid Lootbox Input",
                    description: "Make sure the value for lootbox option is in the following syntax `5 - 13`, 5 and 13 can be any integer, greater than 0 and later one greater than earlier one"
                }]
            });

            if (type === "3" && !reply) return interaction.editReply({
                embeds: [{
                    color: "RED",
                    title: "❌ Invalid Input",
                    description: "You selected the reply type item but didn't provided anything in reply option, So please try again next time and put a fill the lootbox option"
                }]
            });

            if (pieces < 0 || userLimit < 0) return interaction.editReply({
                embeds: [{
                    color: "#ff0000",
                    title: "❌ Pieces or userLimit can't be less than 0"
                }]
            });

            if (!large_description) large_description = small_description;

            item = await items.create({
                id: createID(12, ["letter", "number"]),
                name,
                shop: shop.id,
                points,
                pieces,
                userLimit,
                role,
                image,
                reply,
                description: {
                    small: small_description,
                    large: large_description
                },
                type,
                lootbox: type === "2" ? `${lb[0]}-${lb[1]}` : null
            })

            interaction.editReply({
                embeds: [{
                    color: "#50C878",
                    title: "✅ Successfully created the item",
                    description: `**Small Description**:\n${item.description.small}\n\n**Large Description:**\n${item.description.large}`,
                    thumbnail: {
                        url: image
                    },
                    fields: [{
                        name: "Shop",
                        value: `\`${shop.name || "Bot Shop"}\``,
                        inline: true
                    }, {
                        name: "Item Name",
                        value: `\`${name || "unknown"}\``,
                        inline: true
                    }, {
                        name: "Item Price",
                        value: `\`${item.points || 0}\` 🪙`,
                        inline: true
                    }, {
                        name: "Item pieces in stock",
                        value: `**${item.pieces}**`,
                        inline: true
                    }, {
                        name: "Item a user can hold",
                        value: `**${item.userLimit}**`,
                        inline: true
                    }, {
                        value: item.role !== "0" ? `<@&${item.role}>` : "\u200b",
                        name: item.role !== "0" ? `Role` : "\u200b",
                        inline: true
                    }]
                }]
            });
        } else if (option === "edit-item") {
            if (!item?.id) return interaction.editReply({
                embeds: [{
                    title: "❌ Invalid Item was provided",
                    color: "#ff00000"
                }]
            });

            points = points || item.points;
            reply = reply || item.editReply;
            name = name || item.name;
            type = type || item.type;
            pieces = pieces || item.pieces;
            userLimit = userLimit || item.userLimit;
            role = role || item.role;
            reply = reply || item.reply;
            lootbox = lootbox || item.lootbox;
            small_description = small_description || item.description?.small;
            large_description = large_description || item.description?.large;
            image = image || item.image;

            if (pieces < 1) pieces = await fixIt(client, interaction, "pieces", interaction.user, "number");
            if (userLimit < 1) userLimit = await fixIt(client, interaction, "user limit", interaction.user, "number");

            if (pieces === undefined || userLimit === undefined) return;

            if (pieces < 0 || userLimit < 0) return interaction.editReply({
                embeds: [{
                    color: "#ff0000",
                    title: "❌ Pieces or userLimit can't be less than 0"
                }]
            });

            if (type === "1" && (!role || role === "0")) return interaction.editReply({
                embeds: [{
                    color: "RED",
                    title: "❌ Invalid Input",
                    description: "You selected the role type item but didn't provided a role, So please try again next time and put a role in role option"
                }]
            });

            if (type === "2" && !lootbox) return interaction.editReply({
                embeds: [{
                    color: "RED",
                    title: "❌ Invalid Input",
                    description: "You selected the chest type item but didn't provided anything in lootbox, So please try again next time and put a fill the lootbox option"
                }]
            });

            const lb = (lootbox || "").split("-").map(v => parseInt(v));

            if (type === "2" && (lb.some(v => !v || v < 1) || lb[0] > lb[1])) return interaction.editReply({
                embeds: [{
                    color: "RED",
                    title: "❌ Invalid Lootbox Input",
                    description: "Make sure the value for lootbox option is in the following syntax `5 - 13`, 5 and 13 can be any integer, greater than 0 and later one greater than earlier one"
                }]
            });

            if (type === "3" && !reply) return interaction.editReply({
                embeds: [{
                    color: "RED",
                    title: "❌ Invalid Input",
                    description: "You selected the reply type item but didn't provided anything in reply option, So please try again next time and put a fill the lootbox option"
                }]
            });

            item = await items.findOneAndUpdate(
                { id: item.id }, {
                name,
                shop: shop.id,
                points,
                pieces,
                userLimit,
                role,
                reply,
                image,
                description: {
                    small: small_description,
                    large: large_description
                },
                type,
                lootbox: type === "2" ? `${lb[0]}-${lb[1]}` : null
            }, { new: true })

            interaction.editReply({
                embeds: [{
                    color: "#50C878",
                    title: "✅ Successfully edited the item",
                    description: `**Small Description**:\n${item.description.small}\n\n**Large Description:**\n${item.description.large}`,
                    thumbnail: {
                        url: image
                    },
                    fields: [{
                        name: "Shop",
                        value: `\`${shop.name || "Bot Shop"}\``,
                        inline: true
                    }, {
                        name: "Item Name",
                        value: `\`${name || "unknown"}\``,
                        inline: true
                    }, {
                        name: "Item Price",
                        value: `\`${item.points || 0}\` 🪙`,
                        inline: true
                    }, {
                        name: "Item pieces in stock",
                        value: `**${item.pieces}**`,
                        inline: true
                    }, {
                        name: "Item a user can hold",
                        value: `**${item.userLimit}**`,
                        inline: true
                    }, {
                        value: item.role !== "0" ? `<@&${item.role}>` : "\u200b",
                        name: item.role !== "0" ? `Role` : "\u200b",
                        inline: true
                    }]
                }]
            });
        } else if (option === "remove-item") {
            if (!item?.id) return interaction.editReply({
                embeds: [{
                    color: "#ff0000",
                    title: "❌ Item not found",
                }]
            });

            await items.findOneAndDelete({ name: itemName });

            interaction.editReply({
                embeds: [{
                    color: "#50C878",
                    title: "✅ Item removed successfully",
                }]
            });
        }
    }
}