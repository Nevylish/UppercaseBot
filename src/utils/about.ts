import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CacheType,
    Colors,
    CommandInteraction,
    ContextMenuCommandInteraction,
    EmbedBuilder,
} from 'discord.js';
import moment = require('moment');
import { Functions } from './functions';
import { Constants } from './constants';
import UppercaseClient from '../base/UppercaseClient';

export namespace About {
    export const getEmbeds = (
        interaction: CommandInteraction<CacheType> | ContextMenuCommandInteraction<CacheType>,
        client: UppercaseClient,
    ) => {
        const first_embed = new EmbedBuilder()
            .setAuthor({
                iconURL: interaction.user.displayAvatarURL({ size: 256 }),
                name: `Hey ${interaction.user.displayName} 👋`,
            })
            .setColor(Colors.Blurple)
            .setDescription(
                `${Constants.ApplicationInformations.name} allows you to create text channels with uppercase letters.\nIdeal for adding a touch of originality to your server.`,
            )
            .addFields(
                {
                    name: 'Before',
                    value: '\`#a-super-channel\` 💤',
                    inline: true,
                },
                {
                    name: 'After',
                    value: `\`#${Functions.alternativeUppercaseAlgorithm('A SUPER Channel')}\` ✨`,
                    inline: true,
                },
            );

        const second_embed = new EmbedBuilder()
            .setDescription(
                '**How to use**:\n' +
                    ' • </create-channel:1072286509396398221>: Create a channel with uppercase letters\n' +
                    ' • </rename-channel:1074701489303457862>: Rename an existing channel with uppercase letters\n\n' +
                    `**Permissions**:\nI need \"Manage channels\" permission on your server to work.\nMembers also need this permission to use the commands.\n\n` +
                    `[**GitHub**](https://github.com/nevylish/uppercasebot) • [**Privacy Policy**](${Constants.ApplicationInformations.website}/privacy) • [**Terms of Service**](${Constants.ApplicationInformations.website}/terms)`,
            )
            .setColor(Colors.Blurple)
            .setFooter({
                text: `© ${moment().year()} ${Constants.ApplicationInformations.name} — All rights reserved.`,
            });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel('Add me to another server')
                .setEmoji('➕')
                .setURL(
                    `https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=${Constants.permissions.bitfield}&scope=bot%20applications.commands`,
                ),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel('Vote on Top.gg (please)')
                .setEmoji('❤️')
                .setURL('https://top.gg/bot/' + Constants.ApplicationInformations.topgg_id + '/vote'),
        );

        return { embeds: [first_embed, second_embed], components: [row] };
    };
}
