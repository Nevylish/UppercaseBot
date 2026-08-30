export default class InsufficientPermissions extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InsufficientPermissions';
    }
}
