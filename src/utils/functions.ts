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

import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, EmbedBuilder } from 'discord.js';
import { Constants } from './constants';

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

    export const buildErrorEmbed = (msg: string): EmbedBuilder => {
        return new EmbedBuilder()
            .setColor(Constants.Colors.ERROR)
            .setDescription(
                `❗• ${msg}\n\nTo try to fix a lot of errors, give me "Administrator" permission and rerun the command.`,
            );
    };

    export const spawnVoteTopGGButton = (
        /* interaction used for locales */ interaction: CommandInteraction,
    ): ActionRowBuilder<ButtonBuilder> => {
        return new ActionRowBuilder<any>().addComponents(
            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel('Vote on Top.gg (please <3)')
                .setEmoji('<:topgg:1093959259890389092>')
                .setURL('https://top.gg/bot/1072283043739467807/vote'),
        );
    };

    export const formatNumber = (num: number): string => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };
}
