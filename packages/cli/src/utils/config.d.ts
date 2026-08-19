export interface WebBuilderConfig {
    apiKey?: string;
    defaultTemplate?: string;
    defaultAgent?: string;
    defaultTarget?: string;
    telemetry?: boolean;
    theme?: 'light' | 'dark';
    agents?: Array<{
        id: string;
        type: string;
        name: string;
        status: string;
        createdAt: string;
    }>;
}
export declare const config: {
    ensureConfigDir(): void;
    get<T extends keyof WebBuilderConfig>(key: T): WebBuilderConfig[T] | undefined;
    set<K extends keyof WebBuilderConfig>(key: K, value: WebBuilderConfig[K]): void;
    getAll(): WebBuilderConfig;
    delete(key: keyof WebBuilderConfig): void;
    reset(): void;
    getConfigPath(): string;
};
//# sourceMappingURL=config.d.ts.map