// ============================================================================
// Agent Chat System — Barrel exports
// ============================================================================

// Types
export {
  // Provider & Model
  ProviderName,
  ProviderConfig,
  ModelConfig,
  // Messages
  MessageRole,
  TextContent,
  ToolUseContent,
  ToolResultContent,
  ImageContent,
  MessageContent,
  ChatMessage,
  // Tools
  ToolParameter,
  ToolDefinition,
  ToolResult,
  ToolContext,
  RegisteredTool,
  // Streaming
  StreamChunk,
  TokenUsage,
  StreamOptions,
  AssistantResponse,
  // Memory
  MemoryEntry,
  MemoryQuery,
  MemoryConfig,
  // Session
  ChatSessionConfig,
  ChatSessionState,
  // Agent
  AgentConfig,
  AgentCapabilities,
  // Chat
  ChatRequest,
  ChatResponse,
  // Provider Adapters
  ProviderMessage,
  ProviderToolCall,
  ProviderToolDefinition,
  ProviderResponse,
  ProviderStreamEvent,
  ProviderAdapter,
} from './types.js';

// Core classes
export { BaseAgent } from './agent.js';
export { ChatAgent, AgentManager, AgentRegistration, getAgentManager } from './agent-manager.js';
export { ChatSession } from './chat-session.js';
export { StreamingHandler, StreamingSession } from './streaming.js';
export { ToolRegistry } from './tool-registry.js';
export { MemorySystem, DEFAULT_MEMORY_CONFIG } from './memory.js';

// Provider adapters
export {
  getProviderAdapter,
  createProviderAdapter,
  registerProviderAdapter,
  clearAdapterCache,
  getAvailableProviders,
  OpenAIAdapter,
  AnthropicAdapter,
  GoogleAdapter,
} from './providers/index.js';

// Default export
export { default as AgentChatSystem } from './agent-manager.js';