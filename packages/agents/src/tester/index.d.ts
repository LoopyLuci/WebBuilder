import { BaseAgent, type AgentConfig } from '../shared/base.js';
export interface TesterAgentConfig extends AgentConfig {
}
export declare class TesterAgent extends BaseAgent {
    constructor(config?: TesterAgentConfig);
    executeTask(task: any): Promise<any>;
}
export default TesterAgent;
//# sourceMappingURL=index.d.ts.map