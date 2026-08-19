import { BaseAgent, type AgentConfig } from '../shared/base.js';
export interface DeveloperAgentConfig extends AgentConfig {
}
export declare class DeveloperAgent extends BaseAgent {
    constructor(config?: DeveloperAgentConfig);
    executeTask(task: any): Promise<any>;
}
export default DeveloperAgent;
//# sourceMappingURL=index.d.ts.map