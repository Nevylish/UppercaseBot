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

import { CacheType, CommandInteraction } from 'discord.js';
import Command from '../base/Command';
import UppercaseClient from '../base/UppercaseClient';
import { About } from '../utils/about';

export default class AboutCommand extends Command {
    constructor(client: UppercaseClient) {
        super(client, {
            name: 'about',
            /*nameLocalizations: {
                fr: 'a-propos',
            },*/
            description: 'Learn more about UpperCase Bot and get an example of uppercase channels',
            descriptionLocalizations: {
                fr: 'Apprends-en plus à propos de UpperCase Bot et avoir un exemple des majuscules',
            },
        });
    }

    async onExecute(interaction: CommandInteraction<CacheType>): Promise<void> {
        await interaction.deferReply({ ephemeral: false });

        const _ = About.getEmbeds(interaction, this.client);

        // @ts-ignore
        interaction.editReply({ embeds: _.embeds, components: _.components });
    }
}
