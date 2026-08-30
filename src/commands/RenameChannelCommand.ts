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

import {
    ApplicationCommandOptionType,
    AutocompleteInteraction,
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
            /*nameLocalizations: {
                fr: 'renommer-un-salon',
                'es-ES': 'renombrar-canal',
                'pt-BR': 'renomear-canal',
                de: 'kanal-umbenennen',
                it: 'rinomina-canale',
                ru: 'переименовать-канал',
                tr: 'kanalı-yeniden-adlandır',
                ko: '채널-이름-변경',
            },*/
            description: 'Rename existing channel with uppercase letters',
            descriptionLocalizations: {
                fr: 'Renommer un salon existant avec des lettres majuscules alternatives',
                'es-ES': 'Renombrar un canal existente con letras en mayúscula alternativas',
                'pt-BR': 'Renomear um canal existente com letras maiúsculas alternativas',
                de: 'Vorhandenen Kanal mit Großbuchstaben umbenennen',
                it: 'Rinomina il canale esistente con lettere maiuscole alternative',
                ru: 'Переименовать существующий канал с использованием альтернативных прописных букв',
                tr: 'Varolan kanalı büyük harfli harflerle yeniden adlandır',
                ko: '기존 채널의 이름을 대문자 대체로 변경',
            },
            dmPermission: false,
            defaultMemberPermissions: PermissionsBitField.Flags.ManageChannels,
            options: [
                {
                    name: 'channel',
                    nameLocalizations: {
                        fr: 'salon',
                        'es-ES': 'canal',
                        'pt-BR': 'canal',
                        de: 'kanal',
                        it: 'canale',
                        ru: 'канал',
                        tr: 'kanal',
                        ko: '채널',
                    },
                    description: 'Select channel to rename',
                    descriptionLocalizations: {
                        fr: 'Sélectionne le salon à renommer',
                        'es-ES': 'Selecciona el canal para renombrar',
                        'pt-BR': 'Selecione o canal para renomear',
                        de: 'Wähle den zu umbenennenden Kanal aus',
                        it: 'Seleziona il canale da rinominare',
                        ru: 'Выберите канал для переименования',
                        tr: 'Yeniden adlandırmak için kanal seçin',
                        ko: '이름을 변경할 채널을 선택하세요',
                    },
                    type: ApplicationCommandOptionType.String,
                    autocomplete: true,
                    required: true,
                },
                {
                    name: 'new_name',
                    nameLocalizations: {
                        fr: 'nouveau_nom',
                        'es-ES': 'nuevo_nombre',
                        'pt-BR': 'novo_nome',
                        de: 'neuer_name',
                        it: 'nuovo_nome',
                        ru: 'новое_имя',
                        tr: 'yeni_ad',
                        ko: '새_이름',
                    },
                    description:
                        'New name for selected channel, write with uppercase, they will be replaced by alt uppercase letters',
                    descriptionLocalizations: {
                        fr: 'Nouveau nom pour le salon, utilise des lettres maj, elles seront remplacées par des maj alternatives',
                        'es-ES': 'Nuevo nombre para el canal seleccionado, escríbelo conletas mayúsculas',
                        'pt-BR': 'Novo nome para o canal selecionado, escreva com letras maiúsculas',
                        de: 'Neuer Name für den ausgewählten Kanal, schreibe ihn mit Großbuchstaben',
                        it: 'Nuovo nome per il canale selezionato, scrivi in maiuscolo',
                        ru: 'Новое имя для выбранного канала, пишите заглавные буквы',
                        tr: 'Seçilen kanal için yeni ad, büyük harflerle yazın',
                        ko: '선택한 채널에 대한 새 이름을 대문자로 작성하세요. 대문자 대체로 교체됩니다',
                    },
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
            ],
        });
    }

    async onAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
        const focusedOption = interaction.options.getFocused(true);

        if (focusedOption.name !== 'channel') return;

        const query = Functions.normalizeAlternativeUppercase(focusedOption.value);

        const channels = interaction.guild.channels.cache
            .filter((channel) => !channel.isThread())
            .map((channel) => ({
                name: channel.name.slice(0, 100),
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

        const normalized = Functions.normalizeAlternativeUppercase(value);
        return (
            interaction.guild.channels.cache.find(
                (channel) =>
                    !channel.isThread() && Functions.normalizeAlternativeUppercase(channel.name) === normalized,
            ) ?? null
        );
    }
}
