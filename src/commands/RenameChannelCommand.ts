import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder, GuildChannel, GuildMember, PermissionsBitField } from "discord.js";
import Command from "../base/Command";
import UppercaseClient from "../base/UppercaseClient";
import { Functions } from "../utils/functions";
import { Member } from "../utils/member";
import InsufficientPermissions from "../exception/InsufficientPermissions";
import { Constants } from "../utils/constants";
import { Logger } from "../utils/logger";
import BadCommandUsage from "../exception/BadCommandUsage";

export default class RenameChannelCommand extends Command {
    constructor(client: UppercaseClient) {
        super(client, {
            name: 'rename-channel',
            nameLocalizations: {
                "fr": 'renommer-un-salon',
                "es-ES": 'renombrar-canal',
                "pt-BR": 'renomear-canal',
                "de": 'kanal-umbenennen',
                "it": 'rinomina-canale',
                "ru": 'переименовать-канал',
                "tr": 'kanalı-yeniden-adlandır',
                "ko": '채널-이름-변경'
            },
            description: 'Rename existing channel with uppercase letters',
            descriptionLocalizations: {
                "fr": 'Renommer un salon existant avec des lettres majuscules alternatives',
                "es-ES": 'Renombrar un canal existente con letras en mayúscula alternativas',
                "pt-BR": 'Renomear um canal existente com letras maiúsculas alternativas',
                "de": 'Vorhandenen Kanal mit Großbuchstaben umbenennen',
                "it": 'Rinomina il canale esistente con lettere maiuscole alternative',
                "ru": 'Переименовать существующий канал с использованием альтернативных прописных букв',
                "tr": 'Varolan kanalı büyük harfli harflerle yeniden adlandır',
                "ko": '기존 채널의 이름을 대문자 대체로 변경'
            },
            dmPermission: false,
            defaultMemberPermissions: [PermissionsBitField.Flags.Administrator, PermissionsBitField.Flags.BanMembers, PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.ManageGuild],
            options: [
                {
                    name: 'channel',
                    nameLocalizations: {
                        "fr": 'salon',
                        "es-ES": 'canal',
                        "pt-BR": 'canal',
                        "de": 'kanal',
                        "it": 'canale',
                        "ru": 'канал',
                        "tr": 'kanal',
                        "ko": '채널'
                    },
                    description: 'Select channel to rename',
                    descriptionLocalizations: {
                        "fr": 'Sélectionne le salon à renommer',
                        "es-ES": 'Selecciona el canal para renombrar',
                        "pt-BR": 'Selecione o canal para renomear',
                        "de": 'Wähle den zu umbenennenden Kanal aus',
                        "it": 'Seleziona il canale da rinominare',
                        "ru": 'Выберите канал для переименования',
                        "tr": 'Yeniden adlandırmak için kanal seçin',
                        "ko": '이름을 변경할 채널을 선택하세요'
                    },
                    type: ApplicationCommandOptionType.Channel,
                    required: true
                },
                {
                    name: 'new_name',
                    nameLocalizations: {
                        "fr": 'nouveau_nom',
                        "es-ES": 'nuevo_nombre',
                        "pt-BR": 'novo_nome',
                        "de": 'neuer_name',
                        "it": 'nuovo_nome',
                        "ru": 'новое_имя',
                        "tr": 'yeni_ad',
                        "ko": '새_이름'
                    },
                    description: 'New name for selected channel, write with uppercase, they will be replaced by alt uppercase letters',
                    descriptionLocalizations: {
                        "fr": 'Nouveau nom pour le salon, utilise des lettres maj, elles seront remplacées par des maj alternatives',
                        "es-ES": 'Nuevo nombre para el canal seleccionado, escríbelo conletas mayúsculas',
                        "pt-BR": 'Novo nome para o canal selecionado, escreva com letras maiúsculas',
                        "de": 'Neuer Name für den ausgewählten Kanal, schreibe ihn mit Großbuchstaben',
                        "it": 'Nuovo nome per il canale selezionato, scrivi in maiuscolo',
                        "ru": 'Новое имя для выбранного канала, пишите заглавные буквы',
                        "tr": 'Seçilen kanal için yeni ad, büyük harflerle yazın',
                        "ko": '선택한 채널에 대한 새 이름을 대문자로 작성하세요. 대문자 대체로 교체됩니다'
                    },
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

        if (!interaction.guild.members.me.permissions.has([PermissionsBitField.Flags.ManageChannels])) {
            throw new BadCommandUsage("**I don't have the necessary permissions to rename a channel.**\n\nPlease check that I have the **\"Manage channels\"** permission.\n\nIf you still don't understand why I don't have the permission, give me the **\"Administrator\"** permission or an admin role.")
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