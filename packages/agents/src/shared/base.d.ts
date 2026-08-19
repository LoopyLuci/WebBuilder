export interface AgentConfig {
    id?: string;
    name?: string;
    type?: string;
    description?: string;
    model?: string;
    capabilities?: string[];
    tools?: string[];
}
export declare abstract class BaseAgent {
    readonly id: string;
    readonly name: string;
    readonly type: string;
    readonly description: string;
    readonly model: string;
    status: 'idle' | 'working' | 'waiting' | 'error' | 'offline';
    capabilities: string[];
    tools: string[];
    protected messageQueue: any[];
    constructor(config: AgentConfig);
    abstract executeTask(task: any): Promise<any>;
    start(): Promise<void>;
    stop(): Promise<void>;
    pause(): void;
    resume(): void;
    onError(error: Error): void;
    getStatus(): {
        id: string;
        name: string;
        type: string;
        status: string;
    };
    send(message: any): void;
    receive(): any | undefined;
}
export default BaseAgent;
//# sourceMappingURL=base.d.ts.map