export class FriendlyError extends Error {
    public name: string
    constructor(message:string) {
        super(message);
        this.name = 'FriendlyError';
    }
}