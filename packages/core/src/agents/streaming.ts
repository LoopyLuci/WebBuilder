// ============================================================================
// Streaming Handler — Manages streaming responses from providers
// ============================================================================

import {
  StreamChunk,
  StreamOptions,
  AssistantResponse,
  ChatMessage,
  TextContent,
  ToolUseContent,
  ProviderStreamEvent,
  ModelConfig,
  ProviderConfig,
} from './types.js';
import { ChatSession } from './chat-session.js';
import { getProviderAdapter, type ProviderAdapter } from './providers/index.js';
import { nanoid } from 'nanoid';

export interface StreamingSession {
  message: ChatMessage;
  textBuffer: string;
  currentToolCalls: Map<string, { name: string; args: string }>;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  startTime: number;
}

export class StreamingHandler {
  private activeStreams: Map<string, AbortController> = new Map();

  // ---------- Execute Streaming Request ----------

  async *executeStream(
    session: ChatSession,
    userMessage: string,
    providerConfig: ProviderConfig,
    modelConfig: ModelConfig
  ): AsyncGenerator<ChatMessage> {
    const streamId = `stream_${nanoid(10)}`;
    const controller = new AbortController();
    this.activeStreams.set(streamId, controller);

    try {
      // Add user message to session
      const userMsg: ChatMessage = {
        id: `msg_${nanoid(10)}`,
        role: 'user',
        content: [{ type: 'text', text: userMessage } as TextContent],
        timestamp: new Date().toISOString(),
      };
      session.addMessage(userMsg);

      // Get provider adapter
      const adapter = getProviderAdapter(providerConfig.name);

      // Build provider messages
      const providerMessages = this.buildProviderMessagesForSession(session);
      const toolDefs = session.config.provider
        ? []
        : []; // Get from tool registry if available

      // Execute stream
      const streamState: StreamingSession = {
        message: {
          id: `msg_${nanoid(10)}`,
          role: 'assistant',
          content: [],
          timestamp: new Date().toISOString(),
        },
        textBuffer: '',
        currentToolCalls: new Map(),
        startTime: Date.now(),
      };

      for await (const event of adapter.stream(providerMessages, toolDefs, modelConfig, providerConfig)) {
        if (controller.signal.aborted) break;

        const chunk = this.processStreamEvent(event, streamState);
        if (chunk) {
          yield this.buildPartialMessage(streamState, chunk);
        }
      }

      // Finalize
      const finalMessage = this.finalizeStreamMessage(streamState);
      session.addMessage(finalMessage);

      yield finalMessage;
    } finally {
      this.activeStreams.delete(streamId);
    }
  }

  // ---------- Cancel Streaming ----------

  cancelStream(streamId: string): boolean {
    const controller = this.activeStreams.get(streamId);
    if (controller) {
      controller.abort();
      this.activeStreams.delete(streamId);
      return true;
    }
    return false;
  }

  cancelAll(): void {
    for (const [id, controller] of this.activeStreams) {
      controller.abort();
      this.activeStreams.delete(id);
    }
  }

  // ---------- Event Processing ----------

  private processStreamEvent(event: ProviderStreamEvent, state: StreamingSession): StreamChunk | null {
    switch (event.type) {
      case 'content':
        if (event.content) {
          state.textBuffer += event.content;
          return {
            type: 'text',
            content: event.content,
          };
        }
        break;

      case 'tool_call':
        if (event.toolCall) {
          const id = event.toolCall.id ?? `tool_${nanoid(8)}`;
          const existing = state.currentToolCalls.get(id) ?? { name: '', args: '' };
          if (event.toolCall.function?.name) existing.name = event.toolCall.function.name;
          if (event.toolCall.function?.arguments) existing.args += event.toolCall.function.arguments;
          state.currentToolCalls.set(id, existing);
          return {
            type: 'tool_use',
            toolId: id,
            toolName: existing.name,
            toolInput: this.tryParseJson(existing.args),
          };
        }
        break;

      case 'usage':
        state.usage = event.usage;
        break;

      case 'finish':
        return {
          type: 'done',
          finishReason: event.finishReason,
          usage: event.usage,
        };

      case 'error':
        return {
          type: 'error',
          content: event.error,
        };
    }
    return null;
  }

  // ---------- Message Building ----------

  private buildPartialMessage(state: StreamingSession, _chunk: StreamChunk): ChatMessage {
    // Build a partial message for yielding
    const content: import('./types.js').MessageContent[] = [];

    if (state.textBuffer) {
      content.push({ type: 'text', text: state.textBuffer } as TextContent);
    }

    for (const [id, tc] of state.currentToolCalls) {
      content.push({
        type: 'tool_use',
        id,
        name: tc.name,
        input: this.tryParseJson(tc.args),
      } as ToolUseContent);
    }

    return {
      id: state.message.id,
      role: 'assistant',
      content,
      timestamp: new Date().toISOString(),
      metadata: { partial: true },
    };
  }

  private finalizeStreamMessage(state: StreamingSession): ChatMessage {
    const content: import('./types.js').MessageContent[] = [];

    if (state.textBuffer) {
      content.push({ type: 'text', text: state.textBuffer } as TextContent);
    }

    for (const [id, tc] of state.currentToolCalls) {
      content.push({
        type: 'tool_use',
        id,
        name: tc.name,
        input: this.tryParseJson(tc.args),
      } as ToolUseContent);
    }

    return {
      id: state.message.id,
      role: 'assistant',
      content,
      timestamp: new Date().toISOString(),
      metadata: {
        usage: state.usage,
        durationMs: Date.now() - state.startTime,
      },
    };
  }

  // ---------- Helpers ----------

  private tryParseJson(str: string): Record<string, unknown> {
    try {
      return JSON.parse(str);
    } catch {
      return { raw: str };
    }
  }

  private buildProviderMessagesForSession(session: ChatSession): import('./types.js').ProviderMessage[] {
    const messages = session.getMessages();
    const result: import('./types.js').ProviderMessage[] = [];

    // Add system prompt
    if (session.config.systemPrompt) {
      result.push({ role: 'system', content: session.config.systemPrompt });
    }

    for (const msg of messages) {
      if (msg.role === 'system') continue;

      if (msg.role === 'user') {
        const text = msg.content
          .filter((c) => c.type === 'text')
          .map((c) => (c as TextContent).text)
          .join('');
        result.push({ role: 'user', content: text });
      } else if (msg.role === 'assistant') {
        const providerMsg: import('./types.js').ProviderMessage = { role: 'assistant', content: '' };
        const textParts: string[] = [];
        const toolCalls: import('./types.js').ProviderToolCall[] = [];

        for (const c of msg.content) {
          if (c.type === 'text') textParts.push((c as TextContent).text);
          else if (c.type === 'tool_use') {
            const tu = c as ToolUseContent;
            toolCalls.push({
              id: tu.id,
              type: 'function',
              function: { name: tu.name, arguments: JSON.stringify(tu.input) },
            });
          }
        }

        providerMsg.content = textParts.join('');
        if (toolCalls.length > 0) providerMsg.tool_calls = toolCalls;
        result.push(providerMsg);
      } else if (msg.role === 'tool') {
        for (const c of msg.content) {
          if (c.type === 'tool_result') {
            result.push({
              role: 'tool',
              content: (c as import('./types.js').ToolResultContent).content,
              tool_call_id: (c as import('./types.js').ToolResultContent).toolUseId,
            });
          }
        }
      }
    }

    return result;
  }
}

export default StreamingHandler;