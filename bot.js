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
    ChannelType,
    Client,
    GatewayIntentBits,
    Events,
    EmbedBuilder,
    CommandInteraction,
    GuildMember,
    Colors,
    WebhookClient,
    PermissionsBitField
} = require("discord.js");

class UpperCaseClient extends Client {
    // permissionsInteger = 277025442833;

    constructor(token) {
        super({
            intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildInvites],
            allowedMentions: {
                parse: ["users"],
                repliedUser: false,
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

        if (!channel_name) throw new Error("A channel name is required.");
        if (!channel_type) channel_type = ChannelType.GuildText;

        if (!this.isStaff(interaction.member)) {
            this.commandError(interaction, 'You do not have the necessary permissions to run this command.');
            return;
        }

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
                    description: `🎉 Channel created ➜ [Go to channel <#${channel.id}>](${channelUrl})\n\nYou can move the channel wherever you want, even rename it, change permissions, type, etc...`
                });

                interaction.reply({embeds: [embed], ephemeral: true});
            })
            .catch((err) => {
                this.commandError(interaction, `Error while creating the channel: **${err.message}**`);
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
            this.commandError(interaction, 'You do not have the necessary permissions to run this command.');
            return;
        }

        channel_selected.edit({name: this.replaceUppercase(channel_name)})
            .then((channel) => {
                const channelUrl = `https://discord.com/channels/${interaction.guild.id}/${channel.id}`;
                const embed = new EmbedBuilder({
                    color: Colors.Green,
                    description: `🎉 Channel renamed ➜ [Go to channel <#${channel.id}>](${channelUrl}).`
                });

                interaction.reply({embeds: [embed], ephemeral: true});
            })
            .catch((err) => {
                this.commandError(interaction, `Error while renaming the channel: **${err.message}**`);
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
                    this.commandError(interaction, 'This command does not exist or has been deleted.');
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
            webhookClient.send({
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
                        fr: 'créer-un-salon'
                    },
                    description: "Create channel with UpperCase letters",
                    descriptionLocalizations: {
                        fr: 'Créer un salon avec des lettres majuscules alternatives'
                    },
                    type: 1,
                    options: [
                        {
                            name: "channel_name",
                            nameLocalizations: {
                                fr: 'nom_du_salon'
                            },
                            description: "Name for channel to create, write with uppercase, they will be replaced by alt uppercase letters",
                            descriptionLocalizations: {
                                fr: 'Nom du salon à créer, utilise des lettres maj, elles seront remplacées par des maj alternatives'
                            },
                            type: 3,
                            required: true,
                        },
                        {
                            name: "channel_type",
                            nameLocalizations: {
                                fr: 'type_de_salon'
                            },
                            description: "Type for channel to create, Text, Forum or Announcement. Empty: Text",
                            descriptionLocalizations: {
                                fr: 'Type de salon à créer, Textuel, Forum ou Annonces. Vide: Textuel'
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
                        fr: 'renommer-un-salon'
                    },
                    description: "Rename existing channel with UpperCase letters",
                    descriptionLocalizations: {
                        fr: 'Renommer un salon existant avec des lettres majuscules alternatives'
                    },
                    type: 1,
                    options: [
                        {
                            name: "channel",
                            nameLocalizations: {
                                fr: 'salon'
                            },
                            description: "Select channel to rename",
                            descriptionLocalizations: {
                                fr: 'Sélectionne le salon à renommer'
                            },
                            type: 7,
                            required: true,
                        },
                        {
                            name: "new_name",
                            nameLocalizations: {
                                fr: 'nouveau_nom'
                            },
                            description: "New name for selected channel, write with uppercase, they will be replaced by alt uppercase letters",
                            descriptionLocalizations: {
                                fr: 'Nouveau nom pour le salon, utilise des lettres maj, elles seront remplacées par des maj alternatives'
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
        interaction.reply({
            embeds: [new EmbedBuilder({color: Colors.Red, description: `❗ • ${err}`})],
            ephemeral: true
        });
    }

    /**
     * Replace real uppercase letters by alternative uppercase letters.
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
}

module.exports = UpperCaseClient;
