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
        mail: 'bonjour@nevylish.fr',
        website: 'https://uppercasebot.nevylish.fr',
        topgg_id: '1072283043739467807',
        creationYear: '2022',
    };

    export const DeveloperInformations = {
        name: 'Strachamia Studios',
        mail: 'bonjour@nevylish.fr',
        website: 'https://nevylish.fr',
    };
}
