// ============================================================================
// Provider Adapter - Anthropic Claude API integration
// ============================================================================

import {
  ProviderConfig,
  ProviderMessage,
  ProviderToolDefinition,
  ProviderResponse,
  ProviderStreamEvent,
  ModelConfig,
  TokenUsage,
} from '../types.js';

export class AnthropicAdapter {
  readonly name = 'anthropic' as const;
  readonly supportedModels = [
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022',
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307',
    'claude-2.1',
    'claude-2.0',
  ];

  private baseUrl: string;
  private apiKey: string;
  private apiVersion: string;
  private timeout: number;
  private maxRetries: number;

  constructor(config: ProviderConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl ?? 'https://api.anthropic.com/v1';
    this.apiVersion = '2023-06-01';
    this.timeout = config.timeout ?? 60000;
    this.maxRetries = config.maxRetries ?? 3;
  }

  async chat(
    messages: ProviderMessage[],
    tools: ProviderToolDefinition[],
    model: ModelConfig,
    config?: ProviderConfig
  ): Promise<ProviderResponse> {
    const url = this.baseUrl + '/messages';
    const { system, anthropicMessages } = this.toAnthropicMessages(messages);

    const body: Record<string, unknown> = {
      model: model.model,
      messages: anthropicMessages,
      max_tokens: model.maxTokens ?? 4096,
      temperature: model.temperature ?? 0.7,
      top_p: model.topP,
    };

    if (system) {
      body.system = system;
    }

    if (tools.length > 0) {
      body.tools = tools.map((t) => ({
        name: t.function.name,
        description: t.function.description,
        input_schema: t.function.parameters,
      }));
    }

    const response = await this.fetchWithRetry(url, body);
    return this.parseResponse(response);
  }

  async *stream(
    messages: ProviderMessage[],
    tools: ProviderToolDefinition[],
    model: ModelConfig,
    config?: ProviderConfig
  ): AsyncGenerator<ProviderStreamEvent> {
    const url = this.baseUrl + '/messages';
    const { system, anthropicMessages } = this.toAnthropicMessages(messages);

    const body: Record<string, unknown> = {
      model: model.model,
      messages: anthropicMessages,
      max_tokens: model.maxTokens ?? 4096,
      temperature: model.temperature ?? 0.7,
      top_p: model.topP,
      stream: true,
    };

    if (system) {
      body.system = system;
    }

    if (tools.length > 0) {
      body.tools = tools.map((t) => ({
        name: t.function.name,
        description: t.function.description,
        input_schema: t.function.parameters,
      }));
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': this.apiVersion,
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok || !response.body) {
      const errorText = await response.text();
      const msg = 'Anthropic API error ' + response.status + ': ' + errorText;
      yield { type: 'error', error: msg };
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        const data = trimmed.slice(6);

        try {
          const parsed = JSON.parse(data);
          const events = this.parseStreamEvent(parsed);
          for (const event of events) {
            yield event;
          }
        } catch {
          // Skip malformed JSON
        }
      }
    }
  }

  validateConfig(config: ProviderConfig): boolean {
    return !!config.apiKey && config.name === 'anthropic';
  }

  // ---------- Private Helpers ----------

  private toAnthropicMessages(messages: ProviderMessage[]): {
    system: string | undefined;
    anthropicMessages: Record<string, unknown>[];
  } {
    let system: string | undefined;
    const anthropicMessages: Record<string, unknown>[] = [];

    for (const msg of messages) {
      if (msg.role === 'system') {
        system = msg.content as string;
        continue;
      }

      if (msg.role === 'tool') {
        anthropicMessages.push({
          role: 'user',
          content: [
            {
              type: 'tool_result',
              tool_use_id: msg.tool_call_id,
              content: msg.content,
            },
          ],
        });
        continue;
      }

      if (msg.role === 'assistant' && msg.tool_calls) {
        const content: Record<string, unknown>[] = [];

        if (msg.content) {
          content.push({ type: 'text', text: msg.content as string });
        }

        for (const tc of msg.tool_calls) {
          content.push({
            type: 'tool_use',
            id: tc.id,
            name: tc.function.name,
            input: JSON.parse(tc.function.arguments || '{}'),
          });
        }

        anthropicMessages.push({
          role: 'assistant',
          content,
        });
        continue;
      }

      anthropicMessages.push({
        role: msg.role,
        content: msg.content,
      });
    }

    return { system, anthropicMessages };
  }

  private async fetchWithRetry(url: string, body: unknown): Promise<any> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': this.apiVersion,
            'anthropic-dangerous-direct-browser-access': 'true',
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error('Anthropic API error ' + response.status + ': ' + errorText);
        }

        return await response.json();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < this.maxRetries - 1) {
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }
    }

    throw lastError;
  }

  private parseResponse(data: any): ProviderResponse {
    const content = data.content ?? [];
    let textContent = '';
    const tool_calls: ProviderResponse['message']['tool_calls'] = [];

    for (const block of content) {
      if (block.type === 'text') {
        textContent += block.text;
      } else if (block.type === 'tool_use') {
        tool_calls.push({
          id: block.id,
          type: 'function',
          function: {
            name: block.name,
            arguments: JSON.stringify(block.input ?? {}),
          },
        });
      }
    }

    return {
      message: {
        role: 'assistant',
        content: textContent,
        tool_calls: tool_calls.length > 0 ? tool_calls : undefined,
      },
      usage: data.usage ? this.parseUsage(data.usage) : undefined,
      finishReason: data.stop_reason,
    };
  }

  private parseStreamEvent(data: any): ProviderStreamEvent[] {
    const events: ProviderStreamEvent[] = [];

    switch (data.type) {
      case 'content_block_delta':
        if (data.delta?.type === 'text_delta') {
          events.push({ type: 'content', content: data.delta.text });
        } else if (data.delta?.type === 'input_json_delta') {
          events.push({
            type: 'tool_call',
            toolCall: {
              id: undefined,
              type: 'function',
              function: {
                arguments: data.delta.partial_json,
              },
            },
          });
        }
        break;

      case 'content_block_start':
        if (data.content_block?.type === 'tool_use') {
          events.push({
            type: 'tool_call',
            toolCall: {
              id: data.content_block.id,
              type: 'function',
              function: {
                name: data.content_block.name,
              },
            },
          });
        }
        break;

      case 'message_delta':
        if (data.delta?.stop_reason) {
          events.push({
            type: 'finish',
            finishReason: data.delta.stop_reason,
          });
        }
        break;

      case 'message_stop':
        events.push({ type: 'finish', finishReason: 'end_turn' });
        break;

      case 'usage':
        if (data.usage) {
          events.push({ type: 'usage', usage: this.parseUsage(data.usage) });
        }
        break;
    }

    return events;
  }

  private parseUsage(usage: any): TokenUsage {
    return {
      promptTokens: usage.input_tokens ?? 0,
      completionTokens: usage.output_tokens ?? 0,
      totalTokens: (usage.input_tokens ?? 0) + (usage.output_tokens ?? 0),
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default AnthropicAdapter;