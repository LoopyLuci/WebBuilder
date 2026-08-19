import { BaseAgent, type AgentConfig } from '../shared/base.js';
export interface DeployerAgentConfig extends AgentConfig {
}
export declare class DeployerAgent extends BaseAgent {
    constructor(config?: DeployerAgentConfig);
    executeTask(task: any): Promise<any>;
}
export default DeployerAgent;
//# sourceMappingURL=index.d.ts.map