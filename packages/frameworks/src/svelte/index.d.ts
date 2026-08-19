export interface SvelteAdapterConfig {
    typescript?: boolean;
    scopedStyles?: boolean;
}
export declare class SvelteAdapter {
    private config;
    constructor(config?: SvelteAdapterConfig);
    generate(): string;
}
//# sourceMappingURL=index.d.ts.map