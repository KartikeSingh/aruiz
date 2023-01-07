const userInvites = require("../models/user");

module.exports = async (client, member) => {
    if (member.user.bot) return;

    const data = await userInvites.findOne({ guild: member.guild.id, id: member.id });

    if (!data) return;

    await userInvites.findOneAndUpdate({ id: data.invitedBy, guild: member.guild.id }, { $pull: { invited: member.id } })
}