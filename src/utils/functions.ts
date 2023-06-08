import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction } from "discord.js";

export namespace Functions {
    export const alternativeUppercaseAlgorithm = (input: string) => {
        const upper = [
            "𝖠", "𝖡", "𝖢", "𝖣", "𝖤", "𝖥", "𝖦", "𝖧", "𝖨", "𝖩", "𝖪", "𝖫", "𝖬", "𝖭", "𝖮", "𝖯", "𝖰", "𝖱", "𝖲", "𝖳", "𝖴", "𝖵", "𝖶", "𝖷", "𝖸", "𝖹",
        ];

        let output = "";

        for (let str of input) {
            if (str >= "A" && str <= "Z") {
                output += upper[str.charCodeAt(0) - 65];
            } else if (str === " ") {
                output += "-"
            } else {
                output += str;
            }
        }

        return output;
    }

    export const spawnVoteTopGGButton = (/*interaction used for locales*/ interaction: CommandInteraction) => {
        return new ActionRowBuilder<any>()
        .addComponents(
            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel('Vote on Top.gg (please <3)')
                .setEmoji('<:topgg:1093959259890389092>')
                .setURL('https://top.gg/bot/1072283043739467807/vote')
        )
    }
}