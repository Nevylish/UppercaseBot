/*
 * UppercaseBot, finally use uppercase letters for your channel names.
 * Copyright (c) 2023 Nevylish <bonjour@nevylish.fr>
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

const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    Client,
    Colors,
    CommandInteraction,
    EmbedBuilder,
    Events,
    GatewayIntentBits,
    GuildMember,
    PermissionsBitField,
    WebhookClient
} = require("discord.js");

class UpperCaseClient extends Client {
    /* permissionsInteger = 277025442833; */

    /** Locales (default: english) */
    locales = {
        channel_name_required: {
            default: "A channel name is required.",
            fr: "Un nom pour le salon est requis.",
            es: "Se requiere un nombre para el canal.",
            "pt-BR": "É necessário um nome para o canal.",
            de: "Ein Name für den Kanal ist erforderlich.",
            it: "È richiesto un nome per il canale.",
            ru: "Требуется имя для канала.",
            tr: "Kanal için bir isim gereklidir.",
            ko: "채널의 이름이 필요합니다."
        },
        missing_permissions: {
            default: "You do not have the necessary permissions to run this command.",
            fr: "Tu n'as pas les permissions nécéssaires pour utiliser cette commande.",
            es: "No tienes los permisos necesarios para usar este comando.",
            "pt-BR": "Você não possui as permissões necessárias para usar este comando.",
            de: "Du hast nicht die erforderlichen Berechtigungen, um diesen Befehl zu verwenden.",
            it: "Non hai le autorizzazioni necessarie per utilizzare questo comando.",
            ru: "У вас нет необходимых разрешений для использования этой команды.",
            tr: "Bu komutu kullanmak için gerekli izinlere sahip değilsiniz.",
            ko: "이 명령어를 사용할 수 있는 필요한 권한이 없습니다."
        },
        channel_created: {
            default: (channelId, channelUrl) => `🎉 Channel created ➜ [Go to channel <#${channelId}>](${channelUrl})\n\nYou can move the channel wherever you want, even rename it, change permissions, type, etc...`,
            fr: (channelId, channelUrl) => `🎉 Salon créé ➜ [Aller au salon <#${channelId}>](${channelUrl})\n\nTu peux déplacer le salon où tu le souhaites, le renommer, changer ses permissions, son type, etc...`,
            es: (channelId, channelUrl) => `🎉 Canal creado ➜ [Ir al canal <#${channelId}>](${channelUrl})\n\nPuedes mover el canal donde quieras, cambiarle el nombre, modificar sus permisos, tipo, etc...,`,
            "pt-BR": (channelId, channelUrl) => `🎉 Canal criado ➜ [Ir para o canal <#${channelId}>](${channelUrl})\n\nVocê pode mover o canal para onde quiser, renomeá-lo, alterar suas permissões, tipo, etc...,`,
            de: (channelId, channelUrl) => `🎉 Kanal erstellt ➜ [Zum Kanal gehen <#${channelId}>](${channelUrl})\n\nDu kannst den Kanal verschieben, umbenennen, Berechtigungen ändern, Typ usw...`,
            it: (channelId, channelUrl) => `🎉 Canale creato ➜ [Vai al canale <#${channelId}>](${channelUrl})\n\nPuoi spostare il canale dove vuoi, rinominarlo, cambiare le autorizzazioni, il tipo, ecc...`,
            ru: (channelId, channelUrl) => `🎉 Канал создан ➜ [Перейти к каналу <#${channelId}>](${channelUrl})\n\nВы можете переместить канал в любое место, переименовать`,
            tr: (channelId, channelUrl) => `🎉 Kanal oluşturuldu ➜ [Kanala git <#${channelId}>](${channelUrl})\n\nDilediğiniz yere kanalı taşıyabilir, adını değiştirebilir, izinlerini, türünü vb. değiştirebilirsiniz...`,
            ko: (channelId, channelUrl) => `🎉 채널이 생성되었습니다 ➜ [채널로 이동 <#${channelId}>](${channelUrl})\n\n채널을 원하는 위치로 이동하고, 이름을 변경하고, 권한과 유형을 변경할 수 있습니다...`
        },
        error_while_creating_channel: {
            default: 'Error while creating the channel: ',
            fr: 'Erreur lors de la création du salon: ',
            es: 'Error al crear el canal: ',
            "pt-BR": 'Erro ao criar o canal: ',
            de: 'Fehler beim Erstellen des Kanals: ',
            it: 'Errore durante la creazione del canale: ',
            ru: "Произошла ошибка при создании канала.",
            tr: "Kanal oluşturulurken bir hata oluştu.",
            ko: "채널을 생성하는 중에 오류가 발생했습니다."
        },
        channel_renamed: {
            default: (channelId, channelUrl) => `🎉 Channel renamed ➜ [Go to channel <#${channelId}>](${channelUrl}).`,
            fr: (channelId, channelUrl) => `🎉 Salon renommé ➜ [Aller au salon <#${channelId}>](${channelUrl})`,
            es: (channelId, channelUrl) => `🎉 Canal renombrado ➜ [Ir al canal <#${channelId}>](${channelUrl})`,
            "pt-BR": (channelId, channelUrl) => `🎉 Canal renomeado ➜ [Ir para o canal <#${channelId}>](${channelUrl})`,
            de: (channelId, channelUrl) => `🎉 Kanal umbenannt ➜ [Zum Kanal gehen <#${channelId}>](${channelUrl})`,
            it: (channelId, channelUrl) => `🎉 Canale rinominato ➜ [Vai al canale <#${channelId}>](${channelUrl})`,
            ru: (channelId, channelUrl) => `🎉 Канал переименован ➜ [Перейти к каналу <#${channelId}>](${channelUrl})`,
            tr: (channelId, channelUrl) => `🎉 Kanal yeniden adlandırıldı ➜ [Kanala git <#${channelId}>](${channelUrl})`,
            ko: (channelId, channelUrl) => `🎉 채널 이름 변경 ➜ [채널로 이동 <#${channelId}>](${channelUrl})`
        },
        error_while_renaming_channel: {
            default: 'Error while renaming the channel: ',
            fr: 'Erreur lors du changement de nom du salon: ',
            es: 'Error al cambiar el nombre del canal: ',
            "pt-BR": 'Erro ao renomear o canal: ',
            de: 'Fehler beim Umbenennen des Kanals: ',
            it: 'Errore durante la rinomina del canale: ',
            ru: 'Произошла ошибка при переименовании канала.',
            tr: 'Kanal yeniden adlandırılırken bir hata oluştu.',
            ko: '채널 이름을 변경하는 중에 오류가 발생했습니다.'
        },
        command_not_found: {
            default: "This command does not exist or has been deleted.",
            fr: "Cette commande n'existe pas ou a été supprimée.",
            es: "Este comando no existe o ha sido eliminado.",
            "pt-BR": "Este comando não existe ou foi excluído.",
            de: "Dieser Befehl existiert nicht oder wurde gelöscht.",
            it: "Questo comando non esiste o è stato eliminato.",
            ru: "Эта команда не существует или была удалена.",
            tr: "Bu komut mevcut değil veya silinmiş.",
            ko: "이 명령어가 존재하지 않거나 삭제되었습니다."
        },
        vote_topgg_button: {
            default: 'Vote on Top.gg (please <3)',
            fr: "Vote sur Top.gg (stp stp stp <3)",
            es: "Vota en Top.gg (por favor <3)",
            "pt-BR": "Vote no Top.gg (por favor <3)",
            de: "Stimme auf Top.gg ab (bitte <3)",
            it: "Vota su Top.gg (per favore per favore per favore <3)",
            ru: "Проголосуй на Top.gg (пожалуйста, пожалуйста, пожалуйста <3)",
            tr: "Top.gg'de oy ver (lütfen lütfen lütfen <3)",
            ko: "Top.gg에서 투표하기 (부탁드려요 부탁드려요 부탁드려요 <3)"
        }
    }

    constructor(token) {
        super({
            intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildInvites],
            allowedMentions: {
                parse: ["users"],
                repliedUser: true,
            },
            partials: ["CHANNEL", "MESSAGE", "USER"],
        });

        super.login(token).then(() => {
            this.eventsListeners();
            this.registerCommands();
        });
    }

    /**
     * Create channel with alternatives uppercase letters
     * @param {CommandInteraction} interaction
     * @returns {void}
     */
    async createChannel(interaction) {
        const channel_name = interaction?.options?.getString("channel_name");
        let channel_type = interaction?.options?.getString("channel_type");

        if (!channel_name) throw new Error(this.locales.channel_name_required[interaction.locale ?? "default"]);
        if (!channel_type) channel_type = ChannelType.GuildText;

        if (!this.isStaff(interaction.member)) {
            this.commandError(interaction, this.locales.missing_permissions[interaction.locale ?? "default"]);
            return;
        }

        await interaction.deferReply({ephemeral: true});

        interaction.guild.channels
            .create({
                name: this.replaceUppercase(channel_name),
                type: Number(channel_type),
                parent: interaction.channel.parent,
            })
            .then((channel) => {
                const channelUrl = `https://discord.com/channels/${interaction.guild.id}/${channel.id}`;
                const embed = new EmbedBuilder({
                    color: Colors.Green,
                    description:  `🎉 Channel created ➜ [Go to channel <#${channel.id}>](${channelUrl})\n\nYou can move the channel wherever you want, even rename it, change permissions, type, etc...`, // Todo: Fix translations // this.locales.channel_created[interaction.locale ?? "default"](channel.id, channelUrl)
                });

                interaction.editReply({embeds: [embed], components: [this.vote_topgg_button(interaction)]});
            })
            .catch((err) => {
                this.commandError(interaction, this.locales.error_while_creating_channel[interaction.locale ?? "default"] + `**${err.message}**`);
            });
    }

    /**
     * Rename targeted channel with alternatives uppercase letters
     * @param {CommandInteraction} interaction
     * @returns {void}
     */
    async renameChannel(interaction) {
        const channel_selected = interaction?.options?.getChannel('channel');
        const channel_name = interaction?.options?.getString('new_name');

        if (!this.isStaff(interaction.member)) {
            this.commandError(interaction, this.locales.missing_permissions[interaction.locale ?? "default"]);
            return;
        }

        await interaction.deferReply({ephemeral: true});

        channel_selected.edit({name: this.replaceUppercase(channel_name)})
            .then((channel) => {
                const channelUrl = `https://discord.com/channels/${interaction.guild.id}/${channel.id}`;
                const embed = new EmbedBuilder({
                    color: Colors.Green,
                    description: `🎉 Channel renamed ➜ [Go to channel <#${channel.id}>](${channelUrl}).` // TODO: Fix Translations // this.locales.channel_renamed[interaction.locale ?? "default"](channel.id, channelUrl)
                });

                interaction.editReply({embeds: [embed], components: [this.vote_topgg_button(interaction)]});
            })
            .catch((err) => {
                this.commandError(interaction, this.locales.error_while_renaming_channel[interaction.locale ?? "default"] + `**${err.message}**`);
            });
    }

    /**
     * Start events listerners
     * @returns {void}
     */
    eventsListeners() {
        this.on(Events.InteractionCreate, (interaction) => {
            if (!interaction.isCommand()) return;

            switch (interaction.commandName) {
                case "create-channel": {
                    this.createChannel(interaction);
                    break;
                }
                case "rename-channel": {
                    this.renameChannel(interaction);
                    break;
                }
                default: {
                    this.commandError(interaction, this.locales.command_not_found[interaction.locale ?? "default"]);
                    break;
                }
            }
        });

        this.on(Events.GuildCreate, async (guild) => {
            const webhookClient = new WebhookClient({url: 'https://discord.com/api/webhooks/1074607158324383744/ror7D1o2LADu9FdMZcbcUTVNrtVZPY0r9ssk6DOk0tjpTjiYkfnS-GKh6VrEjtj6e04b'});
            const owner = (await guild.fetchOwner());

            let description = `Members: ${guild.memberCount}`;
            if (owner) description += `\nOwner: ${owner.user.tag} (${owner.id})`;

            const embed = new EmbedBuilder()
                .setColor('Green')
                .setAuthor({
                    name: `New guild: ${guild.name}`,
                    iconURL: guild.iconURL({size: 128})
                })
                .setDescription(description)
                .setThumbnail(guild.iconURL({size: 256}));

            if (guild.splash) embed.setImage(guild.splashURL({size: 1024}));
            if (guild.banner) embed.setThumbnail(guild.bannerURL({size: 512}));
            await webhookClient.send({
                username: this.user.username,
                avatarURL: this.user.avatarURL({size: 256}),
                embeds: [embed]
            });
        });
    }

    /**
     * Globally register slash commands
     * @returns {void}
     */
    registerCommands() {
        this.application.commands
            .set([
                {
                    name: "create-channel",
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
                    description: "Create channel with UpperCase letters",
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
                    type: 1,
                    dmPermission: false,
                    defaultMemberPermissions: PermissionsBitField.Flags.ManageChannels,
                    options: [
                        {
                            name: "channel_name",
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
                            description: "Name for channel to create, write with uppercase, they will be replaced by alt uppercase letters",
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
                            type: 3,
                            required: true,
                        },
                        {
                            name: "channel_type",
                            nameLocalizations: {
                                "fr": 'type_de_salon',
                                "es-ES": 'tipo_de_canal',
                                "pt-BR": 'tipo_de_canal',
                                "it": 'tipo_di_canale',
                                "ru": 'тип_канала',
                                "tr": 'kanal_türü',
                                "ko": '채널_유형'
                            },
                            description: "Type for channel to create, Text, Forum or Announcement. Empty: Text",
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
                            type: 3,
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
                                },
                            ],
                            required: false
                        }
                    ],
                },
                {
                    name: "rename-channel",
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
                    description: "Rename existing channel with UpperCase letters",
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
                    type: 1,
                    dmPermission: false,
                    defaultMemberPermissions: PermissionsBitField.Flags.ManageChannels,
                    options: [
                        {
                            name: "channel",
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
                            description: "Select channel to rename",
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
                            type: 7,
                            required: true,
                        },
                        {
                            name: "new_name",
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
                            description: "New name for selected channel, write with uppercase, they will be replaced by alt uppercase letters",
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
                            type: 3,
                            required: true
                        }
                    ],
                },
            ])
            .then(() => console.log("Commands registered"));
    }

    /**
     * Send an error message in response to a command
     * @param {CommandInteraction} interaction
     * @param {string} err - (err/err.message) Error message to send
     * @returns {void}
     */
    commandError(interaction, err) {
        if (interaction.deferred) {
            interaction.editReply({
                embeds: [new EmbedBuilder({color: Colors.Red, description: `❗ • ${err}`})],
            });
        } else {
            interaction.reply({
                embeds: [new EmbedBuilder({color: Colors.Red, description: `❗ • ${err}`})],
                ephemeral: true
            });
        }
    }

    /**
     * Replace normal uppercase letters by alternative uppercase letters
     * @param {string} input
     * @returns {string}
     */
    replaceUppercase(input) {
        const upper = [
            "𝖠", "𝖡", "𝖢", "𝖣", "𝖤", "𝖥", "𝖦", "𝖧", "𝖨", "𝖩", "𝖪", "𝖫", "𝖬", "𝖭", "𝖮", "𝖯", "𝖰", "𝖱", "𝖲", "𝖳", "𝖴", "𝖵", "𝖶", "𝖷", "𝖸", "𝖹",
        ];
        let output = "";

        for (let str of input) {
            if (str >= "A" && str <= "Z") {
                output += upper[str.charCodeAt(0) - 65];
            } else if (str === " ") {
                output += "-";
            } else {
                output += str;
            }
        }

        return output;
    }

    /**
     * Check if GuildMember have staff permissions
     * @param {GuildMember} member - Guild member for whom permissions will be checked
     * @returns {boolean}
     */
    isStaff = (member) => [PermissionsBitField.Flags.Administrator, PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.BanMembers, PermissionsBitField.Flags.ManageGuild].some(p => member.permissions.has(p, true));

    /** Return ready Top.gg vote button component for embeds
     * @param {CommandInteraction} interaction
     * @returns {ActionRowBuilder}
     */
    vote_topgg_button = (interaction) => {
        return new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setLabel(this.locales.vote_topgg_button[interaction.locale ?? "default"] ?? "Vote on Top.gg (please <3)")
                    .setEmoji('<:topgg:1093959259890389092>')
                    .setURL('https://top.gg/bot/1072283043739467807/vote')
            )
    }
}

module.exports = UpperCaseClient;
