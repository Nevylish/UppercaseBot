import * as fs from 'fs';
import {glob} from 'glob';
import {promisify} from 'util';
import { Logger } from "../utils/logger";
import UppercaseClient from "./UppercaseClient";
import Command from './Command';
import { CommandInteraction, EmbedBuilder } from 'discord.js';
import {Constants} from '../utils/constants';

export namespace Handlers {
    export const loadEventsListeners = (client: UppercaseClient) => {

        const files = fs.readdirSync(`${process.cwd()}/events`);
        const eventsFiles = files.filter(f => f.split('.').pop() === 'js');

        for (const file of eventsFiles) {
            const event = require(`${process.cwd()}/events/${file}`);
            const eventName = file.split('.')[0];

            Logger.success('Handlers', '(loadEventsListeners)', `\x1b[32m${eventName}\x1b[0m event created`);
            client.on(eventName, event.bind(null, client));
            delete require.cache[require.resolve(`${process.cwd()}/events/${file}`)];
        }
    };

    export const loadCommands = async (client: UppercaseClient) => {
        const globAsync = promisify(glob);
        const files = await globAsync(`${process.cwd()}/commands/**/*.js`);

        files.map(value => {
            const command: Command = new (require(value).default)(client);
            const spitted = value.split('/');
            const dir = spitted[spitted.length - 2];

            if (command.info.name) {
                client.commands.set(command.info.name, command);
                Logger.success('Handlers', '(loadCommands)', `\x1b[32m${dir}/${command.info.name}\x1b[0m command loaded`);
            }
        });

        let commands = [];

        client.commands.forEach(value => {
            commands.push(value.info);
        });

        if (!client.isDevEnvironment) {
            client.application.commands.set(commands).then(r => Logger.success('Handlers', '(loadCommands)', `Slash commands registered for all guilds. (${r.size} commands)`));
        } else {
            client.guilds.cache.get('822720523234181150').commands.set(commands).then(r => Logger.success('Handlers', '(loadCommands)', `Slash commands registered for *dev* guild. (${r.size} commands)`));
        }

        commands = null;
    };

    export const interactionCommandHandler = async (client: UppercaseClient, interaction: CommandInteraction) => {
        const {user, commandName} = interaction;

        const cmd = client.commands.get(commandName);

        if (!cmd) {
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor(Constants.Colors.ERROR)
                    .setDescription("❗ • This command does not exist or has been deleted.")
                ], ephemeral: true
            });
        }

        await cmd.onExecute(interaction)?.catch(err => {
            const embed = new EmbedBuilder()
                .setColor(Constants.Colors.ERROR)
                .setDescription('❗• ' + err.message)
                .setFooter(
                    {
                        text: 'Report a bug? Ask a question? - Contact us at uppercasebot@nevylish.fr'
                    }
                );

            if (interaction.deferred) {
                interaction.editReply({embeds: [embed]});
            } else {
                interaction.reply({embeds: [embed], ephemeral: true});
            }
           
            Logger.error('Handlers', '(onExecute (interaction))', err, {
                userId: user.id,
                userTag: user.tag,
                command: commandName
            });
        })
    }
}