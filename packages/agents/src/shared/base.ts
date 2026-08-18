// ============================================================================
// Base Agent Class — Common functionality for all agents
// ============================================================================

export interface AgentConfig {
  id?: string;
  name?: string;
  type?: string;
  description?: string;
  model?: string;
  capabilities?: string[];
  tools?: string[];
}

export abstract class BaseAgent {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly description: string;
  readonly model: string;
  status: 'idle' | 'working' | 'waiting' | 'error' | 'offline' = 'idle';
  capabilities: string[] = [];
  tools: string[] = [];
  protected messageQueue: any[] = [];

  constructor(config: AgentConfig) {
    this.id = config.id ?? `agent_${Date.now()}`;
    this.name = config.name ?? 'Agent';
    this.type = config.type ?? 'custom';
    this.description = config.description ?? '';
    this.model = config.model ?? 'claude-3.5-sonnet';
    this.capabilities = config.capabilities ?? [];
    this.tools = config.tools ?? [];
  }

  abstract executeTask(task: any): Promise<any>;

  async start(): Promise<void> {
    this.status = 'working';
  }

  async stop(): Promise<void> {
    this.status = 'idle';
  }

  pause(): void {
    this.status = 'waiting';
  }

  resume(): void {
    this.status = 'working';
  }

  onError(error: Error): void {
    this.status = 'error';
    console.error(`[${this.name}] Error: ${error.message}`);
  }

  getStatus(): { id: string; name: string; type: string; status: string } {
    return { id: this.id, name: this.name, type: this.type, status: this.status };
  }

  send(message: any): void {
    this.messageQueue.push(message);
  }

  receive(): any | undefined {
    return this.messageQueue.shift();
  }
}

export default BaseAgent;
