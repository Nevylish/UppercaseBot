import {
    ApplicationCommandOptionType,
    AutocompleteInteraction,
    CategoryChannelResolvable,
    ChannelType,
    ChatInputCommandInteraction,
    GuildChannel,
    GuildMember,
    MessageFlags,
    PermissionsBitField,
} from 'discord.js';
import Command from '../base/Command';
import UppercaseClient from '../base/UppercaseClient';
import InsufficientPermissions from '../exception/InsufficientPermissions';
import { Functions } from '../utils/functions';
import { Logger } from '../utils/logger';
import { Member } from '../utils/member';

export default class CreateChannelCommand extends Command {
    constructor(client: UppercaseClient) {
        super(client, {
            name: 'create-channel',
            description: 'Create channel with uppercase letters',
            dmPermission: false,
            defaultMemberPermissions: PermissionsBitField.Flags.ManageChannels,
            options: [
                {
                    name: 'channel_name',
                    description:
                        'Name for channel to create, write with uppercase, they will be replaced by alt uppercase letters',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: 'channel_type',
                    description: 'Type for channel to create, Text, Forum or Announcement. Empty: Text',
                    type: ApplicationCommandOptionType.String,
                    choices: [
                        {
                            name: 'Announcement',
                            value: ChannelType.GuildAnnouncement.toString(),
                        },
                        {
                            name: 'Forum',
                            value: ChannelType.GuildForum.toString(),
                        },
                        {
                            name: 'Text',
                            value: ChannelType.GuildText.toString(),
                        },
                    ],
                    required: false,
                },
                {
                    name: 'category',
                    description: 'Category where the channel will be created',
                    type: ApplicationCommandOptionType.String,
                    autocomplete: true,
                    required: false,
                },
            ],
        });
    }

    async onAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
        const focusedOption = interaction.options.getFocused(true);

        if (focusedOption.name === 'category') {
            const categories = interaction.guild.channels.cache
                .filter((channel) => channel.type === ChannelType.GuildCategory)
                .map((category) => ({
                    name: category.name,
                    value: category.id,
                    position: category.position,
                }))
                .sort((a, b) => a.position - b.position);

            const filtered = categories
                .filter((category) => category.name.toLowerCase().includes(focusedOption.value.toLowerCase()))
                .slice(0, 25);

            await interaction.respond(filtered.map(({ name, value }) => ({ name, value })));
        }
    }

    async onExecute(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        const channel_name = interaction.options.get('channel_name', true)?.value as string;
        let channel_type = interaction.options.get('channel_type')?.value as string | number;
        const category_id = interaction.options.get('category')?.value as string;

        if (!channel_type) channel_type = ChannelType.GuildText;
        if (!Member.isStaff(interaction.member as GuildMember)) {
            throw new InsufficientPermissions('You do not have the necessary permissions to run this command.');
        }

        if (!interaction.guild.members.me.permissions.has([PermissionsBitField.Flags.ManageChannels])) {
            throw new InsufficientPermissions(
                '**I don\'t have the necessary permissions to create a channel.**\n\nPlease check that I have the **"Manage channels"** permission.',
            );
        }

        const parent = category_id
            ? (interaction.guild.channels.cache.get(category_id) as CategoryChannelResolvable)
            : (interaction.channel.parent as CategoryChannelResolvable);

        try {
            const channel = (await interaction.guild.channels.create({
                name: Functions.alternativeUppercaseAlgorithm(channel_name),
                type: Number(channel_type),
                reason: `@${interaction.member.user.username} used /create-channel command`,
                parent: parent,
            })) as GuildChannel;

            const channelUrl = `https://discord.com/channels/${interaction.guild.id}/${channel.id}`;
            const embed = Functions.buildEmbed(
                `🎉  **Channel created** ➜ [**Go to channel**](${channelUrl}) <#${channel.id}>` +
                    `\n\nYou can move the channel wherever you want, even rename it, change permissions, type, etc...`,
                'Good',
            );

            await interaction.editReply({
                embeds: [embed],
                components: [Functions.buildButtons(channelUrl)],
            });
        } catch (err) {
            Logger.error('CreateChannelCommand', '(onExecute)', err);
            const embed = Functions.buildEmbed(`**${err.message}**`, 'Error');
            await interaction.editReply({
                embeds: [embed],
                components: [Functions.buildButtons()],
            });
        }
    }
}
