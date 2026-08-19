export interface iOSAdapterConfig {
    swiftUI?: boolean;
    uiKit?: boolean;
    iosVersion?: string;
}
export declare class iOSAdapter {
    private config;
    constructor(config?: iOSAdapterConfig);
    generate(): string;
}
//# sourceMappingURL=index.d.ts.map