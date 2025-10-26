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

import { ShardingManager } from 'discord.js';
import { Logger } from './utils/logger';
import { config } from './utils/config';
import { Dashboard } from './base/Dashboard';
import AutoPoster from 'topgg-autoposter';

process.on('uncaughtException', (err) => {
    Logger.error('Application', 'Uncaught exception\n', err);
});

process.on('unhandledRejection', (err) => {
    Logger.error('Application', 'Unhandled promise rejection\n', err);
});

process.on('SIGINT', () => {
    Logger.warn('Application', 'SIGINT received, stopping...');
    process.exit();
});

const manager = new ShardingManager('./dist/shard.js', {
    token: config.token,
    totalShards: 'auto',
    respawn: true,
    shardArgs: ['--no-warnings'],
});

manager.on('shardCreate', (shard) => {
    Logger.debug('ShardingManager', `Shard #${shard.id} created`);

    shard.on('ready', () => {
        Logger.debug('ShardingManager', `Shard #${shard.id} ready`);
    });

    shard.on('reconnecting', () => {
        Logger.debug('ShardingManager', `Shard #${shard.id} reconnecting...`);
    });

    shard.on('disconnect', () => {
        Logger.debug('ShardingManager', `Shard #${shard.id} disconnected`);
    });

    shard.on('error', (err) => {
        Logger.debug('ShardingManager', `Error on shard #${shard.id}\n`, err);
    });

    shard.on('death', (why) => {
        Logger.debug('ShardingManager', `Shard #${shard.id} died:`, why);
    });
});

manager
    .spawn()
    .then(() => {
        new Dashboard(manager);
        if (config.environment === 'DEV') {
            Logger.log('SharderManager', 'Development environment');
        } else {
            Logger.log('SharderManager', 'Release environment');
            Logger.debug('SharderManager', 'Starting AutoPoster...');
            setTimeout(() => {
                AutoPoster(config.topggToken, manager);
            }, 60 * 1000 /* 60 seconds */);
            Logger.success('SharderManager', 'AutoPoster started !');
        }
        manager
            .broadcastEval((client) => client.user.tag)
            .then((tag) =>
                Logger.success(
                    'ShardingManager',
                    `All shards has been started as ${Logger.COLORS.BRIGHT}${Logger.COLORS.GREEN}${tag}${Logger.COLORS.RESET}`,
                ),
            );
    })
    .catch((err) => {
        Logger.error('ShardingManager', 'Oops, error while starting bot\n', err);
        process.exit(1);
    });
