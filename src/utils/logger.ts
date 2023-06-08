export namespace Logger {
    export const log = (message: string, ...optionalParams: any[]): void => {
        const msg = `[${new Date().toLocaleString()}] • \x1b[35m${message}\x1b[0m:`;
        console.log(`${msg}`, ...optionalParams);
    };

    export const error = (message: string, ...optionalParams: any[]): void => {
        const msg = `\x1b[31m[${new Date().toLocaleString()}]\x1b[0m • \x1b[35m${message}\x1b[0m:`;
        console.error(msg, ...optionalParams);
    };

    export const warn = (message: string, ...optionalParams: any[]): void => {
        const msg = `\x1b[33m[${new Date().toLocaleString()}]\x1b[0m • \x1b[35m${message}\x1b[0m:`;
        console.warn(msg, ...optionalParams);
    };

    export const success = (message: string, ...optionalParams: any[]): void => {
        const msg = `\x1b[32m[${new Date().toLocaleString()}]\x1b[0m • \x1b[35m${message}\x1b[0m:`;
        console.log(msg, ...optionalParams);
    };

    export const debug = (message: string, ...optionalParams: any[]): void => {
        const msg = `\x1b[36m[${new Date().toLocaleString()}]\x1b[0m • \x1b[35m${message}\x1b[0m:`;
        console.log(msg, ...optionalParams);
    };
}