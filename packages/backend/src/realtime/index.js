export class RealtimeError extends Error {
    code;
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = 'RealtimeError';
    }
}
//# sourceMappingURL=index.js.map