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

import * as dotenv from 'dotenv';
import * as moment from 'moment';
import {Logger} from './utils/logger';
import UppercaseClient from './base/UppercaseClient';

dotenv.config({path: '../.env'});
moment.locale('en-US');

export const Uppercase: UppercaseClient = new UppercaseClient(process.env.TOKEN);

process.on('uncaughtException', err => Logger.warn('Uncaught exception', err));
process.on('unhandledRejection', err => Logger.warn('Unhandled promise rejection', err));

process.on('SIGINT', () => {
    Logger.warn('SIGINT received', 'Shutting down...');
    Uppercase.destroy();
    process.exit();
});
