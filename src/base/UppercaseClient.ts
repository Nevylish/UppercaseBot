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

import {Client, Collection, GatewayIntentBits, Partials} from "discord.js";
import {Handlers} from "./Handlers";
import {Logger} from "../utils/logger";
import Command from "./Command";
import AutoPoster from "topgg-autoposter";
import {Types} from "../utils/types";

export default class UppercaseClient extends Client {
    public readonly commands: Collection<string, Command> = new Collection();

    private readonly env: NodeJS.ProcessEnv = process.env;

    public readonly isDevEnvironment: boolean = this.env.ENVIRONMENT === "DEV";

    public readonly var: Types.Var = {
        topggToken: this.env.TOPGG_TOKEN,
    }

    constructor(token: string) {
        super({
            intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildInvites],
            allowedMentions: {
                parse: ['users'],
                repliedUser: true
            },
            partials: [Partials.Channel, Partials.User]
        });

        this.initialize(token);
    }

    private async initialize(token: string): Promise<void> {
        Logger.log('Client', 'Connecting to Discord...');
        try {
            await this.login(token);
            Handlers.loadEventsListeners(this);
            await Handlers.loadCommands(this);

            if (!this.isDevEnvironment) {
                AutoPoster(this.var.topggToken, this);
                Logger.setMinLogLevel(Logger.LogLevel.WARN);
            }
            Logger.setMinLogLevel(Logger.LogLevel.WARN);

            Logger.success('Client', `Successfully logged in to Discord! (${this.isDevEnvironment ? "Dev" : "Release"} environment)`);
        } catch (error) {
            Logger.error('Client', 'Failed to initialize:', error);
            process.exit(1);
        }
    }
}