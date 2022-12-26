
const { MessageActionRow, MessageEmbed, MessageButton, MessageAttachment } = require('discord.js');
const avatar = require("../../models/avatar");
const users = require("../../models/user");
const createAvatar = require('../../utility/createAvatar');

module.exports = {
    data: {
        name: "test",
        description: "dqwd",
        options: [],
    },
    timeout: 23,

    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true })

        const user = interaction.user,
            av = await avatar.findOne({ id: user.id }),
            data = await users.findOne({ id: interaction.user.id, guild: interaction.guild.id });

        data.avatar = user.displayAvatarURL({ dynamic: false });
        data.requiredXp = 100;
        user.roles = interaction.guild.members.cache.get(interaction.user.id)?.roles;

        for (let i = 1; i <= data.level; i++)data.requiredXp += 5 * (i ^ 2) + (50 * i) + 100;

        interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setColor("#5b63f3")
                    .setImage("attachment://avatar.png")
            ],
            components: [new MessageActionRow({
                components: [
                    new MessageButton({
                        style: "PRIMARY",
                        customId: 'flex',
                        label: "Click to flex your avatar",
                    })
                ]
            })],
            files: [new MessageAttachment(await createAvatar(user, av, data), "avatar.png")]
        })
    }
}