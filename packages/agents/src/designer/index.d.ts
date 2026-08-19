import { BaseAgent, type AgentConfig } from '../shared/base.js';
export interface DesignerAgentConfig extends AgentConfig {
}
export declare class DesignerAgent extends BaseAgent {
    constructor(config?: DesignerAgentConfig);
    executeTask(task: any): Promise<any>;
    private createDesignSystem;
    private generatePalette;
}
export default DesignerAgent;
//# sourceMappingURL=index.d.ts.map