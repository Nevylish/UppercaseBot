import { GuildMember, PermissionsBitField } from "discord.js";

export namespace Member {
    export const isStaff = (member: GuildMember) =>
    member.permissions.has(
        [PermissionsBitField.Flags.BanMembers, PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.ManageGuild]
    , true);
}