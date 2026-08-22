// ============================================================================
// Agent Chat System — Type Definitions
// ============================================================================

// ---------- Provider & Model ----------

export type ProviderName = 'openai' | 'anthropic' | 'google' | 'custom';

export interface ProviderConfig {
  name: ProviderName;
  apiKey: string;
  baseUrl?: string;
  defaultModel?: string;
  headers?: Record<string, string>;
  maxRetries?: number;
  timeout?: number;
}

export interface ModelConfig {
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
}

// ---------- Messages ----------

export type MessageRole = 'system' | 'user' | 'assistant' | 'tool';

export interface TextContent {
  type: 'text';
  text: string;
}

export interface ToolUseContent {
  type: 'tool_use';
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface ToolResultContent {
  type: 'tool_result';
  toolUseId: string;
  content: string;
  isError?: boolean;
}

export interface ImageContent {
  type: 'image';
  url: string;
  mimeType?: string;
}

export type MessageContent = TextContent | ToolUseContent | ToolResultContent | ImageContent;

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: MessageContent[];
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// ---------- Tools ----------

export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required?: boolean;
  enum?: (string | number)[];
  default?: unknown;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: ToolParameter[];
  handler: (input: Record<string, unknown>, context: ToolContext) => Promise<ToolResult> | ToolResult;
}

export interface ToolResult {
  success: boolean;
  output: string;
  data?: unknown;
}

export interface ToolContext {
  sessionId: string;
  agentId: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export interface RegisteredTool {
  definition: ToolDefinition;
  enabled: boolean;
  category?: string;
}

// ---------- Streaming ----------

export interface StreamChunk {
  type: 'text' | 'tool_use' | 'tool_result' | 'error' | 'done' | 'thinking';
  content?: string;
  toolName?: string;
  toolInput?: Record<string, unknown>;
  toolId?: string;
  finishReason?: string;
  usage?: TokenUsage;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface StreamOptions {
  onChunk?: (chunk: StreamChunk) => void | Promise<void>;
  onComplete?: (response: AssistantResponse) => void | Promise<void>;
  onError?: (error: Error) => void | Promise<void>;
  signal?: AbortSignal;
}

export interface AssistantResponse {
  message: ChatMessage;
  usage?: TokenUsage;
  finishReason?: string;
  durationMs: number;
}

// ---------- Memory ----------

export interface MemoryEntry {
  id: string;
  content: string;
  type: 'fact' | 'preference' | 'context' | 'summary';
  importance: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  ttl?: number;
  metadata?: Record<string, unknown>;
}

export interface MemoryQuery {
  text?: string;
  type?: MemoryEntry['type'];
  tags?: string[];
  limit?: number;
  since?: string;
}

export interface MemoryConfig {
  maxEntries?: number;
  autoSummarize?: boolean;
  summarizationThreshold?: number;
  persistencePath?: string;
}

// ---------- Session ----------

export interface ChatSessionConfig {
  id: string;
  agentId: string;
  systemPrompt?: string;
  model?: ModelConfig;
  provider?: ProviderName;
  maxHistory?: number;
  enableMemory?: boolean;
  metadata?: Record<string, unknown>;
}

export interface ChatSessionState {
  config: ChatSessionConfig;
  messages: ChatMessage[];
  memory: MemoryEntry[];
  createdAt: string;
  updatedAt: string;
  turnCount: number;
  totalTokens: number;
}

// ---------- Agent ----------

export interface AgentConfig {
  id: string;
  name: string;
  description?: string;
  systemPrompt?: string;
  model?: ModelConfig;
  provider?: ProviderConfig;
  tools?: string[];
  enableMemory?: boolean;
  memoryConfig?: MemoryConfig;
  capabilities?: string[];
  metadata?: Record<string, unknown>;
}

export interface AgentCapabilities {
  streaming: boolean;
  toolUse: boolean;
  memory: boolean;
  multiTurn: boolean;
  imageInput: boolean;
}

// ---------- Chat ----------

export interface ChatRequest {
  message: string;
  sessionId?: string;
  attachments?: ImageContent[];
  metadata?: Record<string, unknown>;
}

export interface ChatResponse {
  sessionId: string;
  message: ChatMessage;
  usage?: TokenUsage;
  durationMs: number;
}

// ---------- Provider Adapters ----------

export interface ProviderMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | MessageContent[];
  tool_calls?: ProviderToolCall[];
  tool_call_id?: string;
}

export interface ProviderToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface ProviderToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface ProviderResponse {
  message: ProviderMessage;
  usage?: TokenUsage;
  finishReason?: string;
}

export interface ProviderStreamEvent {
  type: 'content' | 'tool_call' | 'usage' | 'finish' | 'error';
  content?: string;
  toolCall?: Partial<ProviderToolCall>;
  usage?: TokenUsage;
  finishReason?: string;
  error?: string;
}

export interface ProviderAdapter {
  readonly name: ProviderName;
  readonly supportedModels: string[];

  chat(
    messages: ProviderMessage[],
    tools: ProviderToolDefinition[],
    model: ModelConfig,
    config: ProviderConfig
  ): Promise<ProviderResponse>;

  stream(
    messages: ProviderMessage[],
    tools: ProviderToolDefinition[],
    model: ModelConfig,
    config: ProviderConfig
  ): AsyncGenerator<ProviderStreamEvent>;

  validateConfig(config: ProviderConfig): boolean;
}