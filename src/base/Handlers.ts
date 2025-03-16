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

import * as fs from 'fs';
import {glob} from 'glob';
import {promisify} from 'util';
import {Logger} from "../utils/logger";
import UppercaseClient from "./UppercaseClient";
import Command from './Command';
import {CommandInteraction} from 'discord.js';
import {Functions} from '../utils/functions';

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
                embeds: [
                    Functions.buildErrorEmbed('This command does not exist or has been deleted.')
                ],
                ephemeral: true
            });
        }

        await cmd.onExecute(interaction)?.catch(err => {
            const embed = Functions.buildErrorEmbed(err.message);

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