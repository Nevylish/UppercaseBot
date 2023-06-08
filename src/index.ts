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
