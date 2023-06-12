import { GuildMember, PermissionsBitField } from "discord.js";

export namespace Member {
    export const isStaff = (member: GuildMember) =>
    [PermissionsBitField.Flags.ManageChannels, 
        PermissionsBitField.Flags.ManageGuild
    ].some(p => member.permissions.has(p, true));
}