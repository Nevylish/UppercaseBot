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
    ChatInputCommandInteraction,
    GuildChannel,
    GuildMember,
    MessageFlags,
    PermissionsBitField,
} from 'discord.js';
import Command from '../base/Command';
import UppercaseClient from '../base/UppercaseClient';
import { Functions } from '../utils/functions';
import { Member } from '../utils/member';
import InsufficientPermissions from '../exception/InsufficientPermissions';
import { Logger } from '../utils/logger';

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
                    type: ApplicationCommandOptionType.Channel,
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

    async onExecute(interaction: ChatInputCommandInteraction): Promise<void> {
        const channel_selected = interaction.options.get('channel')?.channel as GuildChannel;
        const channel_name = interaction.options.get('new_name')?.value as string;

        if (!Member.isStaff(interaction.member as GuildMember)) {
            throw new InsufficientPermissions('You do not have the necessary permissions to run this command.');
        }

        if (!interaction.guild.members.me.permissions.has([PermissionsBitField.Flags.ManageChannels])) {
            throw new InsufficientPermissions(
                '**I don\'t have the necessary permissions to rename a channel.**\n\nPlease check that I have the **"Manage channels"** permission.',
            );
        }

        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        try {
            const channel = await channel_selected.edit({
                name: Functions.alternativeUppercaseAlgorithm(channel_name),
                reason: `@${interaction.member.user.username} used /rename-channel command`,
            });

            const channelUrl = `https://discord.com/channels/${interaction.guild.id}/${channel.id}`;
            const embed = Functions.buildEmbed(
                `🎉 Channel renamed ➜ [**Go to channel**](${channelUrl}) <#${channel.id}>.`,
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
}
