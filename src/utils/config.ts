import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { Logger } from './logger';

// Load .env for dev mode
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: resolve(__dirname, '../../.env') });
}

// Validate required environment variables
const requiredEnvVars = ['TOKEN', 'TOPGG_TOKEN'] as const;
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    Logger.error('Config', `Missing required environment variables: ${missingEnvVars.join(', ')}`);
    process.exit(1);
}

// Validate and sanitize environment variables
const validateEnvVar = (name: string, value: string | undefined, defaultValue?: string): string => {
    if (!value && !defaultValue) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value || defaultValue!;
};

// Export validated environment variables
export const config = {
    token: validateEnvVar('TOKEN', process.env.TOKEN),
    topggToken: validateEnvVar('TOPGG_TOKEN', process.env.TOPGG_TOKEN),
    environment: validateEnvVar('ENVIRONMENT', process.env.ENVIRONMENT, 'DEV'),
    webhookUrl: validateEnvVar('WEBHOOK_URL', process.env.WEBHOOK_URL, ''),
} as const;
