// ============================================================================
// Model Registry Types
// Core type definitions for the model registry system
// ============================================================================

/**
 * Supported AI providers
 */
export enum ModelProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google',
  COHERE = 'cohere',
  MISTRAL = 'mistral',
  OPENROUTER = 'openrouter',
  GROQ = 'groq',
  TOGETHER = 'together',
}

/**
 * Model capability flags
 */
export enum ModelCapability {
  TEXT_GENERATION = 'text_generation',
  CHAT = 'chat',
  VISION = 'vision',
  CODE_GENERATION = 'code_generation',
  FUNCTION_CALLING = 'functionCalling',
  JSON_MODE = 'json_mode',
  EMBEDDINGS = 'embeddings',
  IMAGE_GENERATION = 'image_generation',
  AUDIO_TRANSCRIPTION = 'audio_transcription',
  AUDIO_GENERATION = 'audio_generation',
  REASONING = 'reasoning',
  AGENT = 'agent',
}

/**
 * Pricing tier classification
 */
export enum PricingTier {
  FREE = 'free',
  BUDGET = 'budget',
  STANDARD = 'standard',
  PREMIUM = 'premium',
  FLAGSHIP = 'flagship',
}

/**
 * Task types for model recommendation
 */
export enum TaskType {
  GENERAL_CHAT = 'general_chat',
  CODE_GENERATION = 'code_generation',
  CODE_REVIEW = 'code_review',
  CREATIVE_WRITING = 'creative_writing',
  ANALYSIS = 'analysis',
  SUMMARIZATION = 'summarization',
  TRANSLATION = 'translation',
  EXTRACTION = 'extraction',
  CLASSIFICATION = 'classification',
  EMBEDDING = 'embedding',
  IMAGE_UNDERSTANDING = 'image_understanding',
  AGENT_WORKFLOW = 'agent_workflow',
  REASONING = 'reasoning',
  HTML_GENERATION = 'html_generation',
  CSS_GENERATION = 'css_generation',
  COMPONENT_GENERATION = 'component_generation',
  CONTENT_GENERATION = 'content_generation',
  DESIGN_ANALYSIS = 'design_analysis',
}

/**
 * Pricing information for a model
 */
export interface ModelPricing {
  /** Cost per 1M input tokens (USD) */
  inputPerMillion: number;
  /** Cost per 1M output tokens (USD) */
  outputPerMillion: number;
  /** Cost per 1M cached input tokens (USD), if supported */
  cachedInputPerMillion?: number;
  /** Pricing tier */
  tier: PricingTier;
  /** Whether the model has a free tier */
  hasFreeTier?: boolean;
  /** Cost per 1K images (for image generation models) */
  perImage?: number;
  /** Cost per 1K queries (for embedding models) */
  perThousandQueries?: number;
}

/**
 * Model capabilities and constraints
 */
export interface ModelCapabilities {
  /** Maximum context length in tokens */
  contextLength: number;
  /** Maximum output tokens */
  maxOutputTokens: number;
  /** Supported capabilities */
  capabilities: ModelCapability[];
  /** Whether the model supports streaming */
  supportsStreaming: boolean;
  /** Whether the model supports system prompts */
  supportsSystemPrompt: boolean;
  /** Whether the model supports multimodal (image) input */
  supportsMultimodal: boolean;
  /** Whether the model supports tool/function calling */
  supportsToolUse: boolean;
  /** Whether the model supports JSON structured output */
  supportsJsonOutput: boolean;
  /** Whether the model supports parallel tool calls */
  supportsParallelToolCalls: boolean;
  /** Knowledge cutoff date */
  knowledgeCutoff?: string;
  /** Model release date */
  releaseDate?: string;
}

/**
 * Complete model information
 */
export interface ModelInfo {
  /** Unique model identifier (used in API calls) */
  id: string;
  /** Human-readable model name */
  name: string;
  /** Provider that offers this model */
  provider: ModelProvider;
  /** Model description */
  description: string;
  /** Detailed capabilities */
  capabilities: ModelCapabilities;
  /** Pricing information */
  pricing: ModelPricing;
  /** Model version/family */
  family?: string;
  /** Whether this is a deprecated model */
  deprecated?: boolean;
  /** Replacement model if deprecated */
  replacedBy?: string;
  /** Model status (available, beta, etc.) */
  status: 'available' | 'beta' | 'deprecated' | 'retired';
  /** Last updated timestamp */
  lastUpdated: string;
}

/**
 * Provider configuration
 */
export interface ProviderConfig {
  /** Provider identifier */
  provider: ModelProvider;
  /** Provider display name */
  displayName: string;
  /** Base API URL */
  baseUrl: string;
  /** API key (if configured) */
  apiKey?: string;
  /** Whether the provider is enabled */
  enabled: boolean;
  /** Default models for this provider */
  defaultModels: string[];
  /** Provider icon/emoji */
  icon: string;
}

/**
 * Cache entry for model data
 */
export interface ModelCacheEntry {
  /** Cached model data */
  models: ModelInfo[];
  /** Cache timestamp */
  cachedAt: number;
  /** Cache TTL in milliseconds */
  ttl: number;
}

/**
 * Model selection criteria
 */
export interface ModelSelectionCriteria {
  /** Preferred task type */
  taskType?: TaskType;
  /** Required capabilities */
  requiredCapabilities?: ModelCapability[];
  /** Minimum context length required */
  minContextLength?: number;
  /** Maximum cost per 1M input tokens */
  maxInputCost?: number;
  /** Maximum cost per 1M output tokens */
  maxOutputCost?: number;
  /** Preferred provider */
  preferredProvider?: ModelProvider;
  /** Whether streaming is required */
  requiresStreaming?: boolean;
  /** Whether multimodal input is required */
  requiresMultimodal?: boolean;
  /** Whether tool use is required */
  requiresToolUse?: boolean;
  /** Preferred pricing tier */
  preferredTier?: PricingTier;
}

/**
 * Model recommendation result
 */
export interface ModelRecommendation {
  /** Recommended model */
  model: ModelInfo;
  /** Relevance score (0-1) */
  score: number;
  /** Reasoning for recommendation */
  reason: string;
  /** Alternative models */
  alternatives: ModelInfo[];
}

/**
 * Provider fetch result
 */
export interface FetchResult {
  /** Whether fetch was successful */
  success: boolean;
  /** Fetched models */
  models: ModelInfo[];
  /** Error message if failed */
  error?: string;
  /** Source of the data */
  source: 'api' | 'cache' | 'fallback';
}

/**
 * Registry configuration
 */
export interface RegistryConfig {
  /** Cache TTL in milliseconds (default: 1 hour) */
  cacheTtl?: number;
  /** Whether to auto-fetch on startup */
  autoFetch?: boolean;
  /** Provider configurations */
  providers?: Partial<Record<ModelProvider, Partial<ProviderConfig>>>;
  /** Timeout for API requests in ms */
  requestTimeout?: number;
}