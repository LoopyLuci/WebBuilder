// ============================================================================
// WebBuilder Core — Plugin System
// Extensible plugin architecture with loader, registry, API, and hooks
// ============================================================================

// ─── Core Exports ────────────────────────────────────────────────────────────

export {
  // Hook System
  HookSystem,
  getHookSystem,
  createHookSystem,
} from './hooks.js';

export {
  // Plugin API
  PluginAPIImpl,
  createPluginAPI,
} from './plugin-api.js';

export {
  // Plugin Registry
  PluginRegistry,
  createPluginRegistry,
} from './plugin-registry.js';

export {
  // Plugin Loader
  PluginLoader,
  createPluginLoader,
} from './plugin-loader.js';

// ─── Type Exports ────────────────────────────────────────────────────────────

export type {
  // Plugin manifest and instance
  PluginManifest,
  PluginInstance,
  PluginModule,
  Plugin,
  PluginState,
  PluginType,
  PluginPermission,
  PluginDependency,
  ComponentRegistration,
  GeneratorRegistration,
  ExporterRegistration,
  ToolRegistration,
  PluginAPI,

  // Hooks
  HookType,
  HookHandler,
  HookContext,
  HookExecuteResult,
  HookRegistration,

  // Loader
  LoaderOptions,
  LoaderEvent,
  LoaderEventHandler,

  // Registry
  RegistryOptions,
  ValidationResult,

  // Constants
  ExtensionPoint,
} from './types.js';

// ─── Constants ───────────────────────────────────────────────────────────────

export { EXTENSION_POINTS, HOOKS } from './types.js';

// ─── Example Plugin ──────────────────────────────────────────────────────────

export { manifest as examplePluginManifest, plugin as examplePlugin } from './example-plugin.js';

// ─── Plugin Orchestrator ─────────────────────────────────────────────────────

/**
 * PluginOrchestrator — High-level API for managing the full plugin lifecycle.
 * Combines the loader, registry, and hook system into a single interface.
 */
export class PluginOrchestrator {
  private loader: import('./plugin-loader.js').PluginLoader;
  private registry: import('./plugin-registry.js').PluginRegistry;
  private options: import('./plugin-loader.js').LoaderOptions;

  constructor(
    loaderOptions?: Partial<import('./plugin-loader.js').LoaderOptions>,
    registryOptions?: Partial<import('./plugin-registry.js').RegistryOptions>
  ) {
    // Direct instantiation to avoid circular deps
    const { PluginLoader } = require('./plugin-loader.js');
    const { PluginRegistry } = require('./plugin-registry.js');
    this.loader = new PluginLoader(loaderOptions);
    this.registry = new PluginRegistry(registryOptions);
    this.options = loaderOptions as import('./plugin-loader.js').LoaderOptions;
  }

  /**
   * Initialize the orchestrator with event wiring
   */
  initialize(): void {
    this.loader.on((event) => {
      console.log(`[Orchestrator] Plugin ${event.pluginId}: ${event.type}`);
    });
  }

  /**
   * Load and register a plugin from directory
   */
  async loadFromDirectory(pluginDir: string): Promise<boolean> {
    const result = await this.loader.loadFromDirectory(pluginDir);
    if (!result) return false;

    const { manifest, instance } = result;
    return this.registry.loadAndActivate(manifest, instance);
  }

  /**
   * Load and register a plugin from file
   */
  async loadFromFile(filePath: string): Promise<boolean> {
    const result = await this.loader.loadFromFile(filePath);
    if (!result) return false;

    const { manifest, instance } = result;
    return this.registry.loadAndActivate(manifest, instance);
  }

  /**
   * Register a plugin programmatically
   */
  async register(
    manifest: import('./types.js').PluginManifest,
    instance: import('./types.js').PluginInstance,
    config?: Record<string, unknown>
  ): Promise<boolean> {
    return this.registry.loadAndActivate(manifest, instance, config);
  }

  /**
   * Unload a plugin
   */
  async unload(pluginId: string): Promise<boolean> {
    this.loader.unload(pluginId);
    return this.registry.destroy(pluginId);
  }

  /**
   * Get the hook system
   */
  getHookSystem(): import('./hooks.js').HookSystem {
    return this.registry.getHookSystem();
  }

  /**
   * Get the registry
   */
  getRegistry(): import('./plugin-registry.js').PluginRegistry {
    return this.registry;
  }

  /**
   * Get the loader
   */
  getLoader(): import('./plugin-loader.js').PluginLoader {
    return this.loader;
  }

  /**
   * Cleanup all resources
   */
  destroy(): void {
    this.registry.clear();
    this.loader.destroy();
  }
}

/**
 * Create a PluginOrchestrator instance
 */
export function createPluginOrchestrator(
  loaderOptions?: Partial<import('./plugin-loader.js').LoaderOptions>,
  registryOptions?: Partial<import('./plugin-registry.js').RegistryOptions>
): PluginOrchestrator {
  return new PluginOrchestrator(loaderOptions, registryOptions);
}

export default PluginOrchestrator;