export declare class WebBuilderMCPServer {
    private server;
    private projectManager;
    constructor();
    private registerAllTools;
    private registerProjectTools;
    private registerCodeGenerationTools;
    private registerComponentTools;
    private registerDesignTools;
    private registerDeployTools;
    private registerTestingTools;
    private registerOptimizationTools;
    private registerAndroidTools;
    start(): Promise<void>;
}
export declare function startMCPServer(): Promise<void>;
export default WebBuilderMCPServer;
//# sourceMappingURL=index.d.ts.map