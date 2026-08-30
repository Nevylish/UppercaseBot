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
        await interaction.editReply({ embeds: _.embeds, components: _.components });
    }
}
