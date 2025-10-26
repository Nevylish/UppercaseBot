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

import express = require('express');
import session = require('express-session');
import path = require('path');
import rateLimit from 'express-rate-limit';
import { timingSafeEqual } from 'crypto';
import { ChannelType, ShardingManager } from 'discord.js';
import { Logger } from '../utils/logger';
import { config } from '../utils/config';
import { existsSync } from 'fs';
import { Constants } from '../utils/constants';
import { Functions } from '../utils/functions';

export class Dashboard {
    private app: express.Application;
    private manager: ShardingManager;
    private readonly port: number;
    private loginAttempts: Map<string, { count: number; lastAttempt: number; blockedUntil: number }> = new Map();

    constructor(manager: ShardingManager) {
        this.manager = manager;
        this.port = Number(config.dashboardPort);
        this.app = express();

        this.app.set('trust proxy', true);

        this.setupMiddlewares();
        this.setupRoutes();
        this.start();
    }

    private safeCompare(a: string, b: string): boolean {
        const bufA = Buffer.from(a);
        const bufB = Buffer.from(b);
        return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
    }

    private isIPBlocked(ip: string): boolean {
        const attempt = this.loginAttempts.get(ip);
        if (!attempt) return false;

        if (Date.now() < attempt.blockedUntil) {
            return true;
        }

        if (Date.now() - attempt.lastAttempt > 15 * 60 * 1000 /* 15 minutes */) {
            this.loginAttempts.delete(ip);
            return false;
        }

        return false;
    }

    private recordFailedAttempt(ip: string): void {
        const attempt = this.loginAttempts.get(ip) || { count: 0, lastAttempt: 0, blockedUntil: 0 };
        attempt.count++;
        attempt.lastAttempt = Date.now();

        if (attempt.count >= 5) {
            attempt.blockedUntil = Date.now() + 15 * 60 * 1000 /* 15 minutes */;
        }

        this.loginAttempts.set(ip, attempt);
    }

    private setupMiddlewares(): void {
        const authLimiter = rateLimit({
            windowMs: 15 * 60 * 1000 /* 15 minutes */,
            limit: 150,
            max: 10,
            message: 'Trop de tentatives de connexion. Réessayez plus tard.',
        });

        this.app.use((req, res, next) => {
            if (req.path.endsWith('.woff')) {
                res.setHeader('Content-Type', 'font/woff');
            } else if (req.path.endsWith('.woff2')) {
                res.setHeader('Content-Type', 'font/woff2');
            }
            next();
        });

        this.app.use((req, res, next) => {
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-Frame-Options', 'DENY');
            res.setHeader('X-XSS-Protection', '1; mode=block');
            if (process.env.DASHBOARD_DOMAIN) {
                res.setHeader('Access-Control-Allow-Origin', process.env.DASHBOARD_DOMAIN);
            }
            res.setHeader(
                'Content-Security-Policy',
                "default-src 'self'; " +
                    "script-src 'self' 'unsafe-inline'; " +
                    "style-src 'self' 'unsafe-inline'; " +
                    "img-src 'self' https://cdn.discordapp.com https://media.discordapp.net data:; " +
                    "connect-src 'self' https://cdn.discordapp.com https://media.discordapp.net; " +
                    "font-src 'self' data:;",
            );
            next();
        });

        this.app.use(
            session({
                secret: config.dashboardSessionSecret,
                resave: false,
                saveUninitialized: false,
                cookie: {
                    secure: process.env.NODE_ENV === 'release',
                    maxAge: 30 * 60 * 1000 /* 30 minutes */,
                    httpOnly: true,
                    sameSite: 'lax',
                },
                rolling: true,
            }),
        );

        this.app.use((req, res, next) => {
            if (req.session && req.session.lastActivity) {
                const inactiveTime = Date.now() - req.session.lastActivity;
                if (inactiveTime > 30 * 60 * 1000) {
                    req.session.destroy((err) => {
                        if (err) {
                            Logger.error('Dashboard', 'Logout error\n', err);
                        }
                        return res.redirect('/login.html');
                    });
                    return;
                }
            }
            if (req.session) {
                req.session.lastActivity = Date.now();
            }
            next();
        });

        this.app.use(express.json());
        this.app.use(authLimiter);

        this.app.use((req, res, next) => {
            if (
                [
                    '/login',
                    '/api/auth/login',
                    '/login.html',
                    '/style.css',
                    '/ABCGintoNormalVariable.woff2',
                    '/BrittanySignature-LjyZ.woff',
                ].includes(req.path)
            ) {
                return next();
            }

            if (req.session && req.session.authenticated) {
                return next();
            }

            if (req.path.startsWith('/api/')) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            res.redirect('/login.html');
        });

        this.app.use(express.static(path.join(__dirname, '../public')));
    }

    private setupRoutes(): void {
        this.app.get('/login.html', (req, res) => {
            if (req.session && req.session.authenticated) {
                return res.redirect('/');
            }
            res.sendFile(path.resolve(process.cwd(), 'public', 'login.html'));
        });

        this.app.post('/api/auth/login', (req, res) => {
            const ip = req.ip;

            if (this.isIPBlocked(ip)) {
                return res.status(429).json({
                    error: `Réessayez plus tard.`,
                });
            }

            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({ error: "Username & Password required" });
            }

            const validUser = config.dashboardUsername;
            const validPass = config.dashboardPassword;

            const userMatch = this.safeCompare(username, validUser);
            const passMatch = this.safeCompare(password, validPass);

            if (userMatch && passMatch) {
                this.loginAttempts.delete(ip);
                req.session.authenticated = true;
                req.session.lastActivity = Date.now();
                res.json({ success: true });
            } else {
                this.recordFailedAttempt(ip);
                res.status(401).json({ error: "Username or password incorrect" });
            }
        });

        this.app.post('/api/auth/logout', (req, res) => {
            req.session.destroy((err) => {
                if (err) {
                    return res.status(500).json({ error: 'Failed to log out.' });
                }
                res.json({ success: true });
            });
        });

        this.app.get('/', (req, res) => {
            const indexPath = path.join(__dirname, '../../public', 'index.html');
            if (existsSync(indexPath)) {
                res.sendFile(indexPath);
            } else {
                res.redirect(Constants.ApplicationInformations.website);
            }
        });

        this.app.get('/api/guilds', async (req, res) => {
            /**
             * For context: This is used to list all guilds, including the id, name, icon, member count (not list, just a number) and owner informations.
             *              Owner informations is not displayed all the time, only if he/she's in cache, its pretty random I think.
             *              UpperCase Bot don't have access to members list¹ or messages content².
             *              The Dashboard access is restricted. No one malicious or curious can view access this path.
             *
             *              1 : UpperCase Bot can't see the members names, avatar or everything. Only the guild's owner informations.
             *              2 : UpperCase Bot can't see your conversations. Even if he have Administrator permissions.
             */
            try {
                const results = await this.manager.broadcastEval((client) =>
                    client.guilds.cache.map((guild) => ({
                        id: guild.id,
                        name: guild.name,
                        icon: guild.iconURL({ size: 256 }),
                        memberCount: guild.memberCount,
                        ownerId: guild.ownerId,
                        owner: client.users.cache.get(guild.ownerId)
                            ? {
                                  id: guild.ownerId,
                                  username: client.users.cache.get(guild.ownerId)?.username,
                                  avatar: client.users.cache.get(guild.ownerId)?.displayAvatarURL({ size: 128 }),
                                  discriminator: client.users.cache.get(guild.ownerId)?.discriminator,
                              }
                            : null,
                    })),
                );

                const guilds = results.flat().sort((a, b) => b.memberCount - a.memberCount);
                res.json(guilds);
            } catch (err) {
                Logger.error('Dashboard', 'Failed to fetch guilds\n', err);
                res.status(500).json({ error: 'Failed to fetch guilds' });
            }
        });

        this.app.get('/api/guilds/:guildId/channels', async (req, res) => {
            /**
             * For context: Channels view is used to monitor and see if UpperCase Bot is correctly used.
             *              UpperCase Bot don't have access to members list¹ or messages content².
             *              The Dashboard access is restricted. No one malicious or curious can view access this path.
             *
             *              1 : UpperCase Bot can't see the members names, avatar or everything. Only the guild's owner informations.
             *              2 : UpperCase Bot can't see your conversations. Even if he have Administrator permissions.
             */
            const { guildId } = req.params;

            try {
                const results = await this.manager.broadcastEval(
                    (client, context) => {
                        const guild = client.guilds.cache.get(context.guildId);
                        if (!guild) return null;

                        const CHANNEL_TYPES = {
                            0: 'Text',
                            1: 'Private Message',
                            2: 'Voice',
                            3: 'Group DM',
                            4: 'Category',
                            5: 'Announcements',
                            10: 'Announcement Thread',
                            11: 'Public Thread',
                            12: 'Private Thread',
                            13: 'Stage Channel',
                            14: 'Guild Directory',
                            15: 'Forum',
                            16: 'Media',
                        };

                        const getChannelTypeLabel = (type: number): string => {
                            return CHANNEL_TYPES[type] || 'Type inconnu';
                        };

                        const CHANNEL_TYPES_SVG = {
                            0: `<path fill="currentColor" fill-rule="evenodd" d="M10.99 3.16A1 1 0 1 0 9 2.84L8.15 8H4a1 1 0 0 0 0 2h3.82l-.67 4H3a1 1 0 1 0 0 2h3.82l-.8 4.84a1 1 0 0 0 1.97.32L8.85 16h4.97l-.8 4.84a1 1 0 0 0 1.97.32l.86-5.16H20a1 1 0 1 0 0-2h-3.82l.67-4H21a1 1 0 1 0 0-2h-3.82l.8-4.84a1 1 0 1 0-1.97-.32L15.15 8h-4.97l.8-4.84ZM14.15 14l.67-4H9.85l-.67 4h4.97Z" clip-rule="evenodd" class=""></path>`,
                            1: null,
                            2: `<path fill="currentColor" d="M12 3a1 1 0 0 0-1-1h-.06a1 1 0 0 0-.74.32L5.92 7H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2.92l4.28 4.68a1 1 0 0 0 .74.32H11a1 1 0 0 0 1-1V3ZM15.1 20.75c-.58.14-1.1-.33-1.1-.92v-.03c0-.5.37-.92.85-1.05a7 7 0 0 0 0-13.5A1.11 1.11 0 0 1 14 4.2v-.03c0-.6.52-1.06 1.1-.92a9 9 0 0 1 0 17.5Z" class=""></path><path fill="currentColor" d="M15.16 16.51c-.57.28-1.16-.2-1.16-.83v-.14c0-.43.28-.8.63-1.02a3 3 0 0 0 0-5.04c-.35-.23-.63-.6-.63-1.02v-.14c0-.63.59-1.1 1.16-.83a5 5 0 0 1 0 9.02Z" class=""></path>`,
                            3: null,
                            4: `<path d="M3 5H11" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path><path d="M3 12H16" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path><path d="M3 19H21" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path>`,
                            5: `<path fill="currentColor" fill-rule="evenodd" d="M19.56 2a3 3 0 0 0-2.46 1.28 3.85 3.85 0 0 1-1.86 1.42l-8.9 3.18a.5.5 0 0 0-.34.47v10.09a3 3 0 0 0 2.27 2.9l.62.16c1.57.4 3.15-.56 3.55-2.12a.92.92 0 0 1 1.23-.63l2.36.94c.42.27.79.62 1.07 1.03A3 3 0 0 0 19.56 22h.94c.83 0 1.5-.67 1.5-1.5v-17c0-.83-.67-1.5-1.5-1.5h-.94Zm-8.53 15.8L8 16.7v1.73a1 1 0 0 0 .76.97l.62.15c.5.13 1-.17 1.12-.67.1-.41.29-.78.53-1.1Z" clip-rule="evenodd" class=""></path><path fill="currentColor" d="M2 10c0-1.1.9-2 2-2h.5c.28 0 .5.22.5.5v7a.5.5 0 0 1-.5.5H4a2 2 0 0 1-2-2v-4Z" class=""></path>`,
                            10: null,
                            11: null,
                            12: null,
                            13: `<path fill="currentColor" d="M19.61 18.25a1.08 1.08 0 0 1-.07-1.33 9 9 0 1 0-15.07 0c.26.42.25.97-.08 1.33l-.02.02c-.41.44-1.12.43-1.46-.07a11 11 0 1 1 18.17 0c-.33.5-1.04.51-1.45.07l-.02-.02Z" class=""></path><path fill="currentColor" d="M16.83 15.23c.43.47 1.18.42 1.45-.14a7 7 0 1 0-12.57 0c.28.56 1.03.6 1.46.14l.05-.06c.3-.33.35-.81.17-1.23A4.98 4.98 0 0 1 12 7a5 5 0 0 1 4.6 6.94c-.17.42-.13.9.18 1.23l.05.06Z" class=""></path><path fill="currentColor" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM6.33 20.03c-.25.72.12 1.5.8 1.84a10.96 10.96 0 0 0 9.73 0 1.52 1.52 0 0 0 .8-1.84 6 6 0 0 0-11.33 0Z" class=""></path>`,
                            14: null,
                            15: `<path fill="currentColor" d="M18.91 12.98a5.45 5.45 0 0 1 2.18 6.2c-.1.33-.09.68.1.96l.83 1.32a1 1 0 0 1-.84 1.54h-5.5A5.6 5.6 0 0 1 10 17.5a5.6 5.6 0 0 1 5.68-5.5c1.2 0 2.32.36 3.23.98Z" class=""></path><path fill="currentColor" d="M19.24 10.86c.32.16.72-.02.74-.38L20 10c0-4.42-4.03-8-9-8s-9 3.58-9 8c0 1.5.47 2.91 1.28 4.11.14.21.12.49-.06.67l-1.51 1.51A1 1 0 0 0 2.4 18h5.1a.5.5 0 0 0 .49-.5c0-4.2 3.5-7.5 7.68-7.5 1.28 0 2.5.3 3.56.86Z" class=""></path>`,
                            16: null,
                        };

                        const getChannelTypeSVG = (type: number): string => {
                            return `<svg class="channelsIcon" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">${CHANNEL_TYPES_SVG[type] || CHANNEL_TYPES_SVG[0]}</svg>`;
                        };

                        return guild.channels.cache.map((channel) => ({
                            id: channel.id,
                            name: channel.name,
                            type: channel.type,
                            typeLabel: getChannelTypeLabel(channel.type),
                            typeSVG: getChannelTypeSVG(channel.type),
                            position: 'position' in channel ? channel.position : 0,
                            parentId: channel.parentId,
                        }));
                    },
                    { context: { guildId } },
                );

                const sortedChannels = results
                    .find((result) => result !== null)
                    ?.filter(
                        (c) =>
                            ![
                                ChannelType.DM,
                                ChannelType.GroupDM,
                                ChannelType.PublicThread,
                                ChannelType.PrivateThread,
                            ].includes(c.type),
                    )
                    .sort((a, b) => {
                        if (a.parentId === b.parentId) {
                            return a.position - b.position;
                        }

                        const findChannel = (id: string) => results.find((r) => r !== null)?.find((c) => c.id === id);
                        const aParent = a.parentId ? findChannel(a.parentId) : null;
                        const bParent = b.parentId ? findChannel(b.parentId) : null;

                        if (aParent && bParent) {
                            return aParent.position - bParent.position;
                        }

                        if (aParent && b.type === ChannelType.GuildCategory) {
                            if (aParent.id === b.id) {
                                return 1;
                            }
                            return aParent.position - b.position;
                        }
                        if (bParent && a.type === ChannelType.GuildCategory) {
                            if (bParent.id === a.id) {
                                return -1;
                            }
                            return a.position - bParent.position;
                        }

                        if (aParent) return 1;
                        if (bParent) return -1;

                        return a.position - b.position;
                    });

                const channels = sortedChannels ? sortedChannels : [];

                if (
                    channels.length > 0 ||
                    (results.find((result) => result !== null) &&
                        results.find((result) => result !== null).length === 0)
                ) {
                    res.json(channels);
                } else {
                    res.status(404).json({ error: 'Guild not found on any shard.' });
                }
            } catch (err) {
                Logger.error('Dashboard', 'Failed to fetch channels\n', err);
                res.status(500).json({ error: 'Failed to fetch channels' });
            }
        });

        this.app.get('/api/stats', async (req, res) => {
            /**
             * For context: No private informations, only the amount of guilds using UpperCase Bot and the combined members amount.
             */
            try {
                const results = await this.manager.broadcastEval((client) => ({
                    guilds: client.guilds.cache.size,
                    members: client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0),
                }));

                const stats = results.reduce(
                    (acc, curr) => ({
                        guilds: acc.guilds + curr.guilds,
                        members: acc.members + curr.members,
                    }),
                    { guilds: 0, members: 0 },
                );

                res.json({
                    guilds: Functions.formatNumber(stats.guilds),
                    members: Functions.formatNumber(stats.members),
                });
            } catch (err) {
                Logger.error('Dashboard', 'Failed to fetch stats\n', err);
                res.status(500).json({ error: 'Failed to fetch stats' });
            }
        });

        this.app.post('/api/guilds/:guildId/leave', (_, res) => {
            /**
             * For context: This function is here to prevent malicious use of UpperCase Bot, like trying spam commands.
             */
            res.status(500).json({ error: 'This feature is temporarily disabled.' });
        });
    }

    private start(): void {
        this.app.listen(this.port, () => {
            Logger.success(
                'Dashboard',
                `Server is running on port ${this.port} | ${Logger.COLORS.UNDERSCORE}${Logger.COLORS.MAGENTA}${config.dashboardDomain}${Logger.COLORS.RESET}`,
            );
        });
    }
}
