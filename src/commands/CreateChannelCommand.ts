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
    CategoryChannelResolvable,
    ChannelType,
    CommandInteraction,
    EmbedBuilder,
    GuildChannel,
    GuildMember,
    MessageFlags,
    PermissionsBitField,
} from 'discord.js';
import Command from '../base/Command';
import UppercaseClient from '../base/UppercaseClient';
import { Member } from '../utils/member';
import InsufficientPermissions from '../exception/InsufficientPermissions';
import { Functions } from '../utils/functions';
import { Constants } from '../utils/constants';
import { Logger } from '../utils/logger';

export default class CreateChannelCommand extends Command {
    constructor(client: UppercaseClient) {
        super(client, {
            name: 'create-channel',
            /*nameLocalizations: {
                fr: 'créer-un-salon',
                'es-ES': 'crear-un-canal',
                'pt-BR': 'criar-um-canal',
                de: 'kanal-erstellen',
                it: 'crea-un-canale',
                ru: 'создать-канал',
                tr: 'kanal-oluştur',
                ko: '채널-생성',
            },*/
            description: 'Create channel with uppercase letters',
            descriptionLocalizations: {
                fr: 'Créer un salon avec des lettres majuscules alternatives',
                'es-ES': 'Crear un canal con letras en mayúsculas alternas',
                'pt-BR': 'Criar um canal com letras em maiúsculas alternadas',
                de: 'Kanal mit Großbuchstaben erstellen',
                it: 'Crea un canale con lettere in maiuscolo alternative',
                ru: 'Создать канал с буквами в верхнем регистре',
                tr: 'Büyük harfli harflerle kanal oluştur',
                ko: '대문자 알파벳을 사용하여 채널 생성',
            },
            dmPermission: false,
            defaultMemberPermissions: PermissionsBitField.Flags.ManageChannels,
            options: [
                {
                    name: 'channel_name',
                    nameLocalizations: {
                        fr: 'nom_du_salon',
                        'es-ES': 'nombre_del_canal',
                        'pt-BR': 'nome_do_canal',
                        de: 'kanalname',
                        it: 'nome_del_canale',
                        ru: 'имя_канала',
                        tr: 'kanal_adı',
                        ko: '채널_이름',
                    },
                    description:
                        'Name for channel to create, write with uppercase, they will be replaced by alt uppercase letters',
                    descriptionLocalizations: {
                        fr: 'Nom du salon à créer, utilise des lettres maj, elles seront remplacées par des maj alternatives',
                        'es-ES':
                            'Nombre del canal a crear, escriba en mayúsculas, se reemplazarán por letras mayúsculas alt',
                        'pt-BR': 'Nome do canal para criar, escreva em letras maiúsculas',
                        de: 'Name für zu erstellenden Kanal, schreibe mit Großbuchstaben',
                        it: 'Nome del canale da creare, scrivi in maiuscolo',
                        ru: 'Имя канала для создания, напишите заглавные буквы',
                        tr: 'Oluşturulacak kanalın adı, büyük harfle yazın, alternatif büyük harflerle değiştirilecektir',
                        ko: '생성할 채널의 이름, 대문자로 작성하고, 대문자 대체 문자로 교체됩니다',
                    },
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: 'channel_type',
                    nameLocalizations: {
                        fr: 'type_de_salon',
                        'es-ES': 'tipo_de_canal',
                        'pt-BR': 'tipo_de_canal',
                        it: 'tipo_di_canale',
                        ru: 'тип_канала',
                        tr: 'kanal_türü',
                        ko: '채널_유형',
                    },
                    description: 'Type for channel to create, Text, Forum or Announcement. Empty: Text',
                    descriptionLocalizations: {
                        fr: 'Type de salon à créer, Textuel, Forum ou Annonces. Vide: Textuel',
                        'es-ES': 'Tipo de canal a crear',
                        'pt-BR': 'Tipo de canal para criar',
                        de: 'Typ des zu erstellenden Kanals',
                        it: 'Tipo di canale da creare',
                        ru: 'Тип создаваемого канала',
                        tr: 'Oluşturulacak kanalın türü',
                        ko: '생성할 채널의 유형',
                    },
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
                    nameLocalizations: {
                        fr: 'catégorie',
                        'es-ES': 'categoría',
                        'pt-BR': 'categoria',
                        de: 'kategorie',
                        it: 'categoria',
                        ru: 'категория',
                        tr: 'kategori',
                        ko: '카테고리',
                    },
                    description: 'Category where the channel will be created',
                    descriptionLocalizations: {
                        fr: 'Catégorie dans laquelle le salon sera créé',
                        'es-ES': 'Categoría donde se creará el canal',
                        'pt-BR': 'Categoria onde o canal será criado',
                        de: 'Kategorie, in der der Kanal erstellt wird',
                        it: 'Categoria in cui verrà creato il canale',
                        ru: 'Категория, в которой будет создан канал',
                        tr: 'Kanalın oluşturulacağı kategori',
                        ko: '채널이 생성될 카테고리',
                    },
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

    async onExecute(interaction: CommandInteraction): Promise<void> {
        const channel_name = interaction.options.get('channel_name')?.value as string;
        let channel_type = interaction.options.get('channel_type')?.value as string | number;
        const category_id = interaction.options.get('category')?.value as string;

        if (!channel_type) channel_type = ChannelType.GuildText;
        if (!Member.isStaff(interaction.member as GuildMember)) {
            throw new InsufficientPermissions('You do not have the necessary permissions to run this command.');
        }

        if (!interaction.guild.members.me.permissions.has([PermissionsBitField.Flags.ManageChannels])) {
            throw new InsufficientPermissions(
                '**I don\'t have the necessary permissions to rename a channel.**\n\nPlease check that I have the **"Manage channels"** permission.',
            );
        }

        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        const parent = category_id
            ? (interaction.guild.channels.cache.get(category_id) as CategoryChannelResolvable)
            : (interaction.channel.parent as CategoryChannelResolvable);

        interaction.guild.channels
            .create({
                name: Functions.alternativeUppercaseAlgorithm(channel_name),
                type: Number(channel_type),
                reason: `@${interaction.member.user.username} used /create-channel command`,
                parent: parent,
            })
            .then((channel: GuildChannel) => {
                const channelUrl = `https://discord.com/channels/${interaction.guild.id}/${channel.id}`;
                const embed = new EmbedBuilder()
                    .setColor(Constants.Colors.GREEN)
                    .setDescription(
                        `🎉 Channel created ➜ [Go to channel](${channelUrl}) <#${channel.id}>\n\nYou can move the channel wherever you want, even rename it, change permissions, type, etc...`,
                    );

                interaction.editReply({
                    embeds: [embed],
                    components: [Functions.spawnVoteTopGGButton(interaction)],
                });
            })
            .catch((err) => {
                Logger.error('CreateChannelCommand', '(onExecute)', err);
                interaction.editReply({
                    embeds: [Functions.buildErrorEmbed(`Error while creating channel: **${err.message}**`)],
                });
                throw new Error(`Error while creating channel: ` + err.message);
            });
    }
}
