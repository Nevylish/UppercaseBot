const {
    ChannelType,
    Client,
    GatewayIntentBits,
    Events,
    EmbedBuilder,
    Colors,
    WebhookClient,
    PermissionsBitField
} = require("discord.js");

class UpperCaseClient extends Client {
    permissionsInteger = 277025442833;

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

    // Commands
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

    async renameChannel(interaction) {
        const channel_selected = interaction?.options?.getChannel('channel');
        const channel_name = interaction?.options?.getString('name');

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

    // Base
    eventsListeners() {
        this.on(Events.InteractionCreate, (interaction) => {
            if (!interaction.isCommand()) return;

            switch (interaction.commandName) {
                case "create-channel": {
                    this.createChannel(interaction).catch((err) =>
                        this.commandError(interaction, err.message)
                    );
                    break;
                }
                case "rename-channel": {
                    this.renameChannel(interaction).catch((err) =>
                        this.commandError(interaction, err.message)
                    );
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
                    name: 'New guild: ' + guild.name + ' / ' + guild.nameAcronym,
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

    registerCommands() {
        const commands = [
            {
                name: "create-channel",
                description: "Create channel with UpperCase",
                type: 1,
                options: [
                    {
                        name: "channel_name",
                        description:
                            "Name for channel to create, write with Upper Case",
                        type: 3,
                        required: true,
                    },
                    {
                        name: "channel_type",
                        description:
                            "Type for channel to create, Text, Forum or Announcement. Empty: Text",
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
                description: "Rename existing channel with UpperCase",
                type: 1,
                options: [
                    {
                        name: "channel",
                        description:
                            "Select channel to rename",
                        type: 7,
                        required: true,
                    },
                    {
                        name: "name",
                        description:
                            "Name for channel to rename, write with Upper Case",
                        type: 3,
                        required: true
                    }
                ],
            },
        ];

        this.application.commands
            .set(commands)
            .then(() => console.log("Commands registered"));
    }

    // Functions
    commandError(interaction, err) {
        interaction.reply({
            embeds: [new EmbedBuilder({color: Colors.Red, description: `❗ • ${err}`})],
            ephemeral: true
        });
    }

    replaceUppercase(inputString) {
        const upper = [
            "𝖠", "𝖡", "𝖢", "𝖣", "𝖤", "𝖥", "𝖦", "𝖧", "𝖨", "𝖩", "𝖪", "𝖫", "𝖬", "𝖭", "𝖮", "𝖯", "𝖰", "𝖱", "𝖲", "𝖳", "𝖴", "𝖵", "𝖶", "𝖷", "𝖸", "𝖹",
        ];
        let outputString = "";

        for (let i = 0; i < inputString.length; i++) {
            let char = inputString[i];
            if (char >= "A" && char <= "Z") {
                outputString += upper[char.charCodeAt(0) - 65];
            } else if (char === " ") {
                outputString += "-";
            } else {
                outputString += char;
            }
        }

        return outputString;
    }

    isStaff = (member) => [PermissionsBitField.Flags.Administrator, PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.BanMembers, PermissionsBitField.Flags.ManageGuild].some(p => member.permissions.has(p, true));
}

module.exports = UpperCaseClient;
