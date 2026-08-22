// ============================================================================
// Provider Adapter — OpenAI API integration
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

export class OpenAIAdapter {
  readonly name = 'openai' as const;
  readonly supportedModels = [
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
    'gpt-4',
    'gpt-3.5-turbo',
    'o1-preview',
    'o1-mini',
  ];

  private baseUrl: string;
  private apiKey: string;
  private timeout: number;
  private maxRetries: number;

  constructor(config: ProviderConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl ?? 'https://api.openai.com/v1';
    this.timeout = config.timeout ?? 30000;
    this.maxRetries = config.maxRetries ?? 3;
  }

  async chat(
    messages: ProviderMessage[],
    tools: ProviderToolDefinition[],
    model: ModelConfig,
    config?: ProviderConfig
  ): Promise<ProviderResponse> {
    const url = `${this.baseUrl}/chat/completions`;

    const body: Record<string, unknown> = {
      model: model.model,
      messages: messages.map((m) => this.toOpenAIMessage(m)),
      temperature: model.temperature ?? 0.7,
      max_tokens: model.maxTokens,
      top_p: model.topP,
      frequency_penalty: model.frequencyPenalty,
      presence_penalty: model.presencePenalty,
      stop: model.stopSequences,
    };

    if (tools.length > 0) {
      body.tools = tools;
      body.tool_choice = 'auto';
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
    const url = `${this.baseUrl}/chat/completions`;

    const body: Record<string, unknown> = {
      model: model.model,
      messages: messages.map((m) => this.toOpenAIMessage(m)),
      temperature: model.temperature ?? 0.7,
      max_tokens: model.maxTokens,
      top_p: model.topP,
      frequency_penalty: model.frequencyPenalty,
      presence_penalty: model.presencePenalty,
      stop: model.stopSequences,
      stream: true,
    };

    if (tools.length > 0) {
      body.tools = tools;
      body.tool_choice = 'auto';
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok || !response.body) {
      const errorText = await response.text();
      yield { type: 'error', error: `OpenAI API error ${response.status}: ${errorText}` };
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
        if (data === '[DONE]') return;

        try {
          const parsed = JSON.parse(data);
          const event = this.parseStreamEvent(parsed);
          if (event) yield event;
        } catch {
          // Skip malformed JSON
        }
      }
    }
  }

  validateConfig(config: ProviderConfig): boolean {
    return !!config.apiKey && (config.name === 'openai' || config.name === 'custom');
  }

  // ---------- Private Helpers ----------

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
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`OpenAI API error ${response.status}: ${errorText}`);
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

  private toOpenAIMessage(message: ProviderMessage): Record<string, unknown> {
    const result: Record<string, unknown> = {
      role: message.role === 'tool' ? 'tool' : message.role,
      content: message.content,
    };

    if (message.tool_calls) {
      result.tool_calls = message.tool_calls.map((tc) => ({
        id: tc.id,
        type: 'function',
        function: {
          name: tc.function.name,
          arguments: tc.function.arguments,
        },
      }));
    }

    if (message.tool_call_id) {
      result.tool_call_id = message.tool_call_id;
    }

    return result;
  }

  private parseResponse(data: any): ProviderResponse {
    const choice = data.choices?.[0];
    const message = choice?.message;

    return {
      message: {
        role: 'assistant',
        content: message?.content ?? '',
        tool_calls: message?.tool_calls?.map((tc: any) => ({
          id: tc.id,
          type: 'function' as const,
          function: {
            name: tc.function.name,
            arguments: tc.function.arguments,
          },
        })),
      },
      usage: data.usage ? this.parseUsage(data.usage) : undefined,
      finishReason: choice?.finish_reason,
    };
  }

  private parseStreamEvent(data: any): ProviderStreamEvent | null {
    const choice = data.choices?.[0];
    if (!choice) return null;

    const delta = choice.delta;

    // Handle content delta
    if (delta?.content) {
      return { type: 'content', content: delta.content };
    }

    // Handle tool call deltas
    if (delta?.tool_calls?.[0]) {
      const tc = delta.tool_calls[0];
      return {
        type: 'tool_call',
        toolCall: {
          id: tc.id,
          type: 'function' as const,
          function: {
            name: tc.function?.name,
            arguments: tc.function?.arguments,
          },
        },
      };
    }

    // Handle finish
    if (choice.finish_reason) {
      return {
        type: 'finish',
        finishReason: choice.finish_reason,
      };
    }

    // Handle usage
    if (data.usage) {
      return { type: 'usage', usage: this.parseUsage(data.usage) };
    }

    return null;
  }

  private parseUsage(usage: any): TokenUsage {
    return {
      promptTokens: usage.prompt_tokens ?? 0,
      completionTokens: usage.completion_tokens ?? 0,
      totalTokens: usage.total_tokens ?? 0,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default OpenAIAdapter;