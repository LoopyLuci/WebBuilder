// ============================================================================
// Model Registry
// Core registry class that manages model fetching, caching, and selection
// ============================================================================

import {
  ModelInfo,
  ModelProvider,
  ModelCapability,
  PricingTier,
  TaskType,
  ModelCacheEntry,
  ModelSelectionCriteria,
  ModelRecommendation,
  FetchResult,
  RegistryConfig,
} from './types.js';
import { fetchModelsForProvider } from './modelFetchers.js';
import { ApiProvider } from '../api/types.js';
import { getProviderConfig } from '../api/providerConfigs.js';

/**
 * Default registry configuration
 */
const DEFAULT_CONFIG: Required<RegistryConfig> = {
  cacheTtl: 3600000, // 1 hour
  autoFetch: true,
  providers: {},
  requestTimeout: 30000, // 30 seconds
};

/**
 * Main ModelRegistry class
 */
export class ModelRegistry {
  private cache: Map<ModelProvider, ModelCacheEntry> = new Map();
  private allModels: ModelInfo[] = [];
  private config: Required<RegistryConfig>;
  private apiKeys: Map<ApiProvider, string> = new Map();
  private lastFetchTime: number = 0;
  private fetching: boolean = false;

  constructor(config: RegistryConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Set an API key for a provider
   */
  setApiKey(provider: ApiProvider, apiKey: string): void {
    this.apiKeys.set(provider, apiKey);
  }

  /**
   * Remove an API key for a provider
   */
  removeApiKey(provider: ApiProvider): void {
    this.apiKeys.delete(provider);
  }

  /**
   * Get the API key for a provider
   */
  getApiKey(provider: ApiProvider): string | undefined {
    return this.apiKeys.get(provider);
  }

  /**
   * Initialize the registry and optionally auto-fetch models
   */
  async initialize(): Promise<void> {
    if (this.config.autoFetch) {
      await this.fetchAllModels();
    }
  }

  /**
   * Fetch models from all configured providers
   */
  async fetchAllModels(): Promise<FetchResult[]> {
    if (this.fetching) {
      return [];
    }

    this.fetching = true;
    const results: FetchResult[] = [];

    try {
      const providers = Array.from(this.apiKeys.keys());

      for (const provider of providers) {
        const result = await this.fetchModelsForProvider(provider);
        results.push(result);
      }

      // Combine all models
      this.allModels = results.flatMap((r) => r.models);
      this.lastFetchTime = Date.now();

      return results;
    } finally {
      this.fetching = false;
    }
  }

  /**
   * Fetch models from a specific provider
   */
  async fetchModelsForProvider(provider: ApiProvider): Promise<FetchResult> {
    const apiKey = this.apiKeys.get(provider);

    if (!apiKey) {
      // Return cached data if available
      const cached = this.cache.get(PROVIDER_TO_MODEL_PROVIDER[provider]);
      if (cached && !this.isCacheExpired(cached)) {
        return {
          success: true,
          models: cached.models,
          source: 'cache',
        };
      }

      return {
        success: false,
        models: [],
        source: 'fallback',
        error: `No API key configured for provider: ${provider}`,
      };
    }

    // Check cache first
    const modelProvider = PROVIDER_TO_MODEL_PROVIDER[provider];
    const cached = this.cache.get(modelProvider);
    if (cached && !this.isCacheExpired(cached)) {
      return {
        success: true,
        models: cached.models,
        source: 'cache',
      };
    }

    try {
      const result = await fetchModelsForProvider(provider, apiKey);

      if (result.success) {
        // Update cache
        this.cache.set(modelProvider, {
          models: result.models,
          cachedAt: Date.now(),
          ttl: this.config.cacheTtl,
        });
      }

      return result;
    } catch (error) {
      return {
        success: false,
        models: cached?.models || [],
        source: 'cache',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get all available models
   */
  getAllModels(): ModelInfo[] {
    return [...this.allModels];
  }

  /**
   * Get models by provider
   */
  getModelsByProvider(provider: ModelProvider): ModelInfo[] {
    return this.allModels.filter((m) => m.provider === provider);
  }

  /**
   * Get a model by ID
   */
  getModelById(modelId: string): ModelInfo | undefined {
    return this.allModels.find((m) => m.id === modelId);
  }

  /**
   * Search models by name or description
   */
  searchModels(query: string): ModelInfo[] {
    const lowerQuery = query.toLowerCase();
    return this.allModels.filter(
      (m) =>
        m.name.toLowerCase().includes(lowerQuery) ||
        m.description.toLowerCase().includes(lowerQuery) ||
        m.id.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get models that match selection criteria
   */
  getModelsByCriteria(criteria: ModelSelectionCriteria): ModelInfo[] {
    return this.allModels.filter((model) => {
      // Check task type requirements
      if (criteria.taskType) {
        const taskCapabilities = TASK_CAPABILITIES[criteria.taskType];
        if (taskCapabilities && !taskCapabilities.every((c) => model.capabilities.capabilities.includes(c))) {
          return false;
        }
      }

      // Check required capabilities
      if (criteria.requiredCapabilities && criteria.requiredCapabilities.length > 0) {
        if (!criteria.requiredCapabilities.every((c) => model.capabilities.capabilities.includes(c))) {
          return false;
        }
      }

      // Check minimum context length
      if (criteria.minContextLength && model.capabilities.contextLength < criteria.minContextLength) {
        return false;
      }

      // Check maximum costs
      if (criteria.maxInputCost && model.pricing.inputPerMillion > criteria.maxInputCost) {
        return false;
      }
      if (criteria.maxOutputCost && model.pricing.outputPerMillion > criteria.maxOutputCost) {
        return false;
      }

      // Check preferred provider
      if (criteria.preferredProvider && model.provider !== criteria.preferredProvider) {
        return false;
      }

      // Check streaming requirement
      if (criteria.requiresStreaming && !model.capabilities.supportsStreaming) {
        return false;
      }

      // Check multimodal requirement
      if (criteria.requiresMultimodal && !model.capabilities.supportsMultimodal) {
        return false;
      }

      // Check tool use requirement
      if (criteria.requiresToolUse && !model.capabilities.supportsToolUse) {
        return false;
      }

      // Check preferred tier
      if (criteria.preferredTier && model.pricing.tier !== criteria.preferredTier) {
        return false;
      }

      // Exclude deprecated models
      if (model.status === 'deprecated' || model.status === 'retired') {
        return false;
      }

      return true;
    });
  }

  /**
   * Get model recommendations for a task type
   */
  recommendModel(taskType: TaskType, criteria?: Partial<ModelSelectionCriteria>): ModelRecommendation | null {
    const fullCriteria: ModelSelectionCriteria = {
      taskType,
      ...criteria,
    };

    const candidates = this.getModelsByCriteria(fullCriteria);

    if (candidates.length === 0) {
      return null;
    }

    // Score each candidate
    const scored = candidates.map((model) => ({
      model,
      score: this.scoreModel(model, taskType),
    }));

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    const best = scored[0];
    const alternatives = scored.slice(1, 4).map((s) => s.model);

    return {
      model: best.model,
      score: best.score,
      reason: this.generateRecommendationReason(best.model, taskType),
      alternatives,
    };
  }

  /**
   * Get available providers (those with API keys)
   */
  getAvailableProviders(): ApiProvider[] {
    return Array.from(this.apiKeys.keys());
  }

  /**
   * Get registry status information
   */
  getStatus(): {
    totalModels: number;
    providersConfigured: number;
    lastFetchTime: number | null;
    cacheSize: number;
    isFetching: boolean;
  } {
    return {
      totalModels: this.allModels.length,
      providersConfigured: this.apiKeys.size,
      lastFetchTime: this.lastFetchTime || null,
      cacheSize: this.cache.size,
      isFetching: this.fetching,
    };
  }

  /**
   * Invalidate the cache for a specific provider
   */
  invalidateCache(provider?: ModelProvider): void {
    if (provider) {
      this.cache.delete(provider);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get all models grouped by provider
   */
  getModelsGrouped(): Record<string, ModelInfo[]> {
    const grouped: Record<string, ModelInfo[]> = {};
    for (const model of this.allModels) {
      const key = model.provider;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(model);
    }
    return grouped;
  }

  /**
   * Check if cache entry is expired
   */
  private isCacheExpired(entry: ModelCacheEntry): boolean {
    return Date.now() - entry.cachedAt > entry.ttl;
  }

  /**
   * Score a model for a given task type
   */
  private scoreModel(model: ModelInfo, taskType: TaskType): number {
    let score = 0;
    const taskCaps = TASK_CAPABILITIES[taskType] || [];

    // Capability match score (0-0.4)
    const matchedCaps = taskCaps.filter((c) => model.capabilities.capabilities.includes(c)).length;
    score += (matchedCaps / Math.max(taskCaps.length, 1)) * 0.4;

    // Context length score (0-0.2)
    const contextScore = Math.min(model.capabilities.contextLength / 128000, 1) * 0.2;
    score += contextScore;

    // Cost efficiency score (0-0.2)
    const maxCost = 50; // $50 per 1M tokens
    const costScore = Math.max(0, 1 - (model.pricing.inputPerMillion + model.pricing.outputPerMillion) / (2 * maxCost)) * 0.2;
    score += costScore;

    // Feature score (0-0.2)
    let featureScore = 0;
    if (model.capabilities.supportsStreaming) featureScore += 0.05;
    if (model.capabilities.supportsJsonOutput) featureScore += 0.05;
    if (model.capabilities.supportsToolUse) featureScore += 0.05;
    if (model.capabilities.supportsMultimodal) featureScore += 0.05;
    score += featureScore;

    return Math.min(score, 1);
  }

  /**
   * Generate a human-readable recommendation reason
   */
  private generateRecommendationReason(model: ModelInfo, taskType: TaskType): string {
    const reasons: string[] = [];
    const taskCaps = TASK_CAPABILITIES[taskType] || [];

    const matchedCaps = taskCaps.filter((c) => model.capabilities.capabilities.includes(c));
    if (matchedCaps.length > 0) {
      reasons.push(`supports ${matchedCaps.length} required capabilities`);
    }

    if (model.capabilities.contextLength >= 100000) {
      reasons.push('large context window');
    }

    if (model.pricing.inputPerMillion < 5) {
      reasons.push('cost-effective');
    }

    if (model.pricing.tier === PricingTier.FLAGSHIP) {
      reasons.push('top-tier performance');
    }

    if (reasons.length === 0) {
      return `Best match for ${taskType}`;
    }

    return `Recommended: ${reasons.join(', ')}`;
  }
}

/**
 * Mapping from API provider to ModelProvider
 */
const PROVIDER_TO_MODEL_PROVIDER: Record<ApiProvider, ModelProvider> = {
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
 * Task type to required capabilities mapping
 */
const TASK_CAPABILITIES: Record<TaskType, ModelCapability[]> = {
  [TaskType.GENERAL_CHAT]: [ModelCapability.TEXT_GENERATION, ModelCapability.CHAT],
  [TaskType.CODE_GENERATION]: [ModelCapability.TEXT_GENERATION, ModelCapability.CODE_GENERATION],
  [TaskType.CODE_REVIEW]: [ModelCapability.TEXT_GENERATION, ModelCapability.CODE_GENERATION, ModelCapability.VISION],
  [TaskType.CREATIVE_WRITING]: [ModelCapability.TEXT_GENERATION, ModelCapability.CHAT],
  [TaskType.ANALYSIS]: [ModelCapability.TEXT_GENERATION, ModelCapability.REASONING],
  [TaskType.SUMMARIZATION]: [ModelCapability.TEXT_GENERATION, ModelCapability.CHAT],
  [TaskType.TRANSLATION]: [ModelCapability.TEXT_GENERATION, ModelCapability.CHAT],
  [TaskType.EXTRACTION]: [ModelCapability.TEXT_GENERATION, ModelCapability.JSON_MODE],
  [TaskType.CLASSIFICATION]: [ModelCapability.TEXT_GENERATION, ModelCapability.JSON_MODE],
  [TaskType.EMBEDDING]: [ModelCapability.EMBEDDINGS],
  [TaskType.IMAGE_UNDERSTANDING]: [ModelCapability.TEXT_GENERATION, ModelCapability.VISION],
  [TaskType.AGENT_WORKFLOW]: [ModelCapability.TEXT_GENERATION, ModelCapability.FUNCTION_CALLING, ModelCapability.AGENT],
  [TaskType.REASONING]: [ModelCapability.TEXT_GENERATION, ModelCapability.REASONING],
  [TaskType.HTML_GENERATION]: [ModelCapability.TEXT_GENERATION, ModelCapability.CODE_GENERATION],
  [TaskType.CSS_GENERATION]: [ModelCapability.TEXT_GENERATION, ModelCapability.CODE_GENERATION],
  [TaskType.COMPONENT_GENERATION]: [ModelCapability.TEXT_GENERATION, ModelCapability.CODE_GENERATION],
  [TaskType.CONTENT_GENERATION]: [ModelCapability.TEXT_GENERATION, ModelCapability.CREATIVE_WRITING],
  [TaskType.DESIGN_ANALYSIS]: [ModelCapability.TEXT_GENERATION, ModelCapability.VISION],
};

/**
 * Create a new ModelRegistry instance
 */
export function createModelRegistry(config?: RegistryConfig): ModelRegistry {
  return new ModelRegistry(config);
}