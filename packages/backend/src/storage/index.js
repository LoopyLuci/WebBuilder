export class StorageError extends Error {
    code;
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = 'StorageError';
    }
}
//# sourceMappingURL=index.js.map