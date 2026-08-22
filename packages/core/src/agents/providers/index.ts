// ============================================================================
// Provider Registry — Manages provider adapter instances
// ============================================================================

import {
  ProviderName,
  ProviderConfig,
  ProviderMessage,
  ProviderToolDefinition,
  ProviderResponse,
  ProviderStreamEvent,
  ModelConfig,
} from '../types.js';
import { OpenAIAdapter } from './openai.js';
import { AnthropicAdapter } from './anthropic.js';
import { GoogleAdapter } from './google.js';

export type ProviderAdapter =
  | OpenAIAdapter
  | AnthropicAdapter
  | GoogleAdapter;

// Registry of adapter constructors
type AdapterConstructor = new (config: ProviderConfig) => ProviderAdapter;

const adapterRegistry: Record<ProviderName, AdapterConstructor> = {
  openai: OpenAIAdapter,
  anthropic: AnthropicAdapter,
  google: GoogleAdapter,
  custom: OpenAIAdapter, // Custom providers default to OpenAI-compatible API
};

// Cache for adapter instances
const adapterCache: Map<string, ProviderAdapter> = new Map();

/**
 * Get a provider adapter by name.
 * For 'custom' providers, requires baseUrl in config.
 */
export function getProviderAdapter(name: ProviderName, config?: ProviderConfig): ProviderAdapter {
  const cacheKey = `${name}-${config?.baseUrl ?? 'default'}-${config?.apiKey?.slice(-8) ?? 'default'}`;
  
  if (adapterCache.has(cacheKey)) {
    return adapterCache.get(cacheKey)!;
  }

  const AdapterClass = adapterRegistry[name];
  if (!AdapterClass) {
    throw new Error(`Unknown provider: ${name}`);
  }

  const adapter = new AdapterClass(config ?? { name, apiKey: '' });
  adapterCache.set(cacheKey, adapter);
  return adapter;
}

/**
 * Create a fresh adapter instance (not cached).
 */
export function createProviderAdapter(config: ProviderConfig): ProviderAdapter {
  const AdapterClass = adapterRegistry[config.name];
  if (!AdapterClass) {
    throw new Error(`Unknown provider: ${config.name}`);
  }

  return new AdapterClass(config);
}

/**
 * Register a custom provider adapter.
 */
export function registerProviderAdapter(
  name: ProviderName,
  adapterClass: AdapterConstructor
): void {
  adapterRegistry[name] = adapterClass;
}

/**
 * Clear the adapter cache.
 */
export function clearAdapterCache(): void {
  adapterCache.clear();
}

/**
 * Get list of available provider names.
 */
export function getAvailableProviders(): ProviderName[] {
  return Object.keys(adapterRegistry) as ProviderName[];
}

// Re-export adapter classes for direct use
export { OpenAIAdapter, AnthropicAdapter, GoogleAdapter };
export type { ProviderAdapter as ProviderAdapterType };