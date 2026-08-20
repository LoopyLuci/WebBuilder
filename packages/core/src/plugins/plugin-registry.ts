// ============================================================================
// WebBuilder Core — Plugin Registry
// Manages plugin registration, lifecycle, and dependency resolution
// ============================================================================

import { nanoid } from 'nanoid';
import type {
  Component,
  DesignSystem,
  ExporterRegistration,
  GeneratorRegistration,
  ID,
  JSONValue,
  LoaderOptions,
  Plugin,
  PluginAPI,
  PluginDependency,
  PluginInstance,
  PluginManifest,
  PluginModule,
  PluginState,
  RegistryOptions,
  Theme,
  ToolRegistration,
  ValidationResult,
} from './types.js';
import { HookSystem, createHookSystem } from './hooks.js';
import { PluginAPIImpl, createPluginAPI } from './plugin-api.js';

// ─── Plugin Registry ─────────────────────────────────────────────────────────

export class PluginRegistry {
  private plugins: Map<ID, Plugin>;
  private hookSystem: HookSystem;
  private options: RegistryOptions;

  // Extension registries
  private components: Map<ID, Component>;
  private generators: Map<string, GeneratorRegistration>;
  private exporters: Map<string, ExporterRegistration>;
  private tools: Map<string, ToolRegistration>;
  private designSystem: DesignSystem | null;

  // API instances cache
  private apiInstances: Map<ID, PluginAPIImpl>;

  constructor(options?: Partial<RegistryOptions>) {
    this.plugins = new Map();
    this.hookSystem = createHookSystem();
    this.options = {
      autoActivate: true,
      resolveDependencies: true,
      allowDuplicates: false,
      maxPlugins: 100,
      ...options,
    };

    this.components = new Map();
    this.generators = new Map();
    this.exporters = new Map();
    this.tools = new Map();
    this.designSystem = null;
    this.apiInstances = new Map();
  }

  // ─── Registration ───────────────────────────────────────────────────────

  /**
   * Register a plugin with the system
   */
  register(
    manifest: PluginManifest,
    instance: PluginInstance,
    config?: Record<string, JSONValue>
  ): ValidationResult {
    // Validate manifest
    const validation = this.validateManifest(manifest);
    if (!validation.valid) {
      return validation;
    }

    // Check plugin limit
    if (this.plugins.size >= this.options.maxPlugins) {
      return {
        valid: false,
        errors: [`Maximum plugin limit (${this.options.maxPlugins}) reached`],
        warnings: [],
      };
    }

    // Check for duplicates
    if (this.plugins.has(manifest.id) && !this.options.allowDuplicates) {
      return {
        valid: false,
        errors: [`Plugin "${manifest.id}" is already registered`],
        warnings: [],
      };
    }

    // Resolve dependencies
    if (this.options.resolveDependencies && manifest.dependencies) {
      const depResult = this.resolveDependencies(manifest.dependencies);
      if (!depResult.valid) {
        return depResult;
      }
    }

    // Create plugin record
    const plugin: Plugin = {
      manifest,
      state: 'registered',
      instance,
      loadedAt: new Date().toISOString(),
    };

    this.plugins.set(manifest.id, plugin);

    // Create and configure API instance
    const api = createPluginAPI(manifest, this.hookSystem, config) as PluginAPIImpl;
    api.setComponentRegistry(this.components);
    api.setGeneratorRegistry(this.generators);
    api.setExporterRegistry(this.exporters);
    api.setToolRegistry(this.tools);
    if (this.designSystem) {
      api.setDesignSystem(this.designSystem);
    }
    api.setPluginRegistry(this.plugins as any);
    this.apiInstances.set(manifest.id, api);

    return { valid: true, errors: [], warnings: [] };
  }

  /**
   * Unregister a plugin and clean up
   */
  unregister(pluginId: ID): boolean {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return false;

    // Deactivate if active
    if (plugin.state === 'active') {
      this.deactivate(pluginId);
    }

    // Clean up hooks
    this.hookSystem.removePluginHooks(pluginId);

    // Remove from registries
    this.apiInstances.delete(pluginId);
    this.plugins.delete(pluginId);

    return true;
  }

  // ─── Lifecycle ──────────────────────────────────────────────────────────

  /**
   * Load a plugin (call init)
   */
  async load(pluginId: ID): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return false;
    if (plugin.state !== 'registered') return false;

    const api = this.apiInstances.get(pluginId);
    if (!api) return false;

    try {
      if (plugin.instance?.init) {
        await plugin.instance.init(api);
      }
      plugin.state = 'loaded';
      plugin.error = undefined;
      return true;
    } catch (error) {
      plugin.state = 'error';
      plugin.error = error instanceof Error ? error.message : String(error);
      return false;
    }
  }

  /**
   * Activate a plugin
   */
  async activate(pluginId: ID): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return false;
    if (plugin.state !== 'loaded' && plugin.state !== 'inactive') return false;

    const api = this.apiInstances.get(pluginId);
    if (!api) return false;

    try {
      if (plugin.instance?.activate) {
        await plugin.instance.activate(api);
      }
      plugin.state = 'active';
      plugin.activatedAt = new Date().toISOString();
      plugin.error = undefined;
      return true;
    } catch (error) {
      plugin.state = 'error';
      plugin.error = error instanceof Error ? error.message : String(error);
      return false;
    }
  }

  /**
   * Deactivate a plugin
   */
  async deactivate(pluginId: ID): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return false;
    if (plugin.state !== 'active') return false;

    const api = this.apiInstances.get(pluginId);
    if (!api) return false;

    try {
      if (plugin.instance?.deactivate) {
        await plugin.instance.deactivate(api);
      }
      plugin.state = 'inactive';
      return true;
    } catch (error) {
      plugin.state = 'error';
      plugin.error = error instanceof Error ? error.message : String(error);
      return false;
    }
  }

  /**
   * Destroy a plugin (cleanup)
   */
  async destroy(pluginId: ID): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return false;

    const api = this.apiInstances.get(pluginId);
    if (api && plugin.instance?.destroy) {
      try {
        await plugin.instance.destroy(api);
      } catch (error) {
        console.error(`[Registry] Error destroying plugin "${pluginId}":`, error);
      }
    }

    // Unregister
    return this.unregister(pluginId);
  }

  /**
   * Load and optionally auto-activate a plugin
   */
  async loadAndActivate(
    manifest: PluginManifest,
    instance: PluginInstance,
    config?: Record<string, JSONValue>
  ): Promise<boolean> {
    const regResult = this.register(manifest, instance, config);
    if (!regResult.valid) {
      console.error(`[Registry] Failed to register plugin "${manifest.id}":`, regResult.errors);
      return false;
    }

    const loaded = await this.load(manifest.id);
    if (!loaded) return false;

    if (this.options.autoActivate) {
      return this.activate(manifest.id);
    }

    return true;
  }

  // ─── Accessors ──────────────────────────────────────────────────────────

  /**
   * Get a plugin by ID
   */
  get(pluginId: ID): Plugin | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * List all registered plugins
   */
  list(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * List active plugins
   */
  listActive(): Plugin[] {
    return this.list().filter((p) => p.state === 'active');
  }

  /**
   * Get a plugin's API instance
   */
  getAPI(pluginId: ID): PluginAPI | undefined {
    return this.apiInstances.get(pluginId);
  }

  /**
   * Get the hook system
   */
  getHookSystem(): HookSystem {
    return this.hookSystem;
  }

  /**
   * Set the design system (injected into plugin APIs)
   */
  setDesignSystem(system: DesignSystem): void {
    this.designSystem = system;
    for (const api of this.apiInstances.values()) {
      api.setDesignSystem(system);
    }
  }

  // ─── Extension Access ───────────────────────────────────────────────────

  /**
   * Get all registered components
   */
  getComponents(): Component[] {
    return Array.from(this.components.values());
  }

  /**
   * Get all registered generators
   */
  getGenerators(): GeneratorRegistration[] {
    return Array.from(this.generators.values());
  }

  /**
   * Get all registered exporters
   */
  getExporters(): ExporterRegistration[] {
    return Array.from(this.exporters.values());
  }

  /**
   * Get all registered tools
   */
  getTools(): ToolRegistration[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get a generator by name
   */
  getGenerator(name: string): GeneratorRegistration | undefined {
    return this.generators.get(name);
  }

  /**
   * Get an exporter by name
   */
  getExporter(name: string): ExporterRegistration | undefined {
    return this.exporters.get(name);
  }

  /**
   * Get a tool by name
   */
  getTool(name: string): ToolRegistration | undefined {
    return this.tools.get(name);
  }

  /**
   * Get a component by ID
   */
  getComponent(componentId: ID): Component | undefined {
    return this.components.get(componentId);
  }

  // ─── Validation ─────────────────────────────────────────────────────────

  /**
   * Validate a plugin manifest
   */
  validateManifest(manifest: PluginManifest): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!manifest.id) errors.push('Plugin ID is required');
    if (!manifest.name) errors.push('Plugin name is required');
    if (!manifest.version) errors.push('Plugin version is required');
    if (!manifest.main) errors.push('Plugin main entry is required');
    if (!manifest.type) errors.push('Plugin type is required');

    // Validate ID format (must be a valid identifier)
    if (manifest.id && !/^[a-z0-9][a-z0-9-_]*$/i.test(manifest.id)) {
      errors.push('Plugin ID must start with alphanumeric and contain only alphanumerics, hyphens, and underscores');
    }

    // Validate version (semver-like)
    if (manifest.version && !/^\d+\.\d+\.\d+/.test(manifest.version)) {
      warnings.push('Plugin version should follow semver format (x.y.z)');
    }

    // Validate permissions
    if (manifest.permissions) {
      const validPermissions = [
        'filesystem:read', 'filesystem:write', 'network:fetch', 'network:websocket',
        'ui:render', 'ui:panel', 'codegen:modify', 'deploy:hook',
        'design:modify', 'registry:register',
      ];
      for (const perm of manifest.permissions) {
        if (!validPermissions.includes(perm)) {
          warnings.push(`Unknown permission: ${perm}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Resolve plugin dependencies
   */
  private resolveDependencies(dependencies: PluginDependency[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const dep of dependencies) {
      const depPlugin = this.plugins.get(dep.id);
      if (!depPlugin) {
        if (!dep.optional) {
          errors.push(`Missing required dependency: ${dep.id}`);
        } else {
          warnings.push(`Optional dependency not found: ${dep.id}`);
        }
        continue;
      }

      // Simple version range check (exact match or satisfies range)
      if (dep.versionRange && depPlugin.manifest.version !== dep.versionRange) {
        warnings.push(
          `Dependency "${dep.id}" version "${depPlugin.manifest.version}" may not satisfy "${dep.versionRange}"`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // ─── Configuration ──────────────────────────────────────────────────────

  /**
   * Update plugin configuration
   */
  async configure(pluginId: ID, config: Record<string, JSONValue>): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return false;

    const api = this.apiInstances.get(pluginId);
    if (!api) return false;

    api.setConfig(config);

    if (plugin.instance?.onConfigChange) {
      try {
        await plugin.instance.onConfigChange(config, api);
        return true;
      } catch (error) {
        console.error(`[Registry] Error configuring plugin "${pluginId}":`, error);
        return false;
      }
    }

    return true;
  }

  // ─── Introspection ──────────────────────────────────────────────────────

  /**
   * Get registry statistics
   */
  getStats(): {
    total: number;
    active: number;
    loaded: number;
    inactive: number;
    error: number;
    components: number;
    generators: number;
    exporters: number;
    tools: number;
    hooks: number;
  } {
    const plugins = this.list();
    return {
      total: plugins.length,
      active: plugins.filter((p) => p.state === 'active').length,
      loaded: plugins.filter((p) => p.state === 'loaded').length,
      inactive: plugins.filter((p) => p.state === 'inactive').length,
      error: plugins.filter((p) => p.state === 'error').length,
      components: this.components.size,
      generators: this.generators.size,
      exporters: this.exporters.size,
      tools: this.tools.size,
      hooks: this.hookSystem.getHookCount(),
    };
  }

  /**
   * Clear all plugins
   */
  async clear(): Promise<void> {
    for (const pluginId of Array.from(this.plugins.keys())) {
      await this.destroy(pluginId);
    }
  }
}

// ─── Factory ─────────────────────────────────────────────────────────────────

export function createPluginRegistry(options?: Partial<RegistryOptions>): PluginRegistry {
  return new PluginRegistry(options);
}