import { BaseAgent, type AgentConfig } from '../shared/base.js';
export interface OptimizerAgentConfig extends AgentConfig {
}
export declare class OptimizerAgent extends BaseAgent {
    constructor(config?: OptimizerAgentConfig);
    executeTask(task: any): Promise<any>;
}
export default OptimizerAgent;
//# sourceMappingURL=index.d.ts.map