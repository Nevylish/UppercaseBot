import {
    AutocompleteInteraction,
    Colors,
    CommandInteraction,
    EmbedBuilder,
    Events,
    MessageFlags,
    WebhookClient,
} from 'discord.js';
import AboutCommand from '../commands/AboutCommand';
import AboutContextMenuCommand from '../commands/AboutContextMenuCommand';
import CreateChannelCommand from '../commands/CreateChannelCommand';
import RenameChannelCommand from '../commands/RenameChannelCommand';
import { config } from '../utils/config';
import { Functions } from '../utils/functions';
import { Logger } from '../utils/logger';
import Command from './Command';
import UppercaseClient from './UppercaseClient';

export namespace Handlers {
    export const loadEventsListeners = (client: UppercaseClient) => {
        const setActivity = () => {
            try {
                client.user?.setActivity('/about', { type: 3 });
            } catch (err) {
                Logger.error('Client', 'Failed to update activity\n', err);
            }
        };

        client.on(Events.ClientReady, () => {
            setTimeout(() => {
                setActivity();
                setInterval(setActivity, 60 * 60 * 1000 /* 1 hour */);
            }, 5 * 1000 /* 5 seconds */);
        });

        client.on(Events.GuildCreate, async (guild) => {
            try {
                if (config.webhookUrl) {
                    const webhook = new WebhookClient({ url: config.webhookUrl });

                    const owner = await guild.fetchOwner();
                    const iconURL = guild.iconURL({ size: 256 });
                    const ownerAvatarURL = owner.user.avatarURL({ size: 128 });
                    const bannerURL = guild.bannerURL({ size: 2048 });

                    const description = [
                        `\n\n👥\u2005Members: ${Functions.formatNumber(guild.memberCount)}`,
                        `\n🌍\u2005Region: ${guild.preferredLocale}`,
                        `\n🆔\u2005Guild ID: \`${guild.id}\``,
                        `\n📅\u2005Created at ${guild.createdAt.toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                        })} ${guild.createdAt.toLocaleTimeString('en-US')}`,
                        `\n\u2005\u2005\u2005\u2005\u2005\u2005\u2005(<t:${Math.floor(guild.createdTimestamp / 1000)}:R>)`,
                    ].join('');

                    const embed = new EmbedBuilder()
                        .setColor(Colors.Green)
                        .setAuthor({
                            name: guild.name,
                            iconURL: iconURL || undefined,
                        })
                        .setThumbnail(iconURL || undefined)
                        .setFooter({
                            text: `${owner.user.displayName} — ${owner.user.tag} | ${owner.user.id}`,
                            iconURL: ownerAvatarURL || undefined,
                        })
                        .setDescription(description);

                    if (bannerURL) embed.setImage(bannerURL);

                    await webhook.send({
                        username: client.user.displayName,
                        avatarURL: client.user.displayAvatarURL({ size: 256 }),
                        embeds: [embed],
                    });
                }
            } catch (err) {
                Logger.error('Client', 'Failed to send webhook notification\n', err);
            }
        });

        client.on(Events.Error, (err) => {
            Logger.error('Client', err);
        });

        client.on(Events.Warn, (warning) => {
            Logger.warn('Client', warning);
        });

        client.on(Events.InteractionCreate, async (interaction) => {
            try {
                if (interaction.isCommand()) {
                    await interactionCommandHandler(client, interaction);
                } else if (interaction.isAutocomplete()) {
                    await autoCompleteHandler(client, interaction);
                }
            } catch (err) {
                Logger.error('Handlers', 'Error in interaction listener\n', err);
            }
        });

        Logger.success('Handlers', 'Events listeners loaded');
    };

    export const loadCommands = async (client: UppercaseClient) => {
        const commands: Command[] = [
            new AboutCommand(client),
            new AboutContextMenuCommand(client),
            new CreateChannelCommand(client),
            new RenameChannelCommand(client),
        ];

        commands.forEach((command) => {
            if (command.info.name) {
                client.commands.set(command.info.name, command);
                Logger.success(
                    'Handlers',
                    `${Logger.COLORS.GREEN}${command.info.name}${Logger.COLORS.RESET} command loaded`,
                );
            }
        });

        const commandsData = commands.map((cmd) => cmd.info);

        if (client.shardId === 0) {
            if (!client.isDevEnvironment) {
                await client.application.commands.set(commandsData);
                Logger.success(
                    'Handlers',
                    `${Logger.COLORS.GREEN}Slash commands registered for all guilds. ${Logger.COLORS.RESET}(${commandsData.length} commands)`,
                );
            } else {
                const devGuild = client.guilds.cache.get('822720523234181150');
                if (devGuild) {
                    await devGuild.commands.set(commandsData);
                    Logger.success(
                        'Handlers',
                        `${Logger.COLORS.YELLOW}Slash commands registered for *dev* guild. ${Logger.COLORS.RESET}(${commandsData.length} commands)`,
                    );
                }
            }
        }
    };

    export const autoCompleteHandler = async (client: UppercaseClient, interaction: AutocompleteInteraction) => {
        const cmd = client.commands.get(interaction.commandName);
        if (!cmd || !cmd.onAutocomplete) return;

        try {
            await cmd.onAutocomplete(interaction);
        } catch (err) {
            Logger.error('Handlers', err, {
                userId: interaction.user.id,
                userTag: interaction.user.tag,
                command: interaction.commandName,
            });
        }
    };

    export const interactionCommandHandler = async (client: UppercaseClient, interaction: CommandInteraction) => {
        const { user, commandName } = interaction;
        const cmd = client.commands.get(commandName);

        if (!cmd) {
            const embed = Functions.buildEmbed('This command does not exist or has been deleted.', 'Error');
            return interaction.reply({
                embeds: [embed],
                components: [Functions.buildButtons()],
                flags: [MessageFlags.Ephemeral],
            });
        }

        try {
            await cmd.onExecute(interaction);
        } catch (err) {
            Logger.error('Handlers', err, {
                userId: user.id,
                userTag: user.tag,
                command: commandName,
            });

            try {
                const embed = Functions.buildEmbed(err.message, 'Error');

                if (interaction.deferred || interaction.replied) {
                    await interaction.editReply({ embeds: [embed], components: [Functions.buildButtons()] });
                } else {
                    await interaction.reply({
                        embeds: [embed],
                        components: [Functions.buildButtons()],
                        flags: [MessageFlags.Ephemeral],
                    });
                }
            } catch (replyErr) {
                Logger.error('Handlers', 'Failed to send error reply to user\n', replyErr);
            }
        }
    };
}
