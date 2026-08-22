// ============================================================================
// ChatSession — Manages conversation history and message processing
// ============================================================================

import {
  ChatSessionConfig,
  ChatSessionState,
  ChatMessage,
  MessageContent,
  TextContent,
  ToolUseContent,
  ToolResultContent,
  ImageContent,
  ModelConfig,
  ProviderName,
  ToolDefinition,
  ToolResult,
  ToolContext,
  TokenUsage,
} from './types.js';
import { ToolRegistry } from './tool-registry.js';
import { getProviderAdapter, type ProviderAdapter } from './providers/index.js';
import { nanoid } from 'nanoid';

export class ChatSession {
  readonly config: ChatSessionConfig;
  private toolRegistry: ToolRegistry;
  private messages: ChatMessage[] = [];
  private turnCount: number = 0;
  private totalTokens: number = 0;
  private createdAt: string;
  private updatedAt: string;

  constructor(config: ChatSessionConfig, toolRegistry: ToolRegistry) {
    this.config = config;
    this.toolRegistry = toolRegistry;
    this.createdAt = new Date().toISOString();
    this.updatedAt = this.createdAt;
  }

  // ---------- Message History ----------

  getMessages(): ChatMessage[] {
    return [...this.messages];
  }

  getHistory(): ChatMessage[] {
    return this.getMessages();
  }

  addMessage(message: ChatMessage): void {
    this.messages.push(message);
    this.updatedAt = new Date().toISOString();
    this.trimHistory();
  }

  private trimHistory(): void {
    const max = this.config.maxHistory ?? 50;
    if (this.messages.length > max) {
      // Keep system message if present, trim oldest non-system messages
      const systemMessages = this.messages.filter((m) => m.role === 'system');
      const otherMessages = this.messages.filter((m) => m.role !== 'system');
      const trimmed = otherMessages.slice(-(max - systemMessages.length));
      this.messages = [...systemMessages, ...trimmed];
    }
  }

  clearHistory(): void {
    this.messages = [];
    this.turnCount = 0;
    this.totalTokens = 0;
    this.updatedAt = new Date().toISOString();
  }

  getLastMessage(): ChatMessage | undefined {
    return this.messages[this.messages.length - 1];
  }

  // ---------- State ----------

  getState(): ChatSessionState {
    return {
      config: this.config,
      messages: [...this.messages],
      memory: [],
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      turnCount: this.turnCount,
      totalTokens: this.totalTokens,
    };
  }

  // ---------- Core Processing ----------

  async processMessage(
    userMessage: string,
    attachments?: ImageContent[]
  ): Promise<{ message: ChatMessage; usage?: TokenUsage; finishReason?: string }> {
    // Build user message content
    const content: MessageContent[] = [];
    if (userMessage) {
      content.push({ type: 'text', text: userMessage } as TextContent);
    }
    if (attachments) {
      for (const att of attachments) {
        content.push(att);
      }
    }

    // Add user message to history
    const userMsg: ChatMessage = {
      id: `msg_${nanoid(10)}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    this.addMessage(userMsg);

    // Get provider adapter
    const adapter = getProviderAdapter(this.config.provider ?? 'openai');

    // Build messages for provider
    const providerMessages = this.buildProviderMessages();

    // Get tool definitions
    const toolDefs = this.toolRegistry.getProviderDefinitions();

    // Execute chat with tool support
    const response = await this.executeWithToolLoop(
      adapter,
      providerMessages,
      toolDefs,
      this.config.model ?? { model: 'gpt-4o' }
    );

    // Add assistant response to history
    this.addMessage(response.message);

    this.turnCount++;
    if (response.usage) {
      this.totalTokens += response.usage.totalTokens;
    }

    return response;
  }

  // ---------- Tool Execution Loop ----------

  private async executeWithToolLoop(
    adapter: ProviderAdapter,
    messages: import('./types.js').ProviderMessage[],
    toolDefs: import('./types.js').ProviderToolDefinition[],
    modelConfig: ModelConfig,
    maxIterations: number = 5
  ): Promise<{ message: ChatMessage; usage?: TokenUsage; finishReason?: string }> {
    let iteration = 0;
    let lastResponse: import('./types.js').ProviderResponse | undefined;

    const providerConfig = this.getProviderConfig();

    while (iteration < maxIterations) {
      iteration++;

      const response = await adapter.chat(messages, toolDefs, modelConfig, providerConfig);
      lastResponse = response;

      // If no tool calls, we're done
      if (!response.message.tool_calls || response.message.tool_calls.length === 0) {
        const assistantMsg: ChatMessage = {
          id: `msg_${nanoid(10)}`,
          role: 'assistant',
          content: [{ type: 'text', text: response.message.content as string }],
          timestamp: new Date().toISOString(),
          metadata: { finishReason: response.finishReason },
        };
        return { message: assistantMsg, usage: response.usage, finishReason: response.finishReason };
      }

      // Process tool calls
      const content: MessageContent[] = [];
      if (response.message.content) {
        content.push({ type: 'text', text: response.message.content as string });
      }

      // Add assistant message with tool calls
      for (const tc of response.message.tool_calls) {
        content.push({
          type: 'tool_use',
          id: tc.id,
          name: tc.function.name,
          input: JSON.parse(tc.function.arguments || '{}'),
        } as ToolUseContent);
      }

      const assistantMsg: ChatMessage = {
        id: `msg_${nanoid(10)}`,
        role: 'assistant',
        content,
        timestamp: new Date().toISOString(),
      };
      this.addMessage(assistantMsg);

      // Execute each tool call
      for (const tc of response.message.tool_calls) {
        const result = await this.executeToolCall(tc.id, tc.function.name, JSON.parse(tc.function.arguments || '{}'));

        const toolResultMsg: ChatMessage = {
          id: `msg_${nanoid(10)}`,
          role: 'tool',
          content: [{
            type: 'tool_result',
            toolUseId: tc.id,
            content: result.output,
            isError: !result.success,
          } as ToolResultContent],
          timestamp: new Date().toISOString(),
        };
        this.addMessage(toolResultMsg);
      }

      // Rebuild messages for next iteration
      messages = this.buildProviderMessages();
    }

    // Max iterations reached - return last response
    if (lastResponse) {
      const assistantMsg: ChatMessage = {
        id: `msg_${nanoid(10)}`,
        role: 'assistant',
        content: [{ type: 'text', text: lastResponse.message.content as string }],
        timestamp: new Date().toISOString(),
        metadata: { finishReason: 'max_iterations' },
      };
      return { message: assistantMsg, usage: lastResponse.usage, finishReason: 'max_iterations' };
    }

    // Fallback
    const fallbackMsg: ChatMessage = {
      id: `msg_${nanoid(10)}`,
      role: 'assistant',
      content: [{ type: 'text', text: 'I apologize, but I was unable to complete the request.' }],
      timestamp: new Date().toISOString(),
    };
    return { message: fallbackMsg, finishReason: 'error' };
  }

  // ---------- Tool Execution ----------

  private async executeToolCall(toolCallId: string, toolName: string, input: Record<string, unknown>): Promise<ToolResult> {
    const tool = this.toolRegistry.get(toolName);
    if (!tool) {
      return { success: false, output: `Tool not found: ${toolName}` };
    }

    const context: ToolContext = {
      sessionId: this.config.id,
      agentId: this.config.agentId,
      metadata: this.config.metadata,
    };

    try {
      const result = await tool.handler(input, context);
      return result;
    } catch (error) {
      return {
        success: false,
        output: `Tool execution error: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  // ---------- Provider Message Building ----------

  private buildProviderMessages(): import('./types.js').ProviderMessage[] {
    const result: import('./types.js').ProviderMessage[] = [];

    // Add system prompt if present
    if (this.config.systemPrompt) {
      result.push({
        role: 'system',
        content: this.config.systemPrompt,
      });
    }

    // Convert messages
    for (const msg of this.messages) {
      if (msg.role === 'system') continue; // Already added

      if (msg.role === 'user') {
        const textContent = this.extractTextContent(msg.content);
        result.push({ role: 'user', content: textContent });
      } else if (msg.role === 'assistant') {
        const providerMsg: import('./types.js').ProviderMessage = {
          role: 'assistant',
          content: '',
        };

        // Extract text
        const textParts: string[] = [];
        const toolCalls: import('./types.js').ProviderToolCall[] = [];

        for (const c of msg.content) {
          if (c.type === 'text') {
            textParts.push((c as TextContent).text);
          } else if (c.type === 'tool_use') {
            const tu = c as ToolUseContent;
            toolCalls.push({
              id: tu.id,
              type: 'function',
              function: { name: tu.name, arguments: JSON.stringify(tu.input) },
            });
          }
        }

        providerMsg.content = textParts.join('');
        if (toolCalls.length > 0) {
          providerMsg.tool_calls = toolCalls;
        }

        result.push(providerMsg);
      } else if (msg.role === 'tool') {
        for (const c of msg.content) {
          if (c.type === 'tool_result') {
            const tr = c as ToolResultContent;
            result.push({
              role: 'tool',
              content: tr.content,
              tool_call_id: tr.toolUseId,
            });
          }
        }
      }
    }

    return result;
  }

  private extractTextContent(content: MessageContent[]): string {
    return content
      .filter((c) => c.type === 'text')
      .map((c) => (c as TextContent).text)
      .join('');
  }

  // ---------- Provider Config ----------

  private getProviderConfig(): import('./types.js').ProviderConfig {
    // This would typically come from the agent's config
    // For now, return a default that can be overridden
    return {
      name: this.config.provider ?? 'openai',
      apiKey: process.env.OPENAI_API_KEY ?? '',
    };
  }
}

export default ChatSession;