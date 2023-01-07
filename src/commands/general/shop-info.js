const shops = require('../../models/shop');

module.exports = {
    data: {
        name: "shop-info",
        description: "Get the information of shops",
    },

    run: async (client, interaction) => {
        await interaction.deferReply({  });

        const shop = await shops.findOne({ id: interaction.guild.id }) || await shops.create({ id: interaction.guild.id });

        interaction.editReply({
            embeds: [{
                color: "RANDOM",
                title: `${shop.name || interaction.guild.name + " shop"}'s Details`,
                description: shop.description,
                fields: [{
                    name: "Shop State",
                    value: `Shop is ${shop.closed ? "closed" : "opened"}`,
                    inline: true
                }],
                image: {
                    url: shop.image
                },
                footer: {
                    text: "use /items to check items of a shop"
                }
            }],
        })
    }
}