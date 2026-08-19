import { describe, it, expect } from 'vitest';
import { BaseAgent, type AgentConfig } from '../../dist/index.js';

// Concrete implementation for testing the abstract BaseAgent
class TestAgent extends BaseAgent {
  async executeTask(task: any): Promise<any> {
    return { success: true, output: `Task executed: ${task.type}` };
  }
}

describe('BaseAgent', () => {
  describe('creation', () => {
    it('should create an agent with default values', () => {
      const agent = new TestAgent({});
      expect(agent.id).toBeDefined();
      expect(agent.name).toBe('Agent');
      expect(agent.type).toBe('custom');
      expect(agent.description).toBe('');
      expect(agent.model).toBe('claude-3.5-sonnet');
      expect(agent.status).toBe('idle');
      expect(agent.capabilities).toEqual([]);
      expect(agent.tools).toEqual([]);
    });

    it('should create an agent with custom config', () => {
      const config: AgentConfig = {
        id: 'test-123',
        name: 'Test Agent',
        type: 'test',
        description: 'A test agent',
        model: 'gpt-4',
        capabilities: ['test-capability'],
        tools: ['test-tool'],
      };
      const agent = new TestAgent(config);
      expect(agent.id).toBe('test-123');
      expect(agent.name).toBe('Test Agent');
      expect(agent.type).toBe('test');
      expect(agent.description).toBe('A test agent');
      expect(agent.model).toBe('gpt-4');
      expect(agent.capabilities).toEqual(['test-capability']);
      expect(agent.tools).toEqual(['test-tool']);
    });

    it('should generate an id if not provided', () => {
      const agent = new TestAgent({});
      expect(agent.id).toMatch(/^agent_\d+$/);
    });
  });

  describe('status management', () => {
    it('should start the agent', async () => {
      const agent = new TestAgent({});
      await agent.start();
      expect(agent.status).toBe('working');
    });

    it('should stop the agent', async () => {
      const agent = new TestAgent({});
      await agent.start();
      await agent.stop();
      expect(agent.status).toBe('idle');
    });

    it('should pause the agent', async () => {
      const agent = new TestAgent({});
      await agent.start();
      agent.pause();
      expect(agent.status).toBe('waiting');
    });

    it('should resume the agent', async () => {
      const agent = new TestAgent({});
      await agent.start();
      agent.pause();
      agent.resume();
      expect(agent.status).toBe('working');
    });

    it('should set status to error on error', () => {
      const agent = new TestAgent({});
      agent.onError(new Error('Test error'));
      expect(agent.status).toBe('error');
    });
  });

  describe('getStatus', () => {
    it('should return agent status object', () => {
      const agent = new TestAgent({ id: 'test-123', name: 'Test', type: 'test' });
      const status = agent.getStatus();
      expect(status).toEqual({
        id: 'test-123',
        name: 'Test',
        type: 'test',
        status: 'idle',
      });
    });
  });

  describe('message queue', () => {
    it('should send and receive messages', () => {
      const agent = new TestAgent({});
      const message = { type: 'test', content: 'hello' };
      agent.send(message);
      const received = agent.receive();
      expect(received).toEqual(message);
    });

    it('should return undefined when queue is empty', () => {
      const agent = new TestAgent({});
      const received = agent.receive();
      expect(received).toBeUndefined();
    });

    it('should process messages in FIFO order', () => {
      const agent = new TestAgent({});
      agent.send({ type: 'first' });
      agent.send({ type: 'second' });
      expect(agent.receive()).toEqual({ type: 'first' });
      expect(agent.receive()).toEqual({ type: 'second' });
    });
  });

  describe('executeTask', () => {
    it('should execute a task and return result', async () => {
      const agent = new TestAgent({});
      const result = await agent.executeTask({ type: 'test-task' });
      expect(result).toEqual({ success: true, output: 'Task executed: test-task' });
    });
  });
});