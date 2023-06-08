export default class BadCommandUsage extends Error {
    constructor(reason: string) {
        super(reason);
    }
}