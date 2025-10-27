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

import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ColorResolvable, EmbedBuilder } from 'discord.js';
import { version } from '../../package.json';

export namespace Functions {
    const ALTERNATIVE_UPPERCASE = [
        '𝖠',
        '𝖡',
        '𝖢',
        '𝖣',
        '𝖤',
        '𝖥',
        '𝖦',
        '𝖧',
        '𝖨',
        '𝖩',
        '𝖪',
        '𝖫',
        '𝖬',
        '𝖭',
        '𝖮',
        '𝖯',
        '𝖰',
        '𝖱',
        '𝖲',
        '𝖳',
        '𝖴',
        '𝖵',
        '𝖶',
        '𝖷',
        '𝖸',
        '𝖹',
    ];

    export const alternativeUppercaseAlgorithm = (input: string): string => {
        return input
            .split('')
            .map((char) => {
                if (char >= 'A' && char <= 'Z') {
                    return ALTERNATIVE_UPPERCASE[char.charCodeAt(0) - 65];
                } else if (char === ' ') {
                    return '-';
                }
                return char;
            })
            .join('');
    };

    const addCopyrightFooter = (embed: EmbedBuilder): void => {
        embed.setFooter({ text: `© 2025 UpperCase Bot — All rights reserved. | Build v${version}` });
    };

    export const buildEmbed = (
        description: string,
        color: 'Error' | 'Alert' | 'Good' | ColorResolvable,
    ): EmbedBuilder => {
        description =
            (color === 'Error' ? '**Error:** ' : '') +
            (color === 'Alert' ? '**Alert:** ' : '') +
            description +
            (color === 'Error'
                ? '\n\n**Protip:** To try to fix a lot of errors, give me "Administrator" permission and rerun the command.'
                : '') +
            `\n\n[**Add UpperCase Bot**](https://discord.com/oauth2/authorize?client_id=1072283043739467807&permissions=19472&scope=bot%20applications.commands)\u2005\u2005•\u2005\u2005[**Vote on Top.gg (please <3)**](https://top.gg/bot/1072283043739467807/vote)\u2005\u2005•\u2005\u2005[**Source Code**](https://github.com/Nevylish/UppercaseBot)`;

        switch (color) {
            case 'Error':
                color = 0xff614d;
                break;
            case 'Alert':
                color = 0xffa94d;
                break;
            case 'Good':
                color = 0x75ff7a;
                break;
        }

        const embed = new EmbedBuilder().setDescription(description).setColor(color as ColorResolvable);

        addCopyrightFooter(embed);
        return embed;
    };

    export const buildChannelButton = (url: string): ActionRowBuilder<ButtonBuilder> => {
        return new ActionRowBuilder<any>().addComponents(
            new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Go to channel').setURL(url),
        );
    };

    export const buildButtons = (url?: string): ActionRowBuilder<ButtonBuilder> => {
        const row = new ActionRowBuilder<ButtonBuilder>();

        const buttons: ButtonBuilder[] = [];

        if (url) {
            buttons.push(
                new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Go to channel').setEmoji('#️⃣').setURL(url),
            );
        }

        buttons.push(
            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel('Vote on Top.gg (please <3)')
                .setEmoji('❤️')
                .setURL('https://top.gg/bot/1072283043739467807/vote'),
        );

        row.addComponents(...buttons);

        return row;
    };

    export const formatNumber = (num: number): string => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };
}
