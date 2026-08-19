import express from 'express';
export interface ServerOptions {
    port: number;
    host: string;
    root: string;
    mode: 'development' | 'production' | 'static';
    apiPrefix?: string;
    enableCors?: boolean;
    enableCompression?: boolean;
    enableHelmet?: boolean;
    enableMorgan?: boolean;
    spa?: boolean;
}
export declare function createServer(options: ServerOptions): Promise<{
    app: express.Application;
    start(): Promise<void>;
    stop(): Promise<void>;
}>;
declare const _default: {
    createServer: typeof createServer;
};
export default _default;
//# sourceMappingURL=server.d.ts.map