export interface VueAdapterConfig {
    typescript?: boolean;
    compositionApi?: boolean;
    scopedStyles?: boolean;
}
export declare class VueAdapter {
    private config;
    constructor(config?: VueAdapterConfig);
    generate(): string;
}
//# sourceMappingURL=index.d.ts.map