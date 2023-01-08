const userInvites = require("../models/user");

module.exports = async (client, member) => {
    if (member.user.bot) return;

    const invs = await member.guild.invites.fetch();

    const invite = invs.filter(inv => inv.uses > client.invites.get(inv.code)).first();

    if (!invite) return;

    const vanityData = await member.guild.fetchVanityData().catch(() => { return {}; }),
        isVanity = client.invites.get(vanityData.code) > vanityData.uses;

    client.invites.set(invite.code, invite.uses);

    if (!(await userInvites.findOne({ guild: member.guild.id, id: member.id }))) {
        await userInvites.create({
            guild: member.guild.id,
            id: member.id,
            invitedBy: (isVanity ? "Vanity URL" : invite?.inviterId) || "Unknown",
            joinedAt: Date.now()
        });
    }

    client.channels.cache.get(process.env.INVITE_CHANNEL)?.send(`${member.user.tag} has been invited by ${ isVanity ? "Vanity URL" : invite?.inviterId ? `<@${invite.inviterId}>` :"Unknown"}`)

    if (!invite?.inviterId || await userInvites.findOne({ guild: member.guild.id, invited: member.id })) return;

    const mb = member.guild.members.cache.get(invite.inviterId) || await member.guild.members.fetch(invite.inviterId);

    await userInvites.findOneAndUpdate({ id: invite.inviterId, guild: member.guild.id }, { $push: { invited: member.id } }) || await userInvites.create({
        guild: member.guild.id,
        invited: [member.id],
        id: invite.inviterId,
        invitedBy: "Unknown",
        joinedAt: mb?.joinedTimestamp || 0
    });
}