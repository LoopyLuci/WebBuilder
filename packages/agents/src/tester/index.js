// ============================================================================
// Tester Agent
// Generates and runs tests for quality assurance
// ============================================================================
import { BaseAgent } from '../shared/base.js';
export class TesterAgent extends BaseAgent {
    constructor(config = {}) {
        super({
            ...config,
            name: config.name ?? 'Tester Agent',
            type: 'tester',
            description: config.description ?? 'Generates and runs tests for quality assurance',
            capabilities: ['unit-testing', 'integration-testing', 'e2e-testing', 'visual-testing', 'a11y-testing', ...(config.capabilities ?? [])],
            tools: ['test-generator', 'test-runner', 'coverage-analyzer', ...(config.tools ?? [])],
        });
    }
    async executeTask(task) {
        return { success: true, output: `Test task completed: ${task.type}` };
    }
}
export default TesterAgent;
//# sourceMappingURL=index.js.map