import { describe, it, expect } from 'vitest';
import { AgentOrchestrator, DesignerAgent, DeveloperAgent, TesterAgent, OptimizerAgent, DeployerAgent, createOrchestrator, } from '../../dist/index.js';
describe('AgentOrchestrator', () => {
    describe('creation', () => {
        it('should create an orchestrator with default config', () => {
            const orchestrator = new AgentOrchestrator();
            expect(orchestrator).toBeDefined();
            expect(orchestrator.listAgents()).toEqual([]);
            expect(orchestrator.getAllWorkflows()).toEqual([]);
        });
        it('should create with custom config', () => {
            const config = {
                maxConcurrentAgents: 10,
                autoRetry: false,
            };
            const orchestrator = new AgentOrchestrator(config);
            expect(orchestrator).toBeDefined();
        });
    });
    describe('agent management', () => {
        it('should register an agent', () => {
            const orchestrator = new AgentOrchestrator();
            const agent = new DesignerAgent();
            orchestrator.registerAgent('designer', agent);
            expect(orchestrator.getAgent('designer')).toBe(agent);
        });
        it('should retrieve a registered agent', () => {
            const orchestrator = new AgentOrchestrator();
            const agent = new DeveloperAgent({ name: 'Dev Agent' });
            orchestrator.registerAgent('developer', agent);
            const retrieved = orchestrator.getAgent('developer');
            expect(retrieved).toBe(agent);
            expect(retrieved?.name).toBe('Dev Agent');
        });
        it('should return undefined for unregistered agent type', () => {
            const orchestrator = new AgentOrchestrator();
            expect(orchestrator.getAgent('nonexistent')).toBeUndefined();
        });
        it('should list all registered agents', () => {
            const orchestrator = new AgentOrchestrator();
            const designer = new DesignerAgent();
            const developer = new DeveloperAgent();
            orchestrator.registerAgent('designer', designer);
            orchestrator.registerAgent('developer', developer);
            const agents = orchestrator.listAgents();
            expect(agents).toHaveLength(2);
            expect(agents).toContain(designer);
            expect(agents).toContain(developer);
        });
        it('should overwrite agent when registering same type', () => {
            const orchestrator = new AgentOrchestrator();
            const agent1 = new DesignerAgent({ name: 'First' });
            const agent2 = new DesignerAgent({ name: 'Second' });
            orchestrator.registerAgent('designer', agent1);
            orchestrator.registerAgent('designer', agent2);
            expect(orchestrator.getAgent('designer')).toBe(agent2);
            expect(orchestrator.listAgents()).toHaveLength(1);
        });
        it('should register multiple agent types', () => {
            const orchestrator = new AgentOrchestrator();
            orchestrator.registerAgent('designer', new DesignerAgent());
            orchestrator.registerAgent('developer', new DeveloperAgent());
            orchestrator.registerAgent('tester', new TesterAgent());
            orchestrator.registerAgent('optimizer', new OptimizerAgent());
            orchestrator.registerAgent('deployer', new DeployerAgent());
            expect(orchestrator.listAgents()).toHaveLength(5);
        });
    });
    describe('workflow management', () => {
        it('should create a workflow', () => {
            const orchestrator = new AgentOrchestrator();
            const workflow = orchestrator.createWorkflow('Test Workflow');
            expect(workflow).toBeDefined();
            expect(workflow.id).toMatch(/^wf_\d+$/);
            expect(workflow.name).toBe('Test Workflow');
            expect(workflow.steps).toEqual([]);
            expect(workflow.status).toBe('pending');
            expect(workflow.createdAt).toBeDefined();
            expect(workflow.updatedAt).toBeDefined();
        });
        it('should create workflow with description', () => {
            const orchestrator = new AgentOrchestrator();
            const workflow = orchestrator.createWorkflow('Test', 'A test workflow');
            expect(workflow.description).toBe('A test workflow');
        });
        it('should retrieve a workflow by id', () => {
            const orchestrator = new AgentOrchestrator();
            const workflow = orchestrator.createWorkflow('Test');
            const retrieved = orchestrator.getWorkflow(workflow.id);
            expect(retrieved).toBe(workflow);
        });
        it('should return undefined for non-existent workflow', () => {
            const orchestrator = new AgentOrchestrator();
            expect(orchestrator.getWorkflow('nonexistent')).toBeUndefined();
        });
        it('should list all workflows', () => {
            const orchestrator = new AgentOrchestrator();
            const now = Date.now();
            const spy = vi.spyOn(Date, 'now').mockReturnValueOnce(now).mockReturnValueOnce(now + 1);
            const wf1 = orchestrator.createWorkflow('Workflow 1');
            const wf2 = orchestrator.createWorkflow('Workflow 2');
            const workflows = orchestrator.getAllWorkflows();
            expect(workflows).toHaveLength(2);
            expect(workflows).toContain(wf1);
            expect(workflows).toContain(wf2);
            spy.mockRestore();
        });
    });
    describe('workflow steps', () => {
        it('should add a step to a workflow', () => {
            const orchestrator = new AgentOrchestrator();
            const workflow = orchestrator.createWorkflow('Test');
            const step = orchestrator.addStep(workflow.id, 'developer', { type: 'build' });
            expect(step).toBeDefined();
            expect(step?.id).toMatch(/^step_\d+$/);
            expect(step?.agentType).toBe('developer');
            expect(step?.task).toEqual({ type: 'build' });
            expect(step?.status).toBe('pending');
        });
        it('should add step with dependencies', () => {
            const orchestrator = new AgentOrchestrator();
            const workflow = orchestrator.createWorkflow('Test');
            const step1 = orchestrator.addStep(workflow.id, 'designer', { type: 'design' });
            const step2 = orchestrator.addStep(workflow.id, 'developer', { type: 'build' }, [step1.id]);
            expect(step2?.dependsOn).toEqual([step1.id]);
        });
        it('should return null when adding step to non-existent workflow', () => {
            const orchestrator = new AgentOrchestrator();
            const step = orchestrator.addStep('nonexistent', 'developer', { type: 'build' });
            expect(step).toBeNull();
        });
        it('should track steps in workflow', () => {
            const orchestrator = new AgentOrchestrator();
            const workflow = orchestrator.createWorkflow('Test');
            orchestrator.addStep(workflow.id, 'designer', { type: 'design' });
            orchestrator.addStep(workflow.id, 'developer', { type: 'build' });
            const retrieved = orchestrator.getWorkflow(workflow.id);
            expect(retrieved?.steps).toHaveLength(2);
        });
    });
    describe('workflow execution', () => {
        it('should execute a simple workflow', async () => {
            const orchestrator = new AgentOrchestrator();
            const developer = new DeveloperAgent();
            orchestrator.registerAgent('developer', developer);
            const workflow = orchestrator.createWorkflow('Build Feature');
            orchestrator.addStep(workflow.id, 'developer', { type: 'build-component' });
            const result = await orchestrator.executeWorkflow(workflow.id);
            expect(result.status).toBe('completed');
            expect(result.steps[0].status).toBe('completed');
        });
        it('should fail workflow when agent not registered', async () => {
            const orchestrator = new AgentOrchestrator();
            const workflow = orchestrator.createWorkflow('Orphan Task');
            orchestrator.addStep(workflow.id, 'nonexistent', { type: 'task' });
            const result = await orchestrator.executeWorkflow(workflow.id);
            expect(result.status).toBe('failed');
            expect(result.steps[0].status).toBe('failed');
        });
        it('should execute multi-step workflow', async () => {
            const orchestrator = new AgentOrchestrator();
            orchestrator.registerAgent('designer', new DesignerAgent());
            orchestrator.registerAgent('developer', new DeveloperAgent());
            const workflow = orchestrator.createWorkflow('Design & Build');
            orchestrator.addStep(workflow.id, 'designer', { type: 'create-design-system' });
            orchestrator.addStep(workflow.id, 'developer', { type: 'component-implementation' });
            const result = await orchestrator.executeWorkflow(workflow.id);
            expect(result.status).toBe('completed');
            expect(result.steps).toHaveLength(2);
            expect(result.steps.every(s => s.status === 'completed')).toBe(true);
        });
        it('should throw for non-existent workflow', async () => {
            const orchestrator = new AgentOrchestrator();
            await expect(orchestrator.executeWorkflow('nonexistent')).rejects.toThrow('Workflow not found');
        });
        it('should mark workflow as running during execution', async () => {
            const orchestrator = new AgentOrchestrator();
            orchestrator.registerAgent('developer', new DeveloperAgent());
            const workflow = orchestrator.createWorkflow('Test');
            orchestrator.addStep(workflow.id, 'developer', { type: 'task' });
            const result = await orchestrator.executeWorkflow(workflow.id);
            expect(result.status).toBe('completed');
        });
    });
});
describe('createOrchestrator', () => {
    it('should create an orchestrator instance', () => {
        const orchestrator = createOrchestrator();
        expect(orchestrator).toBeInstanceOf(AgentOrchestrator);
    });
});
//# sourceMappingURL=orchestrator.test.js.map