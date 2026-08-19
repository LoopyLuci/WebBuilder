// ============================================================================
// Deployer Agent
// Handles deployment operations
// ============================================================================
import { BaseAgent } from '../shared/base.js';
export class DeployerAgent extends BaseAgent {
    constructor(config = {}) {
        super({
            ...config,
            name: config.name ?? 'Deployer Agent',
            type: 'deployer',
            description: config.description ?? 'Handles deployment operations',
            capabilities: ['deployment', 'rollback', 'preview-deployment', ...(config.capabilities ?? [])],
            tools: ['deploy-cli', 'vercel-api', 'netlify-api', ...(config.tools ?? [])],
        });
    }
    async executeTask(task) {
        return { success: true, output: `Deploy task completed: ${task.type}` };
    }
}
export default DeployerAgent;
//# sourceMappingURL=index.js.map