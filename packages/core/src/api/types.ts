// API Key Management Types
// Comprehensive type definitions for the API key management system

/**
 * Supported API providers
 */
export enum ApiProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google',
  AZURE = 'azure',
  COHERE = 'cohere',
  MISTRAL = 'mistral',
  TOGETHER = 'together',
  GROQ = 'groq',
  DEEPSEEK = 'deepseek',
  PERPLEXITY = 'perplexity',
  OPENROUTER = 'openrouter',
  HUGGINGFACE = 'huggingface',
}

/**
 * Status of an API key
 */
export enum ApiKeyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  VALIDATING = 'validating',
  INVALID = 'invalid',
}

/**
 * Validation result for an API key
 */
export interface ValidationResult {
  valid: boolean;
  provider: ApiProvider;
  message?: string;
  details?: Record<string, unknown>;
  validatedAt: Date;
}

/**
 * Usage metrics for an API key
 */
export interface UsageMetrics {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  lastUsed?: Date;
  firstUsed?: Date;
  dailyRequests: number;
  monthlyRequests: number;
  averageResponseTime: number;
  errorRate: number;
  lastError?: string;
}

/**
 * API key metadata
 */
export interface ApiKeyMetadata {
  id: string;
  provider: ApiProvider;
  name: string;
  description?: string;
  status: ApiKeyStatus;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  lastValidatedAt?: Date;
  lastUsedAt?: Date;
  usage: UsageMetrics;
  tags: string[];
  isDefault: boolean;
}

/**
 * Stored API key with encrypted value
 */
export interface StoredApiKey {
  metadata: ApiKeyMetadata;
  encryptedKey: string;
  iv: string;
  authTag: string;
}

/**
 * Provider configuration
 */
export interface ProviderConfig {
  provider: ApiProvider;
  name: string;
  baseUrl: string;
  validationEndpoint: string;
  modelsEndpoint?: string;
  authHeader: string;
  keyPrefix?: string;
  supportedModels: string[];
  rateLimitPerMinute: number;
  supportsStreaming: boolean;
  supportsVision: boolean;
  supportsFunctionCalling: boolean;
  pricing: {
    inputTokenCost: number;
    outputTokenCost: number;
    unit: string;
  };
}

/**
 * Secure storage configuration
 */
export interface SecureStorageConfig {
  encryptionKey?: string;
  keyringEnabled: boolean;
  keyringService: string;
  storagePath: string;
  autoRotateDays?: number;
}

/**
 * API key rotation config
 */
export interface KeyRotationConfig {
  enabled: boolean;
  rotateAfterDays: number;
  expiryWarningDays: number;
  autoRevokeOnExpiry: boolean;
}

/**
 * Options for creating a new API key
 */
export interface CreateApiKeyOptions {
  provider: ApiProvider;
  name: string;
  key: string;
  description?: string;
  expiresAt?: Date;
  tags?: string[];
  isDefault?: boolean;
}

/**
 * Options for updating an existing API key
 */
export interface UpdateApiKeyOptions {
  name?: string;
  description?: string;
  status?: ApiKeyStatus;
  expiresAt?: Date;
  tags?: string[];
  isDefault?: boolean;
}

/**
 * Key filter options for querying keys
 */
export interface ApiKeyFilter {
  provider?: ApiProvider;
  status?: ApiKeyStatus;
  tags?: string[];
  search?: string;
  isDefault?: boolean;
}

/**
 * Export format for backup/restore
 */
export interface ApiKeyExport {
  version: string;
  exportedAt: Date;
  keys: StoredApiKey[];
}

/**
 * Aggregated usage report
 */
export interface UsageReport {
  totalKeys: number;
  activeKeys: number;
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  byProvider: Record<ApiProvider, {
    keyCount: number;
    requests: number;
    tokens: number;
    cost: number;
  }>;
  period: {
    start: Date;
    end: Date;
  };
}