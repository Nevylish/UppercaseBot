import { CacheType, ContextMenuCommandInteraction } from 'discord.js';
import Command from '../base/Command';
import UppercaseClient from '../base/UppercaseClient';
import { About } from '../utils/about';

export default class AboutContextMenuCommand extends Command {
    constructor(client: UppercaseClient) {
        super(client, {
            name: 'About UpperCase Bot',
            type: 2,
            dmPermission: false,
        });
    }

    async onExecute(interaction: ContextMenuCommandInteraction<CacheType>): Promise<void> {
        await interaction.deferReply({ ephemeral: true });

        const _ = About.getEmbeds(interaction, this.client);

        // @ts-ignore
        await interaction.editReply({ embeds: _.embeds, components: _.components });
    }
}
