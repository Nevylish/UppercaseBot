import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder, GuildChannel, GuildMember, PermissionFlagsBits } from "discord.js";
import Command from "../base/Command";
import UppercaseClient from "../base/UppercaseClient";
import { Functions } from "../utils/functions";
import { Member } from "../utils/member";
import InsufficientPermissions from "../exception/InsufficientPermissions";
import { Constants } from "../utils/constants";
import { Logger } from "../utils/logger";

export default class RenameChannelCommand extends Command {
    constructor(client: UppercaseClient) {
        super(client, {
            name: 'rename-channel',
            description: 'Rename existing channel with uppercase letters',
            dmPermission: false,
            defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
            options: [
                {
                    name: 'channel',
                    description: 'Select channel to rename',
                    type: ApplicationCommandOptionType.Channel,
                    required: true
                },
                {
                    name: 'new_name',
                    description: 'New name for selected channel, write with uppercase, they will be replaced by alt uppercase letters',
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        })
    }

    async onExecute(interaction: CommandInteraction): Promise<void> {
        // @ts-ignore
        const channel_selected: GuildChannel = interaction.options.getChannel('channel');
        // @ts-ignore
        const channel_name: string = interaction.options.getString('new_name');

        if (!Member.isStaff(interaction.member as GuildMember)) {
            throw new InsufficientPermissions('You do not have the necessary permissions to run this command.');
        }

        await interaction.deferReply({ephemeral: true});

        channel_selected.edit({name: Functions.alternativeUppercaseAlgorithm(channel_name), reason: `@${interaction.member.user.username} used /rename-channel command with Uppercase Bot`}).then((channel) => {
            const channelUrl = `https://discord.com/channels/${interaction.guild.id}/${channel.id}`;
            const embed = new EmbedBuilder()
                .setColor(Constants.Colors.GREEN)
                .setDescription(`🎉 Channel renamed ➜ [Go to channel](${channelUrl}) <#${channel.id}>.`);

                interaction.editReply({embeds: [embed], components: [Functions.spawnVoteTopGGButton(interaction)]});
        }).catch((err) => {
            Logger.error("RenameChannelCommand", '(onExecute)', err);
            throw new Error('Error while creating channel: ' + err.message);
        })
    }
}