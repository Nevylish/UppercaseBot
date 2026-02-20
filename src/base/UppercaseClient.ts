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

import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { Logger } from '../utils/logger';
import Command from './Command';
import { Handlers } from './Handlers';

export default class UppercaseClient extends Client {
    public readonly commands: Collection<string, Command> = new Collection();
    public readonly isDevEnvironment: boolean = process.env.ENVIRONMENT === 'DEV';
    public readonly shardId: number = this.shard?.ids[0] ?? 0;
    public readonly totalShards: number = this.shard?.count ?? 1;

    constructor() {
        super({
            intents: [GatewayIntentBits.Guilds],
            allowedMentions: {
                parse: ['users'],
                repliedUser: true,
            },
            partials: [Partials.Channel, Partials.User],
        });

        dotenv.config({ path: resolve(__dirname, '../../.env') });

        const token = process.env.TOKEN;
        if (!token) {
            Logger.error('Client', 'TOKEN is not defined in environment variables');
            process.exit(1);
        }

        this.initialize(token);
    }

    public async getStats(): Promise<{
        guilds: number;
        users: number;
        shardId: number;
        totalShards: number;
    }> {
        const promises = [
            this.shard?.fetchClientValues('guilds.cache.size') as Promise<number[]>,
            this.shard?.broadcastEval((c) =>
                c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0),
            ) as Promise<number[]>,
            this.shard?.fetchClientValues('channels.cache.size') as Promise<number[]>,
        ];

        const [guilds, users] = await Promise.all(promises);

        return {
            guilds: guilds?.reduce((acc, guildCount) => acc + (guildCount as number), 0) ?? 0,
            users: users?.reduce((acc, memberCount) => acc + (memberCount as number), 0) ?? 0,
            shardId: this.shardId,
            totalShards: this.totalShards,
        };
    }

    private async initialize(token: string): Promise<void> {
        Logger.log('Client', `Shard #${this.shardId} - Connecting to Discord...`);
        try {
            await this.login(token);
            Handlers.loadEventsListeners(this);
            await Handlers.loadCommands(this);

            Logger.success('Client', `Shard #${this.shardId} - Successfully connected to Discord !`);
        } catch (err) {
            Logger.error('Client', `Shard #${this.shardId} - Oops, connection to Discord failed:\n`, err);
            process.exit(1);
        }
    }
}
