// API Key Manager — Core module for managing API keys with secure storage,
// provider support, validation, rotation, and usage tracking.

import { randomUUID } from 'crypto';
import {
  ApiKeyFilter,
  ApiKeyMetadata,
  ApiKeyStatus,
  ApiProvider,
  CreateApiKeyOptions,
  StoredApiKey,
  UpdateApiKeyOptions,
  ValidationResult,
} from './types.js';
import { getProviderConfig } from './providerConfigs.js';
import { EncryptedFileStorage, ISecureStorage, createSecureStorage, generateKeyId } from './secureStorage.js';
import { validateApiKey, validateKeyFormat } from './keyValidation.js';
import { checkKeyExpiration, KeyRotationConfig, DEFAULT_ROTATION_CONFIG } from './keyRotation.js';
import { UsageMetricsTracker, UsageEvent, createMetricsTracker } from './usageMetrics.js';

/**
 * Configuration options for ApiKeyManager
 */
export interface ApiKeyManagerConfig {
  storage?: ISecureStorage;
  storagePath?: string;
  encryptionKey?: string;
  rotationConfig?: KeyRotationConfig;
  autoValidate?: boolean;
}

/**
 * Main API Key Manager class
 */
export class ApiKeyManager {
  private storage: ISecureStorage;
  private metadata: Map<string, ApiKeyMetadata> = new Map();
  private metricsTracker: UsageMetricsTracker;
  private rotationConfig: KeyRotationConfig;
  private autoValidate: boolean;
  private initialized: boolean = false;

  constructor(config: ApiKeyManagerConfig = {}) {
    this.storage = config.storage || createSecureStorage({
      storagePath: config.storagePath,
      encryptionKey: config.encryptionKey,
    });
    this.rotationConfig = config.rotationConfig || DEFAULT_ROTATION_CONFIG;
    this.autoValidate = config.autoValidate ?? true;
    this.metricsTracker = createMetricsTracker();
  }

  /**
   * Initialize the manager by loading stored keys
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    const keys = await this.storage.list();
    for (const keyId of keys) {
      const data = await this.storage.retrieve(keyId);
      if (data) {
        try {
          const stored: StoredApiKey = JSON.parse(data);
          this.metadata.set(keyId, stored.metadata);
        } catch {
          // Skip corrupted entries
        }
      }
    }

    // Check expiration on init
    await this.checkAllKeyExpirations();
    this.initialized = true;
  }

  /**
   * Create and store a new API key
   */
  async createKey(options: CreateApiKeyOptions): Promise<ApiKeyMetadata> {
    // Validate key format
    const formatCheck = validateKeyFormat(options.provider, options.key);
    if (!formatCheck.valid) {
      throw new Error(`Invalid key format: ${formatCheck.message}`);
    }

    const id = generateKeyId();
    const now = new Date();

    const metadata: ApiKeyMetadata = {
      id,
      provider: options.provider,
      name: options.name,
      description: options.description,
      status: ApiKeyStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
      expiresAt: options.expiresAt,
      usage: {
        totalRequests: 0,
        totalTokens: 0,
        totalCost: 0,
        dailyRequests: 0,
        monthlyRequests: 0,
        averageResponseTime: 0,
        errorRate: 0,
      },
      tags: options.tags || [],
      isDefault: options.isDefault || false,
    };

    // Auto-validate if enabled
    if (this.autoValidate) {
      metadata.status = ApiKeyStatus.VALIDATING;
      const validation = await validateApiKey(options.provider, options.key);
      metadata.status = validation.valid ? ApiKeyStatus.ACTIVE : ApiKeyStatus.INVALID;
      metadata.lastValidatedAt = validation.validatedAt;
    }

    // Handle default key logic
    if (metadata.isDefault) {
      await this.clearDefaultForProvider(options.provider);
    }

    // Store encrypted key
    const stored: StoredApiKey = {
      metadata,
      encryptedKey: options.key, // Will be encrypted by storage
      iv: '',
      authTag: '',
    };

    await this.storage.store(id, JSON.stringify(stored));
    this.metadata.set(id, metadata);

    return metadata;
  }

  /**
   * Get an API key by ID (returns the actual decrypted key)
   */
  async getKey(keyId: string): Promise<string | null> {
    const data = await this.storage.retrieve(keyId);
    if (!data) return null;

    try {
      const stored: StoredApiKey = JSON.parse(data);
      // Record usage
      this.recordKeyUsage(stored.metadata);
      return stored.encryptedKey; // The storage layer already decrypts
    } catch {
      return null;
    }
  }

  /**
   * Get key metadata by ID
   */
  getKeyMetadata(keyId: string): ApiKeyMetadata | undefined {
    return this.metadata.get(keyId);
  }

  /**
   * Get all keys (optionally filtered)
   */
  getAllKeys(filter?: ApiKeyFilter): ApiKeyMetadata[] {
    let keys = Array.from(this.metadata.values());

    if (filter) {
      if (filter.provider) {
        keys = keys.filter((k) => k.provider === filter.provider);
      }
      if (filter.status) {
        keys = keys.filter((k) => k.status === filter.status);
      }
      if (filter.tags && filter.tags.length > 0) {
        keys = keys.filter((k) => filter.tags!.some((t) => k.tags.includes(t)));
      }
      if (filter.search) {
        const search = filter.search.toLowerCase();
        keys = keys.filter(
          (k) =>
            k.name.toLowerCase().includes(search) ||
            k.description?.toLowerCase().includes(search) ||
            k.provider.toLowerCase().includes(search)
        );
      }
      if (filter.isDefault !== undefined) {
        keys = keys.filter((k) => k.isDefault === filter.isDefault);
      }
    }

    return keys;
  }

  /**
   * Update an existing key's metadata
   */
  async updateKey(keyId: string, options: UpdateApiKeyOptions): Promise<ApiKeyMetadata> {
    const existing = this.metadata.get(keyId);
    if (!existing) {
      throw new Error(`Key not found: ${keyId}`);
    }

    const storedData = await this.storage.retrieve(keyId);
    if (!storedData) {
      throw new Error(`Stored key data not found: ${keyId}`);
    }

    const stored: StoredApiKey = JSON.parse(storedData);
    const updated: ApiKeyMetadata = {
      ...existing,
      ...options,
      updatedAt: new Date(),
    };

    // Handle default key logic
    if (options.isDefault && !existing.isDefault) {
      await this.clearDefaultForProvider(existing.provider);
    }

    stored.metadata = updated;
    await this.storage.store(keyId, JSON.stringify(stored));
    this.metadata.set(keyId, updated);

    return updated;
  }

  /**
   * Delete an API key
   */
  async deleteKey(keyId: string): Promise<boolean> {
    const result = await this.storage.delete(keyId);
    if (result) {
      this.metadata.delete(keyId);
    }
    return result;
  }

  /**
   * Validate a specific key
   */
  async validateKey(keyId: string): Promise<ValidationResult> {
    const metadata = this.metadata.get(keyId);
    if (!metadata) {
      throw new Error(`Key not found: ${keyId}`);
    }

    const key = await this.getKey(keyId);
    if (!key) {
      return {
        valid: false,
        provider: metadata.provider,
        message: 'Could not retrieve key from storage',
        validatedAt: new Date(),
      };
    }

    const result = await validateApiKey(metadata.provider, key);

    // Update status based on validation
    const updated = {
      ...metadata,
      status: result.valid ? ApiKeyStatus.ACTIVE : ApiKeyStatus.INVALID,
      lastValidatedAt: result.validatedAt,
      updatedAt: new Date(),
    };

    const storedData = await this.storage.retrieve(keyId);
    if (storedData) {
      const stored: StoredApiKey = JSON.parse(storedData);
      stored.metadata = updated;
      await this.storage.store(keyId, JSON.stringify(stored));
    }

    this.metadata.set(keyId, updated);
    return result;
  }

  /**
   * Validate all keys
   */
  async validateAllKeys(): Promise<Map<string, ValidationResult>> {
    const results = new Map<string, ValidationResult>();
    const keyIds = Array.from(this.metadata.keys());

    for (const keyId of keyIds) {
      try {
        const result = await this.validateKey(keyId);
        results.set(keyId, result);
      } catch (error: any) {
        const metadata = this.metadata.get(keyId);
        results.set(keyId, {
          valid: false,
          provider: metadata?.provider || ApiProvider.OPENAI,
          message: error.message,
          validatedAt: new Date(),
        });
      }
    }

    return results;
  }

  /**
   * Revoke a key (mark as revoked)
   */
  async revokeKey(keyId: string): Promise<ApiKeyMetadata> {
    return this.updateKey(keyId, { status: ApiKeyStatus.REVOKED });
  }

  /**
   * Set a key as the default for its provider
   */
  async setDefaultKey(keyId: string): Promise<ApiKeyMetadata> {
    const metadata = this.metadata.get(keyId);
    if (!metadata) {
      throw new Error(`Key not found: ${keyId}`);
    }

    await this.clearDefaultForProvider(metadata.provider);
    return this.updateKey(keyId, { isDefault: true });
  }

  /**
   * Get the default key for a provider
   */
  getDefaultKey(provider: ApiProvider): ApiKeyMetadata | undefined {
    return Array.from(this.metadata.values()).find(
      (k) => k.provider === provider && k.isDefault
    );
  }

  /**
   * Get the default key for a provider (with actual key value)
   */
  async getDefaultKeyWithValue(provider: ApiProvider): Promise<{ metadata: ApiKeyMetadata; key: string } | null> {
    const metadata = this.getDefaultKey(provider);
    if (!metadata) return null;
    
    const key = await this.getKey(metadata.id);
    if (!key) return null;

    return { metadata, key };
  }

  /**
   * Clear default status for all keys of a provider
   */
  private async clearDefaultForProvider(provider: ApiProvider): Promise<void> {
    const defaults = Array.from(this.metadata.entries()).filter(
      ([_, m]) => m.provider === provider && m.isDefault
    );

    for (const [id] of defaults) {
      await this.updateKey(id, { isDefault: false });
    }
  }

  /**
   * Check expiration for all keys
   */
  async checkAllKeyExpirations(): Promise<void> {
    const keys = Array.from(this.metadata.entries());

    for (const [id, metadata] of keys) {
      const check = checkKeyExpiration(metadata, this.rotationConfig);

      if (check.action === 'revoke' || check.action === 'rotate') {
        const updated = {
          ...metadata,
          status: check.isExpired ? ApiKeyStatus.EXPIRED : metadata.status,
          updatedAt: new Date(),
        };

        const storedData = await this.storage.retrieve(id);
        if (storedData) {
          const stored: StoredApiKey = JSON.parse(storedData);
          stored.metadata = updated;
          await this.storage.store(id, JSON.stringify(stored));
        }

        this.metadata.set(id, updated);
      }
    }
  }

  /**
   * Record key usage
   */
  private recordKeyUsage(metadata: ApiKeyMetadata): void {
    const updated = {
      ...metadata,
      lastUsedAt: new Date(),
      usage: {
        ...metadata.usage,
        lastUsed: new Date(),
      },
    };
    this.metadata.set(metadata.id, updated);
  }

  /**
   * Record a usage event for metrics tracking
   */
  recordUsageEvent(event: UsageEvent): void {
    this.metricsTracker.recordEvent(event);

    // Update key metadata usage
    const metadata = this.metadata.get(event.keyId);
    if (metadata) {
      const updated = {
        ...metadata,
        usage: this.metricsTracker.getKeyMetrics(event.keyId) || metadata.usage,
        lastUsedAt: event.timestamp,
        updatedAt: new Date(),
      };
      this.metadata.set(event.keyId, updated);
    }
  }

  /**
   * Get the usage metrics tracker
   */
  getMetricsTracker(): UsageMetricsTracker {
    return this.metricsTracker;
  }

  /**
   * Get provider configuration
   */
  getProviderConfig(provider: ApiProvider) {
    return getProviderConfig(provider);
  }

  /**
   * Get the number of stored keys
   */
  getKeyCount(): number {
    return this.metadata.size;
  }

  /**
   * Get count of keys by provider
   */
  getKeyCountByProvider(): Map<ApiProvider, number> {
    const counts = new Map<ApiProvider, number>();
    for (const metadata of this.metadata.values()) {
      const current = counts.get(metadata.provider) || 0;
      counts.set(metadata.provider, current + 1);
    }
    return counts;
  }

  /**
   * Export all keys (for backup)
   */
  async exportKeys(): Promise<StoredApiKey[]> {
    const exported: StoredApiKey[] = [];
    for (const keyId of this.metadata.keys()) {
      const data = await this.storage.retrieve(keyId);
      if (data) {
        exported.push(JSON.parse(data));
      }
    }
    return exported;
  }

  /**
   * Import keys (from backup)
   */
  async importKeys(keys: StoredApiKey[], overwrite: boolean = false): Promise<number> {
    let imported = 0;

    for (const key of keys) {
      const existing = this.metadata.has(key.metadata.id);
      if (existing && !overwrite) continue;

      await this.storage.store(key.metadata.id, JSON.stringify(key));
      this.metadata.set(key.metadata.id, key.metadata);
      imported++;
    }

    return imported;
  }

  /**
   * Clear all keys (dangerous operation)
   */
  async clearAll(): Promise<void> {
    for (const keyId of this.metadata.keys()) {
      await this.storage.delete(keyId);
    }
    this.metadata.clear();
    this.metricsTracker.clearAll();
  }

  /**
   * Health check - returns summary of key statuses
   */
  async healthCheck(): Promise<{
    totalKeys: number;
    activeKeys: number;
    expiredKeys: number;
    invalidKeys: number;
    byProvider: Record<string, number>;
    keysNeedingRotation: number;
  }> {
    const keys = Array.from(this.metadata.values());
    const expiredKeys = keys.filter((k) => k.status === ApiKeyStatus.EXPIRED);
    const invalidKeys = keys.filter((k) => k.status === ApiKeyStatus.INVALID);

    const byProvider: Record<string, number> = {};
    for (const key of keys) {
      byProvider[key.provider] = (byProvider[key.provider] || 0) + 1;
    }

    return {
      totalKeys: keys.length,
      activeKeys: keys.filter((k) => k.status === ApiKeyStatus.ACTIVE).length,
      expiredKeys: expiredKeys.length,
      invalidKeys: invalidKeys.length,
      byProvider,
      keysNeedingRotation: keys.filter(
        (k) => checkKeyExpiration(k, this.rotationConfig).needsRotation
      ).length,
    };
  }
}

/**
 * Create a default ApiKeyManager instance
 */
export function createApiKeyManager(config?: ApiKeyManagerConfig): ApiKeyManager {
  return new ApiKeyManager(config);
}