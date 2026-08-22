// ============================================================================
// Provider Model Fetchers
// Fetches available models from each provider's API
// ============================================================================

import { ApiProvider } from '../api/types.js';
import { getProviderConfig } from '../api/providerConfigs.js';
import {
  ModelInfo,
  ModelProvider,
  ModelCapability,
  ModelPricing,
  PricingTier,
  FetchResult,
} from './types.js';

/**
 * Map from API provider to ModelProvider
 */
const PROVIDER_MAP: Record<ApiProvider, ModelProvider> = {
  [ApiProvider.OPENAI]: ModelProvider.OPENAI,
  [ApiProvider.ANTHROPIC]: ModelProvider.ANTHROPIC,
  [ApiProvider.GOOGLE]: ModelProvider.GOOGLE,
  [ApiProvider.AZURE]: ModelProvider.OPENAI,
  [ApiProvider.COHERE]: ModelProvider.COHERE,
  [ApiProvider.MISTRAL]: ModelProvider.MISTRAL,
  [ApiProvider.TOGETHER]: ModelProvider.TOGETHER,
  [ApiProvider.GROQ]: ModelProvider.GROQ,
  [ApiProvider.DEEPSEEK]: ModelProvider.OPENROUTER,
  [ApiProvider.PERPLEXITY]: ModelProvider.OPENROUTER,
  [ApiProvider.OPENROUTER]: ModelProvider.OPENROUTER,
  [ApiProvider.HUGGINGFACE]: ModelProvider.OPENROUTER,
};

/**
 * Fetch models from OpenAI API
 */
async function fetchOpenAIModels(apiKey: string, baseUrl: string): Promise<ModelInfo[]> {
  const response = await fetch(`${baseUrl}/models`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as { data: Array<{ id: string; created?: number; owned_by?: string }> };

  const models: ModelInfo[] = data.data.map((m) => {
    const modelId = m.id;
    const isVision = modelId.includes('vision') || modelId.startsWith('gpt-4o') || modelId.startsWith('gpt-4-turbo');
    const isGpt4 = modelId.startsWith('gpt-4');
    const isGpt35 = modelId.startsWith('gpt-3.5');
    const isO1 = modelId.startsWith('o1');
    const contextLength = isO1 ? 128000 : isGpt4 ? 128000 : 16385;
    const maxOutput = isO1 ? 100000 : isGpt4 ? 4096 : 4096;

    const capabilities: ModelCapability[] = [
      ModelCapability.TEXT_GENERATION,
      ModelCapability.CHAT,
      ModelCapability.CODE_GENERATION,
      ModelCapability.FUNCTION_CALLING,
      ModelCapability.JSON_MODE,
    ];

    if (isVision) capabilities.push(ModelCapability.VISION);
    if (isO1) capabilities.push(ModelCapability.REASONING);

    const inputCost = isGpt35 ? 0.5 : isO1 ? 15 : isGpt4 ? 30 : 10;
    const outputCost = isGpt35 ? 1.5 : isO1 ? 60 : isGpt4 ? 60 : 30;

    return {
      id: modelId,
      name: modelId,
      provider: ModelProvider.OPENAI,
      description: `${m.owned_by || 'OpenAI'} model`,
      capabilities: {
        contextLength,
        maxOutputTokens: maxOutput,
        capabilities,
        supportsStreaming: true,
        supportsSystemPrompt: true,
        supportsMultimodal: isVision,
        supportsToolUse: !isGpt35 || modelId.includes('0613'),
        supportsJsonOutput: isGpt4 || modelId.includes('0125'),
        supportsParallelToolCalls: true,
        knowledgeCutoff: '2024-04',
        releaseDate: m.created ? new Date(m.created * 1000).toISOString().split('T')[0] : undefined,
      },
      pricing: {
        inputPerMillion: inputCost,
        outputPerMillion: outputCost,
        tier: isO1 ? PricingTier.FLAGSHIP : isGpt4 ? PricingTier.PREMIUM : PricingTier.STANDARD,
      },
      status: 'available',
      lastUpdated: new Date().toISOString(),
    };
  });

  return models;
}

/**
 * Fetch models from Anthropic API
 */
async function fetchAnthropicModels(apiKey: string, baseUrl: string): Promise<ModelInfo[]> {
  const response = await fetch(`${baseUrl}/models`, {
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as { data: Array<{ id: string; display_name?: string; type: string }> };

  const models: ModelInfo[] = data.data.map((m) => {
    const modelId = m.id;
    const isSonnet = modelId.includes('sonnet');
    const isHaiku = modelId.includes('haiku');
    const isOpus = modelId.includes('opus');

    const capabilities: ModelCapability[] = [
      ModelCapability.TEXT_GENERATION,
      ModelCapability.CHAT,
      ModelCapability.VISION,
      ModelCapability.CODE_GENERATION,
      ModelCapability.FUNCTION_CALLING,
      ModelCapability.JSON_MODE,
      ModelCapability.REASONING,
      ModelCapability.AGENT,
    ];

    const inputCost = isHaiku ? 0.25 : isSonnet ? 3 : 15;
    const outputCost = isHaiku ? 1.25 : isSonnet ? 15 : 75;

    return {
      id: modelId,
      name: m.display_name || modelId,
      provider: ModelProvider.ANTHROPIC,
      description: `Anthropic ${isOpus ? 'Opus' : isSonnet ? 'Sonnet' : 'Haiku'} model`,
      capabilities: {
        contextLength: 200000,
        maxOutputTokens: 4096,
        capabilities,
        supportsStreaming: true,
        supportsSystemPrompt: true,
        supportsMultimodal: true,
        supportsToolUse: true,
        supportsJsonOutput: true,
        supportsParallelToolCalls: true,
        knowledgeCutoff: '2024-04',
      },
      pricing: {
        inputPerMillion: inputCost,
        outputPerMillion: outputCost,
        cachedInputPerMillion: inputCost * 0.1,
        tier: isOpus ? PricingTier.FLAGSHIP : isSonnet ? PricingTier.PREMIUM : PricingTier.STANDARD,
      },
      status: 'available',
      lastUpdated: new Date().toISOString(),
    };
  });

  return models;
}

/**
 * Fetch models from Google AI API
 */
async function fetchGoogleModels(apiKey: string, baseUrl: string): Promise<ModelInfo[]> {
  const response = await fetch(`${baseUrl}/models?key=${apiKey}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Google AI API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as { models: Array<{ name: string; displayName?: string; description?: string }> };

  const models: ModelInfo[] = data.models.map((m) => {
    const modelId = m.name.replace('models/', '');
    const isFlash = modelId.includes('flash');
    const isPro = modelId.includes('pro');

    const capabilities: ModelCapability[] = [
      ModelCapability.TEXT_GENERATION,
      ModelCapability.CHAT,
      ModelCapability.VISION,
      ModelCapability.CODE_GENERATION,
      ModelCapability.FUNCTION_CALLING,
      ModelCapability.JSON_MODE,
    ];

    return {
      id: modelId,
      name: m.displayName || modelId,
      provider: ModelProvider.GOOGLE,
      description: m.description || `Google ${isFlash ? 'Flash' : isPro ? 'Pro' : 'Gemini'} model`,
      capabilities: {
        contextLength: 1048576,
        maxOutputTokens: 8192,
        capabilities,
        supportsStreaming: true,
        supportsSystemPrompt: true,
        supportsMultimodal: true,
        supportsToolUse: true,
        supportsJsonOutput: true,
        supportsParallelToolCalls: true,
        knowledgeCutoff: '2024-04',
      },
      pricing: {
        inputPerMillion: isFlash ? 0.35 : 2.5,
        outputPerMillion: isFlash ? 0.53 : 10,
        tier: isFlash ? PricingTier.BUDGET : PricingTier.STANDARD,
        hasFreeTier: true,
      },
      status: 'available',
      lastUpdated: new Date().toISOString(),
    };
  });

  return models;
}

/**
 * Fetch models from OpenRouter API
 */
async function fetchOpenRouterModels(apiKey?: string): Promise<ModelInfo[]> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const response = await fetch('https://openrouter.ai/api/v1/models', { headers });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as {
    data: Array<{
      id: string;
      name: string;
      description?: string;
      context_length: number;
      pricing: { prompt: string; completion: string };
      architecture: { modality: string };
    }>;
  };

  const models: ModelInfo[] = data.data.map((m) => {
    const capabilities: ModelCapability[] = [
      ModelCapability.TEXT_GENERATION,
      ModelCapability.CHAT,
    ];

    const isMultimodal = m.architecture?.modality === 'multimodal';
    if (isMultimodal) capabilities.push(ModelCapability.VISION);

    const inputCost = parseFloat(m.pricing?.prompt || '0') * 1000000 || 1;
    const outputCost = parseFloat(m.pricing?.completion || '0') * 1000000 || 3;

    return {
      id: m.id,
      name: m.name,
      provider: ModelProvider.OPENROUTER,
      description: m.description || `OpenRouter model: ${m.id}`,
      capabilities: {
        contextLength: m.context_length || 8192,
        maxOutputTokens: Math.floor((m.context_length || 8192) / 2),
        capabilities,
        supportsStreaming: true,
        supportsSystemPrompt: true,
        supportsMultimodal: isMultimodal,
        supportsToolUse: false,
        supportsJsonOutput: false,
        supportsParallelToolCalls: false,
      },
      pricing: {
        inputPerMillion: inputCost,
        outputPerMillion: outputCost,
        tier: inputCost < 1 ? PricingTier.BUDGET : inputCost < 5 ? PricingTier.STANDARD : PricingTier.PREMIUM,
      },
      status: 'available',
      lastUpdated: new Date().toISOString(),
    };
  });

  return models;
}

/**
 * Generic fetcher function for any provider
 */
export async function fetchModelsForProvider(
  provider: ApiProvider,
  apiKey: string,
  baseUrl?: string
): Promise<FetchResult> {
  try {
    const config = getProviderConfig(provider);
    const fetchBaseUrl = baseUrl || config.baseUrl;

    let models: ModelInfo[];

    switch (provider) {
      case ApiProvider.OPENAI:
      case ApiProvider.AZURE:
        models = await fetchOpenAIModels(apiKey, fetchBaseUrl);
        break;
      case ApiProvider.ANTHROPIC:
        models = await fetchAnthropicModels(apiKey, fetchBaseUrl);
        break;
      case ApiProvider.GOOGLE:
        models = await fetchGoogleModels(apiKey, fetchBaseUrl);
        break;
      case ApiProvider.OPENROUTER:
        models = await fetchOpenRouterModels(apiKey || undefined);
        break;
      default:
        // For other providers, use static model lists from providerConfigs
        models = getStaticModelsForProvider(provider);
    }

    return {
      success: true,
      models,
      source: 'api',
    };
  } catch (error) {
    // Fallback to static models on API failure
    const models = getStaticModelsForProvider(provider);
    return {
      success: models.length > 0,
      models,
      source: 'fallback',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get static models for providers without API fetching
 */
function getStaticModelsForProvider(provider: ApiProvider): ModelInfo[] {
  const config = getProviderConfig(provider);
  const modelProvider = PROVIDER_MAP[provider] || ModelProvider.OPENROUTER;

  return config.supportedModels.map((modelId) => {
    const isVision = modelId.includes('vision') || modelId.includes('pixtral') || modelId.includes('tral');
    const capabilities: ModelCapability[] = [
      ModelCapability.TEXT_GENERATION,
      ModelCapability.CHAT,
      ModelCapability.CODE_GENERATION,
    ];

    if (config.supportsVision || isVision) capabilities.push(ModelCapability.VISION);
    if (config.supportsFunctionCalling) capabilities.push(ModelCapability.FUNCTION_CALLING);

    return {
      id: modelId,
      name: modelId,
      provider: modelProvider,
      description: `${config.name} model`,
      capabilities: {
        contextLength: 32768,
        maxOutputTokens: 4096,
        capabilities,
        supportsStreaming: config.supportsStreaming,
        supportsSystemPrompt: true,
        supportsMultimodal: config.supportsVision || isVision,
        supportsToolUse: config.supportsFunctionCalling,
        supportsJsonOutput: true,
        supportsParallelToolCalls: true,
      },
      pricing: {
        inputPerMillion: config.pricing.inputTokenCost * 1000000,
        outputPerMillion: config.pricing.outputTokenCost * 1000000,
        tier: PricingTier.STANDARD,
      },
      status: 'available',
      lastUpdated: new Date().toISOString(),
    };
  });
}