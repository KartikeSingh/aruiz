const { MessageEmbed } = require("discord.js");
const avatar = require("../../models/avatar")

const roles = ["1032705263154765824", "1032705446420684850", "1032705920637087804", "1032682130280550411", "1032706161721491516"].map((v,i) =>{
    return {
        index:i,
        v
    }
});
const name = ["LV. 5", "LV. 4", "LV. 3", "LV. 2", "LV. 1"];

module.exports = {
    data: {
        name: "flex-avatar",
        description: "Flex your avatar",
        options: [],
    },
    timeout: 3000,

    run: async (client, interaction) => {
        await interaction.deferReply({});

        const user = interaction.user,
            av = await avatar.findOne({ id: user.id });

        if (!av?.url) return interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setColor("RED")
                    .setTitle("❌ No Avatar Setted")
            ]
        });

        const ind = roles.filter(v => interaction.member.roles.cache.has(v.v))[0]?.index,
        level = name[ind] || "\u200b";

        interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setColor("#FA00ff")
                    .setTitle(`${user.username}`)
                    .setURL(av.url)
                    .setImage(av.url)
                    .setDescription(level)
            ]
        });
    }
}