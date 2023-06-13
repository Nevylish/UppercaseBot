import { PermissionsBitField } from "discord.js";

export namespace Constants {
    export const permissions = new PermissionsBitField([
        PermissionsBitField.Flags.ManageChannels,
        PermissionsBitField.Flags.ViewChannel,
        PermissionsBitField.Flags.SendMessages,
        PermissionsBitField.Flags.EmbedLinks
    ]);

    export const enum Colors {
        DEFAULT = 'White',
        ERROR = 'Red',
        RED = 'Red',
        YELLOW = 'Yellow',
        ORANGE = 'Orange',
        GREEN = 'Green',
        INVISIBLE = '#2f3136'
    }

    export const ApplicationInformations = {
        name: 'Uppercase Bot',
        mail: 'uppercasebot@nevylish.fr',
        website: 'https://uppercasebot.nevylish.fr',
        topgg_id: '1072283043739467807',
        creationYear: "2022"
    }

    export const DeveloperInformations = {
        name: 'Nevylish',
        mail: 'bonjour@nevylish.fr',
        website: 'https://nevylish.fr'
    }
}