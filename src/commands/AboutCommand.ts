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

import {ActionRowBuilder, ButtonBuilder, ButtonStyle, CacheType, CommandInteraction, EmbedBuilder} from "discord.js";
import Command from "../base/Command";
import UppercaseClient from "../base/UppercaseClient";
import {Constants} from "../utils/constants";
import moment = require("moment");

// COMMAND REQUESTED BY DISCORD STAFF FOR VERIFICATION

export default class AboutCommand extends Command {
    constructor(client: UppercaseClient) {
        super(client, {
            name: 'about',
            nameLocalizations: {
                "fr": "a-propos"
            },
            description: 'Learn more about UpperCase Bot, like commands or contact informations',
            descriptionLocalizations: {
                "fr": "Apprends-en plus à propos de Uppercase Bot, comme les commandes ou les infos de contact"
            }
        })
    }

    // COMMAND REQUESTED BY DISCORD STAFF FOR VERIFICATION

    async onExecute(interaction: CommandInteraction<CacheType>): Promise<void> {
        await interaction.deferReply({ephemeral: true});

        const embed = new EmbedBuilder()
            .setAuthor({
                iconURL: this.client.user.displayAvatarURL({size: 128}),
                name: `About ${Constants.ApplicationInformations.name}`,
                url: Constants.ApplicationInformations.website
            })
            .setColor('#2b2d31')
            .setDescription(`Hi @${interaction.member.user.username} !\n\n` +
                `${Constants.ApplicationInformations.name} is a Discord bot that allows you to create text channels with alternative uppercase letters.\nIdeal for adding a touch of originality to your Discord server and customizing your chat spaces.\n\n` +
                "**Commands list**:\n" +
                " • </create-channel:1072286509396398221>: Create a channel with alternative uppercase letters\n" +
                " • </rename-channel:1074701489303457862>: Rename existing channel with alternative uppercase letters\n\n" +
                `**Permissions**:\n${Constants.ApplicationInformations.name} need \"Manage channels\" permission on your guild to work. Members also need these permissions to use the commands.\n\n` +
                `**Privacy**:\nThe issue of privacy is a topic that is particularly important to me, which is why I have decided to NOT save ANY data concerning users, channels, their messages, or anything else. [**Privacy Policy**](${Constants.ApplicationInformations.website}/privacy)\n\n` +
                `**Need help**? **Just a question**? **Report a bug**? - Contact us at ${Constants.ApplicationInformations.mail}\n` +
                `[Terms of Service](${Constants.ApplicationInformations.website}/terms)`)
            .setFooter({text: `Copyright © ${Constants.ApplicationInformations.creationYear}-${moment().year()} ${Constants.ApplicationInformations.name} by ${Constants.DeveloperInformations.name}. All rights reserved.`})


        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setLabel("Invite")
                    .setEmoji('➕')
                    .setURL(`https://discord.com/oauth2/authorize?client_id=${this.client.user.id}&permissions=${Constants.permissions.bitfield}&scope=bot%20applications.commands`),
                /*new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setLabel("Website")
                    .setEmoji('🌐')
                    .setURL(Constants.ApplicationInformations.website),*/
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setLabel("Top.gg")
                    .setEmoji('<:topgg:1093959259890389092>')
                    .setURL('https://top.gg/bot/' + Constants.ApplicationInformations.topgg_id)
            )

        // @ts-ignore
        interaction.editReply({embeds: [embed], components: [row]});
    }
}

// COMMAND REQUESTED BY DISCORD STAFF FOR VERIFICATION