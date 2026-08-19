export interface CreateOptions {
    template?: string;
    ai?: string;
    framework?: string;
    styling?: string;
    git?: boolean;
}
export interface DevOptions {
    port?: string;
    host?: string;
    https?: boolean;
}
export interface BuildOptions {
    optimize?: boolean;
    analyze?: boolean;
    ssg?: boolean;
    output?: string;
}
export interface DeployOptions {
    target?: string;
    preview?: boolean;
    production?: boolean;
    domain?: string;
}
export interface ComponentCommandOptions {
    props?: string;
    from?: string;
    customize?: string;
}
export interface AIOptions {
    model?: string;
    apply?: boolean;
    dryRun?: boolean;
}
export interface AgentActionOptions {
    type?: string;
    task?: string;
    list?: boolean;
    status?: string;
    logs?: string;
}
export declare function createCommand(name: string, options: CreateOptions): Promise<void>;
export declare function devCommand(options: DevOptions): Promise<void>;
export declare function buildCommand(options: BuildOptions): Promise<void>;
export declare function deployCommand(options: DeployOptions): Promise<void>;
export declare function componentCommand(type: string, name: string, options: ComponentCommandOptions): Promise<void>;
export declare function aiCommand(prompt: string, options: AIOptions): Promise<void>;
export declare function agentCommand(action: string, options: AgentActionOptions): Promise<void>;
//# sourceMappingURL=index.d.ts.map