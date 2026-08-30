import {
    ApplicationCommandOptionType,
    AutocompleteInteraction,
    ChannelType,
    ChatInputCommandInteraction,
    GuildBasedChannel,
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

export default class RenameChannelCommand extends Command {
    constructor(client: UppercaseClient) {
        super(client, {
            name: 'rename-channel',
     
            description: 'Rename existing channel with uppercase letters',
            dmPermission: false,
            defaultMemberPermissions: PermissionsBitField.Flags.ManageChannels,
            options: [
                {
                    name: 'channel',
                    description: 'Select channel to rename',
                    type: ApplicationCommandOptionType.String,
                    autocomplete: true,
                    required: true,
                },
                {
                    name: 'new_name',
                    description:
                        'New name for selected channel, write with uppercase, they will be replaced by alt uppercase letters',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
            ],
        });
    }

    async onAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
        const focusedOption = interaction.options.getFocused(true);

        if (focusedOption.name !== 'channel') return;

        const query = Functions.normalizeAlternativeUppercase(focusedOption.value.replace(/^#/, ''));

        const channels = interaction.guild.channels.cache
            .filter(
                (channel) =>
                    !channel.isThread() &&
                    !channel.isVoiceBased() &&
                    channel.type !== ChannelType.GuildCategory,
            )
            .map((channel) => ({
                name: `# ${Functions.foldAlternativeUppercase(channel.name)}`.slice(0, 100),
                value: channel.id,
                normalized: Functions.normalizeAlternativeUppercase(channel.name),
            }))
            .filter((channel) => !query || channel.normalized.includes(query))
            .sort((a, b) => {
                const aStarts = a.normalized.startsWith(query);
                const bStarts = b.normalized.startsWith(query);
                if (aStarts !== bStarts) return aStarts ? -1 : 1;
                return a.normalized.localeCompare(b.normalized);
            })
            .slice(0, 25);

        await interaction.respond(channels.map(({ name, value }) => ({ name, value })));
    }

    async onExecute(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        const channelValue = interaction.options.get('channel', true)?.value as string;
        const channel_name = interaction.options.get('new_name')?.value as string;

        const channel_selected = await this.resolveChannel(interaction, channelValue);
        if (!channel_selected) {
            const embed = Functions.buildEmbed(
                'Channel not found. Please pick a channel from the autocomplete list.',
                'Error',
            );
            await interaction.editReply({
                embeds: [embed],
                components: [Functions.buildButtons()],
            });
            return;
        }

        if (!Member.isStaff(interaction.member as GuildMember)) {
            throw new InsufficientPermissions('You do not have the necessary permissions to run this command.');
        }

        if (!interaction.guild.members.me.permissions.has([PermissionsBitField.Flags.ManageChannels])) {
            throw new InsufficientPermissions(
                '**I don\'t have the necessary permissions to rename a channel.**\n\nPlease check that I have the **"Manage channels"** permission.',
            );
        }

        try {
            const channel = await channel_selected.edit({
                name: Functions.alternativeUppercaseAlgorithm(channel_name),
                reason: `@${interaction.member.user.username} used /rename-channel command`,
            });

            const channelUrl = `https://discord.com/channels/${interaction.guild.id}/${channel.id}`;
            const embed = Functions.buildEmbed(
                `🎉 **Channel renamed** ➜ [**Go to channel**](${channelUrl}) <#${channel.id}>.`,
                'Good',
            );

            await interaction.editReply({
                embeds: [embed],
                components: [Functions.buildButtons(channelUrl)],
            });
        } catch (err) {
            Logger.error('RenameChannelCommand', '(onExecute)', err);
            const embed = Functions.buildEmbed(`Failed to rename channel: **${err.message}**`, 'Error');
            await interaction.editReply({
                embeds: [embed],
                components: [Functions.buildButtons()],
            });
        }
    }

    private async resolveChannel(
        interaction: ChatInputCommandInteraction,
        value: string,
    ): Promise<GuildBasedChannel | null> {
        const byId = interaction.guild.channels.cache.get(value);
        if (byId) return byId;

        if (/^\d{17,20}$/.test(value)) {
            const fetched = await interaction.guild.channels.fetch(value).catch(() => null);
            if (fetched) return fetched;
        }

        const normalized = Functions.normalizeAlternativeUppercase(value.replace(/^#/, ''));
        return (
            interaction.guild.channels.cache.find(
                (channel) =>
                    !channel.isThread() &&
                    !channel.isVoiceBased() &&
                    channel.type !== ChannelType.GuildCategory &&
                    Functions.normalizeAlternativeUppercase(channel.name) === normalized,
            ) ?? null
        );
    }
}
