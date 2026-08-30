import { ShardingManager } from 'discord.js';
import AutoPoster from 'topgg-autoposter';
import { config } from './utils/config';
import { Logger } from './utils/logger';

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
        if (config.environment === 'DEV') {
            Logger.log('SharderManager', 'Development environment');
        } else {
            Logger.log('SharderManager', 'Release environment');
            Logger.debug('SharderManager', 'Starting AutoPoster...');
            setTimeout(() => {
                try {
                    AutoPoster(config.topggToken, manager);
                    Logger.debug('SharderManager', 'AutoPoster post');
                } catch (err) {
                    Logger.error('SharderManager', 'AutoPoster fail');
                }
            }, 60 * 1000 /* 60 seconds */);
        }
        manager
            .broadcastEval((client) => client.user.tag)
            .then((tag) =>
                Logger.success(
                    'ShardingManager',
                    `All shards has been started as ${Logger.COLORS.BRIGHT}${Logger.COLORS.GREEN}${tag}${Logger.COLORS.RESET}`,
                ),
            )
            .catch((err) => {
                Logger.error('ShardingManager', 'Failed to broadcast tag evaluation across shards\n', err);
            });
    })
    .catch((err) => {
        Logger.error('ShardingManager', 'Oops, error while starting bot\n', err);
        process.exit(1);
    });
