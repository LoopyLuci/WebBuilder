// ============================================================================
// Provider Adapter — Google Gemini API integration
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

export class GoogleAdapter {
  readonly name = 'google' as const;
  readonly supportedModels = [
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-1.0-pro',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-2.5-flash',
    'gemini-2.5-pro',
  ];

  private baseUrl: string;
  private apiKey: string;
  private timeout: number;
  private maxRetries: number;

  constructor(config: ProviderConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl ?? 'https://generativelanguage.googleapis.com/v1beta';
    this.timeout = config.timeout ?? 30000;
    this.maxRetries = config.maxRetries ?? 3;
  }

  async chat(
    messages: ProviderMessage[],
    tools: ProviderToolDefinition[],
    model: ModelConfig,
    config?: ProviderConfig
  ): Promise<ProviderResponse> {
    const url = `${this.baseUrl}/models/${model.model}:generateContent?key=${this.apiKey}`;

    const { systemInstruction, googleMessages } = this.toGoogleMessages(messages);

    const body: Record<string, unknown> = {
      contents: googleMessages,
      generationConfig: {
        temperature: model.temperature ?? 0.7,
        maxOutputTokens: model.maxTokens,
        topP: model.topP,
        stopSequences: model.stopSequences,
      },
    };

    if (systemInstruction) {
      body.systemInstruction = systemInstruction;
    }

    if (tools.length > 0) {
      body.tools = [
        {
          functionDeclarations: tools.map((t) => ({
            name: t.function.name,
            description: t.function.description,
            parameters: t.function.parameters,
          })),
        },
      ];
    }

    const response = await this.fetchWithRetry(url, body);
    return this.parseResponse(response, model.model);
  }

  async *stream(
    messages: ProviderMessage[],
    tools: ProviderToolDefinition[],
    model: ModelConfig,
    config?: ProviderConfig
  ): AsyncGenerator<ProviderStreamEvent> {
    const url = `${this.baseUrl}/models/${model.model}:streamGenerateContent?key=${this.apiKey}&alt=sse`;

    const { systemInstruction, googleMessages } = this.toGoogleMessages(messages);

    const body: Record<string, unknown> = {
      contents: googleMessages,
      generationConfig: {
        temperature: model.temperature ?? 0.7,
        maxOutputTokens: model.maxTokens,
        topP: model.topP,
        stopSequences: model.stopSequences,
      },
    };

    if (systemInstruction) {
      body.systemInstruction = systemInstruction;
    }

    if (tools.length > 0) {
      body.tools = [
        {
          functionDeclarations: tools.map((t) => ({
            name: t.function.name,
            description: t.function.description,
            parameters: t.function.parameters,
          })),
        },
      ];
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok || !response.body) {
      const errorText = await response.text();
      yield { type: 'error', error: `Google API error ${response.status}: ${errorText}` };
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
          const event = this.parseStreamEvent(parsed);
          if (event) yield event;
        } catch {
          // Skip malformed JSON
        }
      }
    }
  }

  validateConfig(config: ProviderConfig): boolean {
    return !!config.apiKey && config.name === 'google';
  }

  // ---------- Private Helpers ----------

  private toGoogleMessages(messages: ProviderMessage[]): {
    systemInstruction: Record<string, unknown> | undefined;
    googleMessages: Record<string, unknown>[];
  } {
    let systemInstruction: Record<string, unknown> | undefined;
    const googleMessages: Record<string, unknown>[] = [];

    for (const msg of messages) {
      if (msg.role === 'system') {
        systemInstruction = { parts: [{ text: msg.content as string }] };
        continue;
      }

      if (msg.role === 'tool') {
        googleMessages.push({
          role: 'user',
          parts: [
            {
              functionResponse: {
                id: msg.tool_call_id,
                name: msg.tool_call_id, // Google uses the function name here
                response: { output: msg.content },
              },
            },
          ],
        });
        continue;
      }

      if (msg.role === 'assistant' && msg.tool_calls) {
        const parts: Record<string, unknown>[] = [];

        if (msg.content) {
          parts.push({ text: msg.content as string });
        }

        for (const tc of msg.tool_calls) {
          parts.push({
            functionCall: {
              id: tc.id,
              name: tc.function.name,
              args: JSON.parse(tc.function.arguments || '{}'),
            },
          });
        }

        googleMessages.push({
          role: 'model',
          parts,
        });
        continue;
      }

      googleMessages.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content as string }],
      });
    }

    return { systemInstruction, googleMessages };
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
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Google API error ${response.status}: ${errorText}`);
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

  private parseResponse(data: any, model: string): ProviderResponse {
    const candidates = data.candidates ?? [];
    if (candidates.length === 0) {
      return {
        message: { role: 'assistant', content: '' },
        finishReason: 'error',
      };
    }

    const candidate = candidates[0];
    const content = candidate.content;
    const parts = content?.parts ?? [];
    let textContent = '';
    const tool_calls: ProviderResponse['message']['tool_calls'] = [];

    for (const part of parts) {
      if (part.text) {
        textContent += part.text;
      } else if (part.functionCall) {
        tool_calls.push({
          id: part.functionCall.id ?? `call_${Date.now()}`,
          type: 'function',
          function: {
            name: part.functionCall.name,
            arguments: JSON.stringify(part.functionCall.args ?? {}),
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
      usage: data.usageMetadata
        ? {
            promptTokens: data.usageMetadata.promptTokenCount ?? 0,
            completionTokens: data.usageMetadata.candidatesTokenCount ?? 0,
            totalTokens: data.usageMetadata.totalTokenCount ?? 0,
          }
        : undefined,
      finishReason: candidate.finishReason?.toLowerCase() ?? 'stop',
    };
  }

  private parseStreamEvent(data: any): ProviderStreamEvent | null {
    const candidates = data.candidates ?? [];
    if (candidates.length === 0) return null;

    const candidate = candidates[0];
    const parts = candidate.content?.parts ?? [];

    for (const part of parts) {
      if (part.text) {
        return { type: 'content', content: part.text };
      }
      if (part.functionCall) {
        return {
          type: 'tool_call',
          toolCall: {
            id: part.functionCall.id,
            type: 'function',
            function: {
              name: part.functionCall.name,
              arguments: JSON.stringify(part.functionCall.args ?? {}),
            },
          },
        };
      }
    }

    if (candidate.finishReason) {
      return { type: 'finish', finishReason: candidate.finishReason.toLowerCase() };
    }

    return null;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default GoogleAdapter;