// ============================================================================
// Agent Base Class — Core abstraction for the chat system
// ============================================================================

import {
  AgentConfig,
  AgentCapabilities,
  ChatRequest,
  ChatResponse,
  ModelConfig,
  ProviderConfig,
  ChatMessage,
  ToolDefinition,
  ToolResult,
  ToolContext,
  MemoryEntry,
  MemoryConfig,
  ChatSessionConfig,
} from './types.js';
import { ChatSession } from './chat-session.js';
import { ToolRegistry } from './tool-registry.js';
import { MemorySystem, DEFAULT_MEMORY_CONFIG } from './memory.js';
import { StreamingHandler } from './streaming.js';
import { getProviderAdapter, type ProviderAdapter } from './providers/index.js';
import { nanoid } from 'nanoid';

export abstract class BaseAgent {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly capabilities: AgentCapabilities;

  protected systemPrompt: string;
  protected modelConfig: ModelConfig;
  protected providerConfig: ProviderConfig;
  protected toolRegistry: ToolRegistry;
  protected memorySystem: MemorySystem | null = null;
  protected enableMemory: boolean;
  protected memoryConfig: MemoryConfig;
  protected metadata: Record<string, unknown>;

  private sessions: Map<string, ChatSession> = new Map();
  private streamingHandler: StreamingHandler;

  constructor(config: AgentConfig) {
    this.id = config.id;
    this.name = config.name;
    this.description = config.description ?? '';
    this.systemPrompt = config.systemPrompt ?? 'You are a helpful AI assistant.';
    this.modelConfig = config.model ?? { model: 'gpt-4o', temperature: 0.7 };
    this.providerConfig = config.provider ?? { name: 'openai', apiKey: '' };
    this.enableMemory = config.enableMemory ?? true;
    this.memoryConfig = { ...DEFAULT_MEMORY_CONFIG, ...config.memoryConfig };
    this.metadata = config.metadata ?? {};
    this.toolRegistry = new ToolRegistry();
    this.streamingHandler = new StreamingHandler();

    this.capabilities = {
      streaming: true,
      toolUse: true,
      memory: this.enableMemory,
      multiTurn: true,
      imageInput: false,
    };

    // Register tools if provided
    if (config.tools) {
      for (const toolName of config.tools) {
        // Tools are registered separately via registerTool
      }
    }
  }

  // ---------- Session Management ----------

  createSession(sessionConfig?: Partial<ChatSessionConfig>): ChatSession {
    const config: ChatSessionConfig = {
      id: sessionConfig?.id ?? `session_${nanoid(12)}`,
      agentId: this.id,
      systemPrompt: this.systemPrompt,
      model: this.modelConfig,
      provider: this.providerConfig.name,
      maxHistory: sessionConfig?.maxHistory ?? 50,
      enableMemory: this.enableMemory,
      metadata: sessionConfig?.metadata,
      ...sessionConfig,
    };

    const session = new ChatSession(config, this.toolRegistry);
    this.sessions.set(config.id, session);
    return session;
  }

  getSession(sessionId: string): ChatSession | undefined {
    return this.sessions.get(sessionId);
  }

  deleteSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  listSessions(): string[] {
    return Array.from(this.sessions.keys());
  }

  // ---------- Tool Management ----------

  registerTool(definition: ToolDefinition): void {
    this.toolRegistry.register(definition);
  }

  unregisterTool(name: string): boolean {
    return this.toolRegistry.unregister(name);
  }

  listTools(): string[] {
    return this.toolRegistry.listTools();
  }

  // ---------- Memory Management ----------

  protected initMemory(): void {
    if (this.enableMemory && !this.memorySystem) {
      this.memorySystem = new MemorySystem(this.memoryConfig);
    }
  }

  async addMemory(entry: Omit<MemoryEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<MemoryEntry> {
    this.initMemory();
    return this.memorySystem!.add(entry);
  }

  async searchMemory(query: { text?: string; type?: MemoryEntry['type']; tags?: string[]; limit?: number }): Promise<MemoryEntry[]> {
    if (!this.memorySystem) return [];
    return this.memorySystem.search(query);
  }

  // ---------- Core Chat ----------

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const startTime = Date.now();
    let session: ChatSession;

    if (request.sessionId) {
      session = this.getSession(request.sessionId) ?? this.createSession({ id: request.sessionId });
    } else {
      session = this.createSession();
    }

    // Add memory context if enabled
    let enrichedMessage = request.message;
    if (this.enableMemory) {
      this.initMemory();
      const relevantMemories = await this.memorySystem!.search({
        text: request.message,
        limit: 5,
      });
      if (relevantMemories.length > 0) {
        const memoryContext = relevantMemories.map((m) => `[${m.type}] ${m.content}`).join('\n');
        enrichedMessage = `[Context from memory]\n${memoryContext}\n\n[User Message]\n${request.message}`;
      }
    }

    // Execute tool-augmented chat with the provider
    const response = await this.executeWithTools(session, enrichedMessage, request.attachments);

    // Store in memory
    if (this.enableMemory && this.memorySystem) {
      await this.memorySystem.add({
        content: `User: ${request.message}\nAssistant: ${this.extractText(response.message.content)}`,
        type: 'context',
        importance: 0.5,
        tags: ['conversation'],
      });
    }

    const durationMs = Date.now() - startTime;
    return {
      sessionId: session.config.id,
      message: response.message,
      usage: response.usage,
      durationMs,
    };
  }

  // ---------- Streaming Chat ----------

  async *streamChat(request: ChatRequest): AsyncGenerator<ChatMessage> {
    let session: ChatSession;

    if (request.sessionId) {
      session = this.getSession(request.sessionId) ?? this.createSession({ id: request.sessionId });
    } else {
      session = this.createSession();
    }

    // Add memory context if enabled
    let enrichedMessage = request.message;
    if (this.enableMemory) {
      this.initMemory();
      const relevantMemories = await this.memorySystem!.search({
        text: request.message,
        limit: 5,
      });
      if (relevantMemories.length > 0) {
        const memoryContext = relevantMemories.map((m) => `[${m.type}] ${m.content}`).join('\n');
        enrichedMessage = `[Context from memory]\n${memoryContext}\n\n[User Message]\n${request.message}`;
      }
    }

    const stream = this.streamingHandler.executeStream(
      session,
      enrichedMessage,
      this.providerConfig,
      this.modelConfig
    );

    for await (const message of stream) {
      yield message;
    }
  }

  // ---------- Abstract Methods ----------

  protected abstract executeWithTools(
    session: ChatSession,
    message: string,
    attachments?: ChatRequest['attachments']
  ): Promise<{ message: ChatMessage; usage?: { promptTokens: number; completionTokens: number; totalTokens: number }; finishReason?: string }>;

  // ---------- Public Getters for Serialization ----------

  getSystemPrompt(): string { return this.systemPrompt; }
  getModelConfig(): ModelConfig { return this.modelConfig; }
  getProviderConfig(): ProviderConfig { return this.providerConfig; }
  getEnableMemory(): boolean { return this.enableMemory; }
  getMemoryConfig(): MemoryConfig { return this.memoryConfig; }
  getMetadata(): Record<string, unknown> { return this.metadata; }

  protected extractText(content: ChatMessage['content']): string {
    return content
      .filter((c) => c.type === 'text')
      .map((c) => (c as { type: 'text'; text: string }).text)
      .join('');
  }

  protected getProviderAdapter(): ProviderAdapter {
    return getProviderAdapter(this.providerConfig.name);
  }
}

export default BaseAgent;