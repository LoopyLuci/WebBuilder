export interface FlutterAdapterConfig {
    material3?: boolean;
    cupertino?: boolean;
    nullSafety?: boolean;
}
export declare class FlutterAdapter {
    private config;
    constructor(config?: FlutterAdapterConfig);
    generate(): string;
}
//# sourceMappingURL=index.d.ts.map