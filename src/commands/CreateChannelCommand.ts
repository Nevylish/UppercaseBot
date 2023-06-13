import { CommandInteraction, ChannelType, GuildMember, EmbedBuilder, GuildChannel, ApplicationCommandOptionType, CategoryChannelResolvable, PermissionsBitField } from "discord.js";
import Command from "../base/Command";
import UppercaseClient from "../base/UppercaseClient";
import { Member } from "../utils/member";
import InsufficientPermissions from "../exception/InsufficientPermissions";
import { Functions } from "../utils/functions";
import { Constants } from "../utils/constants";
import { Logger } from "../utils/logger";
import BadCommandUsage from "../exception/BadCommandUsage";

export default class CreateChannelCommand extends Command {
    constructor(client: UppercaseClient) {
        super(client, {
            name: 'create-channel',
            nameLocalizations: {
                "fr": 'créer-un-salon',
                "es-ES": 'crear-un-canal',
                "pt-BR": 'criar-um-canal',
                "de": 'kanal-erstellen',
                "it": 'crea-un-canale',
                "ru": 'создать-канал',
                "tr": 'kanal-oluştur',
                "ko": '채널-생성'
            },
            description: 'Create channel with uppercase letters',
            descriptionLocalizations: {
                "fr": 'Créer un salon avec des lettres majuscules alternatives',
                "es-ES": 'Crear un canal con letras en mayúsculas alternas',
                "pt-BR": 'Criar um canal com letras em maiúsculas alternadas',
                "de": 'Kanal mit Großbuchstaben erstellen',
                "it": 'Crea un canale con lettere in maiuscolo alternative',
                "ru": 'Создать канал с буквами в верхнем регистре',
                "tr": 'Büyük harfli harflerle kanal oluştur',
                "ko": '대문자 알파벳을 사용하여 채널 생성'
            },
            dmPermission: false,
            defaultMemberPermissions: PermissionsBitField.Flags.ManageChannels,
            options: [
                {
                    name: 'channel_name',
                    nameLocalizations: {
                        "fr": 'nom_du_salon',
                        "es-ES": 'nombre_del_canal',
                        "pt-BR": 'nome_do_canal',
                        "de": 'kanalname',
                        "it": 'nome_del_canale',
                        "ru": 'имя_канала',
                        "tr": 'kanal_adı',
                        "ko": '채널_이름'
                    },
                    description: 'Name for channel to create, write with uppercase, they will be replaced by alt uppercase letters',
                    descriptionLocalizations: {
                        "fr": 'Nom du salon à créer, utilise des lettres maj, elles seront remplacées par des maj alternatives',
                        "es-ES": 'Nombre del canal a crear, escriba en mayúsculas, se reemplazarán por letras mayúsculas alt',
                        "pt-BR": 'Nome do canal para criar, escreva em letras maiúsculas',
                        "de": 'Name für zu erstellenden Kanal, schreibe mit Großbuchstaben',
                        "it": 'Nome del canale da creare, scrivi in maiuscolo',
                        "ru": 'Имя канала для создания, напишите заглавные буквы',
                        "tr": 'Oluşturulacak kanalın adı, büyük harfle yazın, alternatif büyük harflerle değiştirilecektir',
                        "ko": '생성할 채널의 이름, 대문자로 작성하고, 대문자 대체 문자로 교체됩니다'
                    },
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: 'channel_type',
                    nameLocalizations: {
                        "fr": 'type_de_salon',
                        "es-ES": 'tipo_de_canal',
                        "pt-BR": 'tipo_de_canal',
                        "it": 'tipo_di_canale',
                        "ru": 'тип_канала',
                        "tr": 'kanal_türü',
                        "ko": '채널_유형'
                    },
                    description: 'Type for channel to create, Text, Forum or Announcement. Empty: Text',
                    descriptionLocalizations: {
                        "fr": 'Type de salon à créer, Textuel, Forum ou Annonces. Vide: Textuel',
                        "es-ES": 'Tipo de canal a crear',
                        "pt-BR": 'Tipo de canal para criar',
                        "de": 'Typ des zu erstellenden Kanals',
                        "it": 'Tipo di canale da creare',
                        "ru": 'Тип создаваемого канала',
                        "tr": 'Oluşturulacak kanalın türü',
                        "ko": '생성할 채널의 유형'
                    },
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
            throw new InsufficientPermissions('You do not have the necessary permissions to run this command.');
        }

        if (!interaction.guild.members.me.permissions.has([PermissionsBitField.Flags.ManageChannels])) {
            throw new BadCommandUsage("**I don't have the necessary permissions to rename a channel.**\n\nPlease check that I have the **\"Manage channels\"** permission.");
        }

        await interaction.deferReply({ephemeral: true});

        interaction.guild.channels.create({
            name: Functions.alternativeUppercaseAlgorithm(channel_name),
            type: Number(channel_type),
            reason: `@${interaction.member.user.username} used /create-channel command with Uppercase Bot`,
            parent: (interaction.channel.parent as CategoryChannelResolvable)
        }).then((channel: GuildChannel) => {
            const channelUrl = `https://discord.com/channels/${interaction.guild.id}/${channel.id}`;
            const embed = new EmbedBuilder()
                .setColor(Constants.Colors.GREEN)
                .setDescription(`🎉 Channel created ➜ [Go to channel](${channelUrl}) <#${channel.id}>\n\nYou can move the channel wherever you want, even rename it, change permissions, type, etc...`)

                interaction.editReply({embeds: [embed], components: [Functions.spawnVoteTopGGButton(interaction)]});
        }).catch((err) => {
            Logger.error("CreateChannelCommand", '(onExecute)', err);
            interaction.editReply(
                {
                    embeds: [
                        Functions.buildErrorEmbed(`Error while creating channel: **${err.message}**`)
                    ]
                }
            );
            throw new Error(`Error while creating channel: ` + err.message);
        })
    }
}