/*
 * Finally, use uppercase letters for your channel names.
 * Copyright (C) 2025 UpperCase Bot by Nevylish
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { Logger } from '../utils/logger';
import UppercaseClient from './UppercaseClient';
import Command from './Command';
import {
    AutocompleteInteraction,
    Colors,
    CommandInteraction,
    EmbedBuilder,
    Events,
    MessageFlags,
    WebhookClient,
} from 'discord.js';
import { Functions } from '../utils/functions';
import CreateChannelCommand from '../commands/CreateChannelCommand';
import RenameChannelCommand from '../commands/RenameChannelCommand';
import { config } from '../utils/config';
import { Constants } from '../utils/constants';
import AboutCommand from '../commands/AboutCommand';
import AboutContextMenuCommand from '../commands/AboutContextMenuCommand';

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
                    const embed = new EmbedBuilder()
                        .setColor(Colors.Green)
                        .setAuthor({ name: `${guild.name}` })
                        .setDescription(
                            `\n\n👥\u1CBCMembers: ${Functions.formatNumber(guild.memberCount)}` +
                                `\n🌍\u1CBCRegion: ${guild.preferredLocale}` +
                                `\n🆔\u1CBCGuild ID: ${guild.id}` +
                                `\n📅\u1CBCCreated <t:${Math.floor(guild.createdTimestamp / 1000)}:R>`,
                        )
                        .setFooter({
                            text: `${owner.user.displayName} • ${owner.user.tag} | ${owner.user.id}`,
                        });

                    const iconURL = guild.iconURL({ size: 4096 });
                    if (iconURL) {
                        embed.setAuthor({ name: `${guild.name}`, iconURL: iconURL });
                        embed.setThumbnail(iconURL);
                    }

                    const ownerAvatarURL = owner.user.avatarURL({ size: 4096 });
                    if (ownerAvatarURL) {
                        embed.setFooter({
                            text: `${owner.user.displayName} • ${owner.user.tag} | ${owner.user.id}`,
                            iconURL: ownerAvatarURL,
                        });
                    }

                    const bannerURL = guild.bannerURL({ size: 4096 });
                    if (bannerURL) {
                        embed.setImage(bannerURL);
                    }

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
            if (interaction.isCommand()) {
                await interactionCommandHandler(client, interaction);
            } else if (interaction.isAutocomplete()) {
                await autoCompleteHandler(client, interaction);
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
            const embed = Functions.buildEmbed(err.message, 'Error');

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [embed], components: [Functions.buildButtons()] });
            } else {
                await interaction.reply({
                    embeds: [embed],
                    components: [Functions.buildButtons()],
                    flags: [MessageFlags.Ephemeral],
                });
            }

            Logger.error('Handlers', err, {
                userId: user.id,
                userTag: user.tag,
                command: commandName,
            });
        }
    };
}
