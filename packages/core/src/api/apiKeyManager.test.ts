// API Key Management System Tests
// Unit tests for secure storage, key validation, rotation, and metrics

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { ApiKeyManager, createApiKeyManager } from './ApiKeyManager.js';
import { EncryptedFileStorage } from './secureStorage.js';
import { ApiProvider, ApiKeyStatus } from './types.js';
import { getProviderConfig, getAllProviderConfigs, isProviderSupported } from './providerConfigs.js';
import { validateKeyFormat } from './keyValidation.js';
import { checkKeyExpiration, DEFAULT_ROTATION_CONFIG } from './keyRotation.js';
import { UsageMetricsTracker, createMetricsTracker } from './usageMetrics.js';

describe('EncryptedFileStorage', () => {
  let storage: EncryptedFileStorage;
  let storagePath: string;

  beforeEach(() => {
    storagePath = join(tmpdir(), `test-storage-${Date.now()}.enc`);
    storage = new EncryptedFileStorage({ storagePath, encryptionKey: 'test-key' });
  });

  afterEach(async () => {
    try {
      await fs.unlink(storagePath);
    } catch {
      // File may not exist
    }
  });

  it('should store and retrieve encrypted values', async () => {
    await storage.store('key1', 'secret-value');
    const value = await storage.retrieve('key1');
    expect(value).toBe('secret-value');
  });

  it('should return null for non-existent keys', async () => {
    const value = await storage.retrieve('nonexistent');
    expect(value).toBeNull();
  });

  it('should check if a key exists', async () => {
    await storage.store('key1', 'value1');
    expect(await storage.exists('key1')).toBe(true);
    expect(await storage.exists('key2')).toBe(false);
  });

  it('should delete stored keys', async () => {
    await storage.store('key1', 'value1');
    expect(await storage.delete('key1')).toBe(true);
    expect(await storage.retrieve('key1')).toBeNull();
  });

  it('should list all stored keys', async () => {
    await storage.store('key1', 'value1');
    await storage.store('key2', 'value2');
    const keys = await storage.list();
    expect(keys).toContain('key1');
    expect(keys).toContain('key2');
  });

  it('should clear all stored data', async () => {
    await storage.store('key1', 'value1');
    await storage.store('key2', 'value2');
    await storage.clear();
    expect(await storage.list()).toHaveLength(0);
  });

  it('should persist data across instances', async () => {
    await storage.store('key1', 'persistent-value');

    const storage2 = new EncryptedFileStorage({ storagePath, encryptionKey: 'test-key' });
    const value = await storage2.retrieve('key1');
    expect(value).toBe('persistent-value');
  });
});

describe('ProviderConfigs', () => {
  it('should have configuration for all providers', () => {
    const configs = getAllProviderConfigs();
    expect(configs.length).toBeGreaterThanOrEqual(12);
  });

  it('should get config by provider', () => {
    const config = getProviderConfig(ApiProvider.OPENAI);
    expect(config.name).toBe('OpenAI');
    expect(config.baseUrl).toBe('https://api.openai.com/v1');
  });

  it('should check if provider is supported', () => {
    expect(isProviderSupported('openai')).toBe(true);
    expect(isProviderSupported('nonexistent')).toBe(false);
  });

  it('should have valid pricing info', () => {
    const config = getProviderConfig(ApiProvider.ANTHROPIC);
    expect(config.pricing.inputTokenCost).toBeGreaterThan(0);
    expect(config.pricing.outputTokenCost).toBeGreaterThan(0);
  });
});

describe('KeyValidation', () => {
  it('should validate OpenAI key format', () => {
    const result = validateKeyFormat(ApiProvider.OPENAI, 'sk-validkey123');
    expect(result.valid).toBe(true);
  });

  it('should reject empty keys', () => {
    const result = validateKeyFormat(ApiProvider.OPENAI, '');
    expect(result.valid).toBe(false);
  });

  it('should reject keys that are too short', () => {
    const result = validateKeyFormat(ApiProvider.OPENAI, 'short');
    expect(result.valid).toBe(false);
  });

  it('should reject keys with wrong prefix', () => {
    const result = validateKeyFormat(ApiProvider.OPENAI, 'wrong-prefix-key');
    expect(result.valid).toBe(false);
  });
});

describe('KeyRotation', () => {
  it('should detect expired keys', () => {
    const metadata = {
      id: 'test',
      provider: ApiProvider.OPENAI,
      name: 'Test',
      status: ApiKeyStatus.ACTIVE,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      expiresAt: new Date('2024-02-01'),
      usage: {
        totalRequests: 0,
        totalTokens: 0,
        totalCost: 0,
        dailyRequests: 0,
        monthlyRequests: 0,
        averageResponseTime: 0,
        errorRate: 0,
      },
      tags: [],
      isDefault: false,
    };

    const result = checkKeyExpiration(metadata, DEFAULT_ROTATION_CONFIG, new Date('2024-03-01'));
    expect(result.isExpired).toBe(true);
    expect(result.action).toBe('revoke');
  });

  it('should detect keys needing rotation', () => {
    const metadata = {
      id: 'test',
      provider: ApiProvider.OPENAI,
      name: 'Test',
      status: ApiKeyStatus.ACTIVE,
      createdAt: new Date('2020-01-01'),
      updatedAt: new Date('2020-01-01'),
      usage: {
        totalRequests: 0,
        totalTokens: 0,
        totalCost: 0,
        dailyRequests: 0,
        monthlyRequests: 0,
        averageResponseTime: 0,
        errorRate: 0,
      },
      tags: [],
      isDefault: false,
    };

    const result = checkKeyExpiration(metadata, DEFAULT_ROTATION_CONFIG);
    expect(result.needsRotation).toBe(true);
  });
});

describe('UsageMetricsTracker', () => {
  let tracker: UsageMetricsTracker;

  beforeEach(() => {
    tracker = createMetricsTracker();
  });

  it('should record usage events', () => {
    tracker.recordEvent({
      keyId: 'key1',
      provider: ApiProvider.OPENAI,
      timestamp: new Date(),
      requestType: 'completion',
      tokensUsed: 100,
      inputTokens: 50,
      outputTokens: 50,
      cost: 0.001,
      responseTime: 500,
      success: true,
    });

    const metrics = tracker.getKeyMetrics('key1');
    expect(metrics).toBeDefined();
    expect(metrics!.totalRequests).toBe(1);
    expect(metrics!.totalTokens).toBe(100);
    expect(metrics!.totalCost).toBeCloseTo(0.001);
  });

  it('should track multiple events', () => {
    for (let i = 0; i < 5; i++) {
      tracker.recordEvent({
        keyId: 'key1',
        provider: ApiProvider.OPENAI,
        timestamp: new Date(),
        requestType: 'completion',
        tokensUsed: 100,
        inputTokens: 50,
        outputTokens: 50,
        cost: 0.001,
        responseTime: 500,
        success: true,
      });
    }

    const metrics = tracker.getKeyMetrics('key1');
    expect(metrics!.totalRequests).toBe(5);
    expect(metrics!.totalTokens).toBe(500);
  });

  it('should get top keys', () => {
    for (let i = 0; i < 3; i++) {
      tracker.recordEvent({
        keyId: 'key1',
        provider: ApiProvider.OPENAI,
        timestamp: new Date(),
        requestType: 'completion',
        tokensUsed: 100,
        inputTokens: 50,
        outputTokens: 50,
        cost: 0.001,
        responseTime: 500,
        success: true,
      });
    }

    for (let i = 0; i < 1; i++) {
      tracker.recordEvent({
        keyId: 'key2',
        provider: ApiProvider.ANTHROPIC,
        timestamp: new Date(),
        requestType: 'completion',
        tokensUsed: 100,
        inputTokens: 50,
        outputTokens: 50,
        cost: 0.001,
        responseTime: 500,
        success: true,
      });
    }

    const top = tracker.getTopKeys(2);
    expect(top[0].keyId).toBe('key1');
    expect(top[0].metrics.totalRequests).toBe(3);
  });
});

describe('ApiKeyManager', () => {
  let manager: ApiKeyManager;
  let storagePath: string;

  beforeEach(() => {
    storagePath = join(tmpdir(), `test-apikeymanager-${Date.now()}.enc`);
    manager = createApiKeyManager({
      storagePath,
      encryptionKey: 'test-key',
      autoValidate: false,
    });
  });

  afterEach(async () => {
    try {
      await fs.unlink(storagePath);
    } catch {
      // File may not exist
    }
  });

  it('should create a new key', async () => {
    await manager.initialize();
    const metadata = await manager.createKey({
      provider: ApiProvider.OPENAI,
      name: 'Test Key',
      key: 'sk-test12345678901234567890',
    });

    expect(metadata.id).toBeDefined();
    expect(metadata.provider).toBe(ApiProvider.OPENAI);
    expect(metadata.name).toBe('Test Key');
  });

  it('should retrieve a stored key', async () => {
    await manager.initialize();
    const metadata = await manager.createKey({
      provider: ApiProvider.OPENAI,
      name: 'Test Key',
      key: 'sk-test12345678901234567890',
    });

    const key = await manager.getKey(metadata.id);
    expect(key).toBe('sk-test12345678901234567890');
  });

  it('should filter keys by provider', async () => {
    await manager.initialize();
    await manager.createKey({
      provider: ApiProvider.OPENAI,
      name: 'OpenAI Key',
      key: 'sk-test12345678901234567890',
    });
    await manager.createKey({
      provider: ApiProvider.ANTHROPIC,
      name: 'Anthropic Key',
      key: 'sk-ant-test12345678901234567890',
    });

    const openaiKeys = manager.getAllKeys({ provider: ApiProvider.OPENAI });
    expect(openaiKeys).toHaveLength(1);
    expect(openaiKeys[0].provider).toBe(ApiProvider.OPENAI);
  });

  it('should delete a key', async () => {
    await manager.initialize();
    const metadata = await manager.createKey({
      provider: ApiProvider.OPENAI,
      name: 'Test Key',
      key: 'sk-test12345678901234567890',
    });

    const deleted = await manager.deleteKey(metadata.id);
    expect(deleted).toBe(true);
    expect(manager.getKeyMetadata(metadata.id)).toBeUndefined();
  });

  it('should update key metadata', async () => {
    await manager.initialize();
    const metadata = await manager.createKey({
      provider: ApiProvider.OPENAI,
      name: 'Test Key',
      key: 'sk-test12345678901234567890',
    });

    const updated = await manager.updateKey(metadata.id, { name: 'Updated Name' });
    expect(updated.name).toBe('Updated Name');
  });

  it('should set default keys', async () => {
    await manager.initialize();
    const metadata = await manager.createKey({
      provider: ApiProvider.OPENAI,
      name: 'Default Key',
      key: 'sk-test12345678901234567890',
    });

    await manager.setDefaultKey(metadata.id);
    const defaultKey = manager.getDefaultKey(ApiProvider.OPENAI);
    expect(defaultKey?.id).toBe(metadata.id);
  });

  it('should handle multiple providers', async () => {
    await manager.initialize();
    await manager.createKey({
      provider: ApiProvider.OPENAI,
      name: 'OpenAI Key',
      key: 'sk-test12345678901234567890',
    });
    await manager.createKey({
      provider: ApiProvider.ANTHROPIC,
      name: 'Anthropic Key',
      key: 'sk-ant-test12345678901234567890',
    });
    await manager.createKey({
      provider: ApiProvider.GOOGLE,
      name: 'Google Key',
      key: 'AIzaSy test123456789012345',
    });

    expect(manager.getKeyCount()).toBe(3);
  });
});