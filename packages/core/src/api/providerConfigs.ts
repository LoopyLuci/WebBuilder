// Provider Configurations
// Comprehensive configuration for all supported API providers

import { ApiProvider, ProviderConfig } from './types.js';

/**
 * Default provider configurations
 */
export const PROVIDER_CONFIGS: Record<ApiProvider, ProviderConfig> = {
  [ApiProvider.OPENAI]: {
    provider: ApiProvider.OPENAI,
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    validationEndpoint: '/models',
    modelsEndpoint: '/models',
    authHeader: 'Authorization',
    keyPrefix: 'sk-',
    supportedModels: [
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-4-turbo',
      'gpt-4',
      'gpt-3.5-turbo',
      'o1-preview',
      'o1-mini',
    ],
    rateLimitPerMinute: 3500,
    supportsStreaming: true,
    supportsVision: true,
    supportsFunctionCalling: true,
    pricing: {
      inputTokenCost: 0.0000025,
      outputTokenCost: 0.00001,
      unit: 'per_token',
    },
  },
  [ApiProvider.ANTHROPIC]: {
    provider: ApiProvider.ANTHROPIC,
    name: 'Anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    validationEndpoint: '/messages',
    authHeader: 'x-api-key',
    keyPrefix: 'sk-ant-',
    supportedModels: [
      'claude-sonnet-4-20250514',
      'claude-opus-4-20250514',
      'claude-3-5-sonnet-latest',
      'claude-3-5-haiku-latest',
      'claude-3-opus-latest',
    ],
    rateLimitPerMinute: 500,
    supportsStreaming: true,
    supportsVision: true,
    supportsFunctionCalling: true,
    pricing: {
      inputTokenCost: 0.000003,
      outputTokenCost: 0.000015,
      unit: 'per_token',
    },
  },
  [ApiProvider.GOOGLE]: {
    provider: ApiProvider.GOOGLE,
    name: 'Google AI',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    validationEndpoint: '/models',
    modelsEndpoint: '/models',
    authHeader: 'x-goog-api-key',
    supportedModels: [
      'gemini-2.5-flash',
      'gemini-2.5-pro',
      'gemini-2.0-flash',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
    ],
    rateLimitPerMinute: 1500,
    supportsStreaming: true,
    supportsVision: true,
    supportsFunctionCalling: true,
    pricing: {
      inputTokenCost: 0.00000075,
      outputTokenCost: 0.000003,
      unit: 'per_token',
    },
  },
  [ApiProvider.AZURE]: {
    provider: ApiProvider.AZURE,
    name: 'Azure OpenAI',
    baseUrl: '',
    validationEndpoint: '/deployments',
    modelsEndpoint: '/deployments',
    authHeader: 'api-key',
    supportedModels: [
      'gpt-4o',
      'gpt-4-turbo',
      'gpt-4',
      'gpt-35-turbo',
    ],
    rateLimitPerMinute: 2400,
    supportsStreaming: true,
    supportsVision: true,
    supportsFunctionCalling: true,
    pricing: {
      inputTokenCost: 0.0000025,
      outputTokenCost: 0.00001,
      unit: 'per_token',
    },
  },
  [ApiProvider.COHERE]: {
    provider: ApiProvider.COHERE,
    name: 'Cohere',
    baseUrl: 'https://api.cohere.com/v1',
    validationEndpoint: '/models',
    modelsEndpoint: '/models',
    authHeader: 'Authorization',
    supportedModels: [
      'command-r-plus-08-2024',
      'command-r-plus',
      'command-r-08-2024',
      'command-r',
      'command-light',
      'caya-alpha',
    ],
    rateLimitPerMinute: 1000,
    supportsStreaming: true,
    supportsVision: false,
    supportsFunctionCalling: true,
    pricing: {
      inputTokenCost: 0.0000025,
      outputTokenCost: 0.00001,
      unit: 'per_token',
    },
  },
  [ApiProvider.MISTRAL]: {
    provider: ApiProvider.MISTRAL,
    name: 'Mistral AI',
    baseUrl: 'https://api.mistral.ai/v1',
    validationEndpoint: '/models',
    modelsEndpoint: '/models',
    authHeader: 'Authorization',
    keyPrefix: '',
    supportedModels: [
      'mistral-large-latest',
      'mistral-small-latest',
      'pixtral-large-latest',
      'ministral-8b-latest',
      'ministral-3b-latest',
    ],
    rateLimitPerMinute: 500,
    supportsStreaming: true,
    supportsVision: true,
    supportsFunctionCalling: true,
    pricing: {
      inputTokenCost: 0.000002,
      outputTokenCost: 0.000006,
      unit: 'per_token',
    },
  },
  [ApiProvider.TOGETHER]: {
    provider: ApiProvider.TOGETHER,
    name: 'Together AI',
    baseUrl: 'https://api.together.xyz/v1',
    validationEndpoint: '/models',
    modelsEndpoint: '/models',
    authHeader: 'Authorization',
    supportedModels: [
      'meta-llama/Llama-3.3-70B-Instruct-Turbo',
      'meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo',
      'Qwen/Qwen2.5-72B-Instruct-Turbo',
      'deepseek-ai/DeepSeek-V3',
    ],
    rateLimitPerMinute: 600,
    supportsStreaming: true,
    supportsVision: true,
    supportsFunctionCalling: true,
    pricing: {
      inputTokenCost: 0.0000008,
      outputTokenCost: 0.0000008,
      unit: 'per_token',
    },
  },
  [ApiProvider.GROQ]: {
    provider: ApiProvider.GROQ,
    name: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    validationEndpoint: '/models',
    modelsEndpoint: '/models',
    authHeader: 'Authorization',
    supportedModels: [
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
      'mixtral-8x7b-32768',
      'gemma2-9b-it',
    ],
    rateLimitPerMinute: 3000,
    supportsStreaming: true,
    supportsVision: false,
    supportsFunctionCalling: true,
    pricing: {
      inputTokenCost: 0.00000005,
      outputTokenCost: 0.00000008,
      unit: 'per_token',
    },
  },
  [ApiProvider.DEEPSEEK]: {
    provider: ApiProvider.DEEPSEEK,
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    validationEndpoint: '/models',
    modelsEndpoint: '/models',
    authHeader: 'Authorization',
    supportedModels: [
      'deepseek-chat',
      'deepseek-reasoner',
    ],
    rateLimitPerMinute: 600,
    supportsStreaming: true,
    supportsVision: false,
    supportsFunctionCalling: true,
    pricing: {
      inputTokenCost: 0.00000014,
      outputTokenCost: 0.00000028,
      unit: 'per_token',
    },
  },
  [ApiProvider.PERPLEXITY]: {
    provider: ApiProvider.PERPLEXITY,
    name: 'Perplexity AI',
    baseUrl: 'https://api.perplexity.ai',
    validationEndpoint: '/models',
    modelsEndpoint: '/models',
    authHeader: 'Authorization',
    supportedModels: [
      'sonar-pro',
      'sonar',
      'sonar-reasoning-pro',
      'sonar-reasoning',
    ],
    rateLimitPerMinute: 500,
    supportsStreaming: true,
    supportsVision: false,
    supportsFunctionCalling: false,
    pricing: {
      inputTokenCost: 0.000002,
      outputTokenCost: 0.000008,
      unit: 'per_token',
    },
  },
  [ApiProvider.OPENROUTER]: {
    provider: ApiProvider.OPENROUTER,
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    validationEndpoint: '/models',
    modelsEndpoint: '/models',
    authHeader: 'Authorization',
    supportedModels: [
      'auto',
      'openai/gpt-4o-latest',
      'anthropic/claude-3.5-sonnet',
      'google/gemini-2.0-flash-001',
      'meta-llama/llama-3.3-70b-instruct',
    ],
    rateLimitPerMinute: 200,
    supportsStreaming: true,
    supportsVision: true,
    supportsFunctionCalling: true,
    pricing: {
      inputTokenCost: 0.000001,
      outputTokenCost: 0.000003,
      unit: 'per_token',
    },
  },
  [ApiProvider.HUGGINGFACE]: {
    provider: ApiProvider.HUGGINGFACE,
    name: 'HuggingFace',
    baseUrl: 'https://api-inference.huggingface.co/v1',
    validationEndpoint: '/models',
    modelsEndpoint: '/models',
    authHeader: 'Authorization',
    supportedModels: [
      'meta-llama/Llama-3.3-70B-Instruct',
      'Qwen/Qwen2.5-72B-Instruct',
      'microsoft/Phi-3.5-mini-instruct',
      'google/gemma-2-27b-it',
    ],
    rateLimitPerMinute: 300,
    supportsStreaming: true,
    supportsVision: true,
    supportsFunctionCalling: true,
    pricing: {
      inputTokenCost: 0.0000002,
      outputTokenCost: 0.0000004,
      unit: 'per_token',
    },
  },
};

/**
 * Get provider configuration by provider enum
 */
export function getProviderConfig(provider: ApiProvider): ProviderConfig {
  const config = PROVIDER_CONFIGS[provider];
  if (!config) {
    throw new Error(`No configuration found for provider: ${provider}`);
  }
  return config;
}

/**
 * Get all provider configurations
 */
export function getAllProviderConfigs(): ProviderConfig[] {
  return Object.values(PROVIDER_CONFIGS);
}

/**
 * Get provider configuration by name
 */
export function getProviderConfigByName(name: string): ProviderConfig | undefined {
  return Object.values(PROVIDER_CONFIGS).find(
    (config) => config.name.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Check if a provider is supported
 */
export function isProviderSupported(provider: string): provider is ApiProvider {
  return Object.values(ApiProvider).includes(provider as ApiProvider);
}

/**
 * Get provider enum by string name
 */
export function getProviderEnum(name: string): ApiProvider | undefined {
  return Object.values(ApiProvider).find(
    (p) => p.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Get the number of supported providers
 */
export function getProviderCount(): number {
  return Object.values(PROVIDER_CONFIGS).length;
}