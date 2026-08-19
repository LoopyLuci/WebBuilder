export class AuthError extends Error {
    code;
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = 'AuthError';
    }
}
//# sourceMappingURL=index.js.map