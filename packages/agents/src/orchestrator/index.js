// ============================================================================
// Agent Orchestrator
// Multi-agent workflow orchestration with task delegation and collaboration
// ============================================================================
export class AgentOrchestrator {
    agents;
    workflows;
    maxConcurrentAgents;
    autoRetry;
    constructor(config = {}) {
        this.agents = new Map();
        this.workflows = new Map();
        this.maxConcurrentAgents = config.maxConcurrentAgents ?? 5;
        this.autoRetry = config.autoRetry ?? true;
    }
    registerAgent(type, agent) {
        this.agents.set(type, agent);
    }
    getAgent(type) {
        return this.agents.get(type);
    }
    listAgents() {
        return Array.from(this.agents.values());
    }
    createWorkflow(name, description) {
        const workflow = {
            id: `wf_${Date.now()}`,
            name,
            description,
            steps: [],
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        this.workflows.set(workflow.id, workflow);
        return workflow;
    }
    addStep(workflowId, agentType, task, dependsOn) {
        const workflow = this.workflows.get(workflowId);
        if (!workflow)
            return null;
        const step = {
            id: `step_${Date.now()}`,
            agentType,
            task,
            dependsOn,
            status: 'pending',
        };
        workflow.steps.push(step);
        workflow.updatedAt = new Date().toISOString();
        return step;
    }
    async executeWorkflow(workflowId) {
        const workflow = this.workflows.get(workflowId);
        if (!workflow)
            throw new Error(`Workflow not found: ${workflowId}`);
        workflow.status = 'running';
        workflow.updatedAt = new Date().toISOString();
        for (const step of workflow.steps) {
            if (step.dependsOn && !this.dependenciesMet(step, workflow)) {
                continue;
            }
            step.status = 'running';
            const agent = this.agents.get(step.agentType);
            if (!agent) {
                step.status = 'failed';
                continue;
            }
            try {
                const result = await agent.executeTask(step.task);
                step.status = result.success ? 'completed' : 'failed';
            }
            catch (error) {
                step.status = 'failed';
            }
        }
        workflow.status = workflow.steps.every(s => s.status === 'completed') ? 'completed' : 'failed';
        workflow.updatedAt = new Date().toISOString();
        return workflow;
    }
    dependenciesMet(step, workflow) {
        if (!step.dependsOn)
            return true;
        return step.dependsOn.every(depId => {
            const depStep = workflow.steps.find(s => s.id === depId);
            return depStep?.status === 'completed';
        });
    }
    getWorkflow(id) {
        return this.workflows.get(id);
    }
    getAllWorkflows() {
        return Array.from(this.workflows.values());
    }
}
export default AgentOrchestrator;
//# sourceMappingURL=index.js.map