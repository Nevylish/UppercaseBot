export default class InsufficientPermissions extends Error {
    constructor(str: string) {
        super(str);
    }
}