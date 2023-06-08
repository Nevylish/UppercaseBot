import { CommandInteraction, ChannelType, GuildMember, EmbedBuilder, GuildChannel, PermissionFlagsBits, ApplicationCommandOptionType } from "discord.js";
import Command from "../base/Command";
import UppercaseClient from "../base/UppercaseClient";
import { Member } from "../utils/member";
import InsufficientPermissions from "../exception/InsufficientPermissions";
import { Functions } from "../utils/functions";
import { Constants } from "../utils/constants";
import { Logger } from "../utils/logger";

export default class CreateChannelCommand extends Command {
    constructor(client: UppercaseClient) {
        super(client, {
            name: 'create-channel',
            description: 'Create channel with uppercase letters',
            dmPermission: false,
            defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
            options: [
                {
                    name: 'channel_name',
                    description: 'Name for channel to create, write with uppercase, they will be replaced by alt uppercase letters',
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: 'channel_type',
                    description: 'Type for channel to create, Text, Forum or Announcement. Empty: Text',
                    type: ApplicationCommandOptionType.String,
                    choices: [
                        {
                            name: 'Announcement',
                            value: ChannelType.GuildAnnouncement.toString()
                        },
                        {
                            name: 'Forum',
                            value: ChannelType.GuildForum.toString()
                        },
                        {
                            name: 'Text',
                            value: ChannelType.GuildText.toString()
                        }
                    ],
                    required: false
                }
            ]
        });
    }

    async onExecute(interaction: CommandInteraction): Promise<void> {
        // @ts-ignore
        const channel_name: string = interaction.options.getString('channel_name');
        // @ts-ignore
        let channel_type: string | Number = interaction?.options?.getString('channel_type');

        if (!channel_type) channel_type = ChannelType.GuildText;
        if (!Member.isStaff(interaction.member as GuildMember)) {
            // TODO: err texts
            throw new InsufficientPermissions('You do not have the necessary permissions to run this command.');
        }

        await interaction.deferReply({ephemeral: true});

        interaction.guild.channels.create({
            name: Functions.alternativeUppercaseAlgorithm(channel_name),
            type: Number(channel_type),
            reason: `@${interaction.member.user.username} used /create-channel command with Uppercase Bot`,
            // @ts-ignore
            parent: interaction.channel.parent
        }).then((channel: GuildChannel) => {
            const channelUrl = `https://discord.com/channels/${interaction.guild.id}/${channel.id}`;
            const embed = new EmbedBuilder()
                .setColor(Constants.Colors.GREEN)
                .setDescription(`🎉 Channel created ➜ [Go to channel](${channelUrl}) <#${channel.id}>\n\nYou can move the channel wherever you want, even rename it, change permissions, type, etc...`)

                interaction.editReply({embeds: [embed], components: [Functions.spawnVoteTopGGButton(interaction)]});
        }).catch((err) => {
            Logger.error("CreateChannelCommand", '(onExecute)', err);
            throw new Error(`Error while creating channel: ` + err.message);
        })
    }
}