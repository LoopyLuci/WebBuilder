// ============================================================================
// AgentManager — Manages agent lifecycle and routing
// ============================================================================

import { AgentConfig, ChatRequest, ChatResponse, ModelConfig, ProviderConfig, ChatMessage } from './types.js';
import { BaseAgent } from './agent.js';
import { ChatSession } from './chat-session.js';
import { ToolRegistry } from './tool-registry.js';
import { MemorySystem } from './memory.js';
import { nanoid } from 'nanoid';

/**
 * Concrete agent implementation for the chat system.
 * Extends BaseAgent with full provider integration.
 */
export class ChatAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super(config);
  }

  protected async executeWithTools(
    session: ChatSession,
    message: string,
    attachments?: ChatRequest['attachments']
  ): Promise<{ message: ChatMessage; usage?: { promptTokens: number; completionTokens: number; totalTokens: number }; finishReason?: string }> {
    return session.processMessage(message, attachments);
  }
}

export interface AgentRegistration {
  id: string;
  name: string;
  description?: string;
  config: AgentConfig;
  createdAt: string;
}

export class AgentManager {
  private agents: Map<string, ChatAgent> = new Map();
  private registrations: Map<string, AgentRegistration> = new Map();

  // ---------- Agent Lifecycle ----------

  createAgent(config: Partial<AgentConfig> & { name: string }): ChatAgent {
    const fullConfig: AgentConfig = {
      id: config.id ?? `agent_${nanoid(12)}`,
      name: config.name,
      description: config.description,
      systemPrompt: config.systemPrompt,
      model: config.model,
      provider: config.provider,
      tools: config.tools,
      enableMemory: config.enableMemory ?? true,
      memoryConfig: config.memoryConfig,
      capabilities: config.capabilities,
      metadata: config.metadata,
    };

    const agent = new ChatAgent(fullConfig);
    this.agents.set(fullConfig.id, agent);

    const registration: AgentRegistration = {
      id: fullConfig.id,
      name: fullConfig.name,
      description: fullConfig.description,
      config: fullConfig,
      createdAt: new Date().toISOString(),
    };
    this.registrations.set(fullConfig.id, registration);

    return agent;
  }

  getAgent(id: string): ChatAgent | undefined {
    return this.agents.get(id);
  }

  deleteAgent(id: string): boolean {
    const agent = this.agents.get(id);
    if (agent) {
      // Cleanup all sessions
      for (const sessionId of agent.listSessions()) {
        agent.deleteSession(sessionId);
      }
    }
    this.registrations.delete(id);
    return this.agents.delete(id);
  }

  listAgents(): AgentRegistration[] {
    return Array.from(this.registrations.values());
  }

  getAgentByName(name: string): ChatAgent | undefined {
    for (const reg of this.registrations.values()) {
      if (reg.name === name) return this.agents.get(reg.id);
    }
    return undefined;
  }

  updateAgent(id: string, updates: Partial<AgentConfig>): ChatAgent | undefined {
    const existing = this.agents.get(id);
    if (!existing) return undefined;

    // Create merged config
    const mergedConfig: AgentConfig = {
      id: existing.id,
      name: updates.name ?? existing.name,
      description: updates.description ?? existing.description,
      systemPrompt: updates.systemPrompt ?? existing.systemPrompt,
      model: updates.model ?? existing.modelConfig,
      provider: updates.provider ?? existing.providerConfig,
      tools: updates.tools ?? existing.listTools(),
      enableMemory: updates.enableMemory ?? existing.enableMemory,
      memoryConfig: updates.memoryConfig ?? existing.memoryConfig,
      capabilities: updates.capabilities ?? existing.capabilities ? Object.keys(existing.capabilities) : undefined,
      metadata: { ...existing.metadata, ...updates.metadata },
    };

    // Remove old and create new
    this.deleteAgent(id);
    return this.createAgent(mergedConfig);
  }

  // ---------- Convenience Methods ----------

  async chat(agentId: string, request: ChatRequest): Promise<ChatResponse> {
    const agent = this.agents.get(agentId);
    if (!agent) throw new Error(`Agent not found: ${agentId}`);
    return agent.chat(request);
  }

  async *streamChat(agentId: string, request: ChatRequest): AsyncGenerator<ChatMessage> {
    const agent = this.agents.get(agentId);
    if (!agent) throw new Error(`Agent not found: ${agentId}`);
    yield* agent.streamChat(request);
  }

  // ---------- Tool Management ----------

  registerToolToAgent(agentId: string, definition: import('./types.js').ToolDefinition): boolean {
    const agent = this.agents.get(agentId);
    if (!agent) return false;
    agent.registerTool(definition);
    return true;
  }

  registerToolToAll(definition: import('./types.js').ToolDefinition): number {
    let count = 0;
    for (const agent of this.agents.values()) {
      agent.registerTool(definition);
      count++;
    }
    return count;
  }

  // ---------- Memory Access ----------

  async searchAgentMemory(agentId: string, query: { text?: string; type?: import('./types.js').MemoryEntry['type']; tags?: string[]; limit?: number }): Promise<import('./types.js').MemoryEntry[]> {
    const agent = this.agents.get(agentId);
    if (!agent) throw new Error(`Agent not found: ${agentId}`);
    return agent.searchMemory(query);
  }

  // ---------- Stats ----------

  getStats(): {
    totalAgents: number;
    totalSessions: number;
    agentDetails: { id: string; name: string; sessions: number; tools: number }[];
  } {
    const agentDetails = Array.from(this.agents.values()).map((agent) => ({
      id: agent.id,
      name: agent.name,
      sessions: agent.listSessions().length,
      tools: agent.listTools().length,
    }));

    return {
      totalAgents: this.agents.size,
      totalSessions: agentDetails.reduce((sum, a) => sum + a.sessions, 0),
      agentDetails,
    };
  }
}

// Singleton instance
let globalManager: AgentManager | null = null;

export function getAgentManager(): AgentManager {
  if (!globalManager) {
    globalManager = new AgentManager();
  }
  return globalManager;
}

export default AgentManager;