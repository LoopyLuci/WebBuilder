export interface PluginContext {
    project: any;
    components: any;
    design: any;
    deploy: any;
}
export interface PluginAPI {
    registerComponent: (component: any) => void;
    registerTemplate: (template: any) => void;
    registerTheme: (theme: any) => void;
    registerTool: (tool: any) => void;
    registerHook: (event: string, handler: Function) => void;
    getProject: () => any;
    updateProject: (updates: any) => void;
    log: (message: string) => void;
}
export declare class PluginManager {
    private plugins;
    private hooks;
    constructor();
    load(pluginId: string, pluginModule: any): Promise<void>;
    unload(pluginId: string): Promise<void>;
    executeHook(event: string, context: PluginContext): Promise<void>;
    getPlugin(pluginId: string): PluginAPI | undefined;
    listPlugins(): string[];
    private createAPI;
}
export declare class Marketplace {
    private items;
    constructor();
    search(query: string, filters?: Record<string, string>): Promise<any[]>;
    install(itemId: string): Promise<boolean>;
    uninstall(itemId: string): Promise<boolean>;
    publish(item: any): Promise<void>;
    rate(itemId: string, rating: number, review: string): Promise<void>;
    getCategories(): string[];
}
declare const _default: {
    PluginManager: typeof PluginManager;
    Marketplace: typeof Marketplace;
};
export default _default;
//# sourceMappingURL=index.d.ts.map