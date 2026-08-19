import { BaseAgent } from '../shared/base.js';
export interface WorkflowStep {
    id: string;
    agentType: string;
    task: any;
    dependsOn?: string[];
    status: 'pending' | 'running' | 'completed' | 'failed';
}
export interface Workflow {
    id: string;
    name: string;
    description?: string;
    steps: WorkflowStep[];
    status: 'pending' | 'running' | 'completed' | 'failed';
    createdAt: string;
    updatedAt: string;
}
export interface OrchestratorConfig {
    maxConcurrentAgents?: number;
    autoRetry?: boolean;
}
export declare class AgentOrchestrator {
    private agents;
    private workflows;
    private maxConcurrentAgents;
    private autoRetry;
    constructor(config?: OrchestratorConfig);
    registerAgent(type: string, agent: BaseAgent): void;
    getAgent(type: string): BaseAgent | undefined;
    listAgents(): BaseAgent[];
    createWorkflow(name: string, description?: string): Workflow;
    addStep(workflowId: string, agentType: string, task: any, dependsOn?: string[]): WorkflowStep | null;
    executeWorkflow(workflowId: string): Promise<Workflow>;
    private dependenciesMet;
    getWorkflow(id: string): Workflow | undefined;
    getAllWorkflows(): Workflow[];
}
export default AgentOrchestrator;
//# sourceMappingURL=index.d.ts.map