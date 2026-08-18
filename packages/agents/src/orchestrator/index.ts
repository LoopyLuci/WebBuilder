// ============================================================================
// Agent Orchestrator
// Multi-agent workflow orchestration with task delegation and collaboration
// ============================================================================

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

export class AgentOrchestrator {
  private agents: Map<string, BaseAgent>;
  private workflows: Map<string, Workflow>;
  private maxConcurrentAgents: number;
  private autoRetry: boolean;

  constructor(config: OrchestratorConfig = {}) {
    this.agents = new Map();
    this.workflows = new Map();
    this.maxConcurrentAgents = config.maxConcurrentAgents ?? 5;
    this.autoRetry = config.autoRetry ?? true;
  }

  registerAgent(type: string, agent: BaseAgent): void {
    this.agents.set(type, agent);
  }

  getAgent(type: string): BaseAgent | undefined {
    return this.agents.get(type);
  }

  listAgents(): BaseAgent[] {
    return Array.from(this.agents.values());
  }

  createWorkflow(name: string, description?: string): Workflow {
    const workflow: Workflow = {
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

  addStep(workflowId: string, agentType: string, task: any, dependsOn?: string[]): WorkflowStep | null {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return null;

    const step: WorkflowStep = {
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

  async executeWorkflow(workflowId: string): Promise<Workflow> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) throw new Error(`Workflow not found: ${workflowId}`);

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
      } catch (error) {
        step.status = 'failed';
      }
    }

    workflow.status = workflow.steps.every(s => s.status === 'completed') ? 'completed' : 'failed';
    workflow.updatedAt = new Date().toISOString();
    return workflow;
  }

  private dependenciesMet(step: WorkflowStep, workflow: Workflow): boolean {
    if (!step.dependsOn) return true;
    return step.dependsOn.every(depId => {
      const depStep = workflow.steps.find(s => s.id === depId);
      return depStep?.status === 'completed';
    });
  }

  getWorkflow(id: string): Workflow | undefined {
    return this.workflows.get(id);
  }

  getAllWorkflows(): Workflow[] {
    return Array.from(this.workflows.values());
  }
}

export default AgentOrchestrator;
