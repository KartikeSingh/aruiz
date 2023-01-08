const { CommandInteraction } = require("discord.js");

const axios = require('axios');
const user = require("../../models/user");

module.exports = {
    data: {
        name: "invite",
        description: "Create a permanent invite url",
        options: [],
    },
    timeout: 3000,

    /**
     * 
     * @param {*} client 
     * @param {CommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const userData = await user.findOne({ id: interaction.user.id, guild: process.env.GUILD });

        if (!userData?.token) return interaction.editReply({
            embeds: [{
                color: "RED",
                title: "❌ Not Logged In",
            }]
        });
        console.log(userData?.token)

        const member = await interaction.guild.members.fetch(interaction.user.id);
console.log(member.id)
        const data = await axios.post(`https://discord.com/api/v10/channels/${interaction.guild.channels.cache.filter(c => c.permissionsFor(member)?.has("CREATE_INSTANT_INVITE")).first()?.id}/invites`, {
            max_age: 0,
            max_uses: 0,
            temporary: false,
            unique: false,
        }, {
            headers: {
                Authorization: `Bearer ${userData?.token}`
            }
        }).then(v => v.data).catch(e => e.response.data);
        console.log(data)
        if (!data) return interaction.editReply({
            embeds: [{
                color: "RED",
                title: "❌ Invite Creation Failed",
            }]
        });

        interaction.editReply({
            embeds: [{
                color: "GREEN",
                title: "✅ Invite Created",
                description: `Use [this](${data.url}) to invite\nYour Invite URL: ${data.url}`
            }]
        });
    }
}