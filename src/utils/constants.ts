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

import { PermissionsBitField } from 'discord.js';

export namespace Constants {
    export const permissions = new PermissionsBitField([
        PermissionsBitField.Flags.ManageChannels,
        PermissionsBitField.Flags.ViewChannel,
        PermissionsBitField.Flags.SendMessages,
        PermissionsBitField.Flags.EmbedLinks,
    ]);

    export const ApplicationInformations = {
        name: 'UpperCase Bot',
        mail: 'uppercasebot@nevylish.fr',
        website: 'https://uppercasebot.nevylish.fr',
        topgg_id: '1072283043739467807',
        creationYear: '2022',
    };

    export const DeveloperInformations = {
        name: 'Nevylish',
        mail: 'bonjour@nevylish.fr',
        website: 'https://nevylish.fr',
    };
}
