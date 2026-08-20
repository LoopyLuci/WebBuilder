// ============================================================================
// WebBuilder Core — Plugin API
// Provides controlled access to the platform for plugins via a sandboxed API
// ============================================================================

import { nanoid } from 'nanoid';
import type {
  Component,
  ComponentRegistration,
  DesignSystem,
  DesignTokens,
  ExporterRegistration,
  FileChange,
  Framework,
  GeneratorRegistration,
  HookHandler,
  ID,
  JSONValue,
  PluginAPI,
  PluginDependency,
  PluginManifest,
  PluginPermission,
  PluginRegistration,
  ProjectSpec,
  Theme,
  ToolRegistration,
} from './types.js';
import { HookSystem } from './hooks.js';

// ─── Plugin API Implementation ───────────────────────────────────────────────

export class PluginAPIImpl implements PluginAPI {
  readonly pluginId: ID;
  readonly manifest: PluginManifest;
  readonly permissions: PluginPermission[];

  private hookSystem: HookSystem;
  private config: Record<string, JSONValue>;
  private eventHandlers: Map<string, Map<ID, (data: JSONValue) => void>>;

  // References to platform systems (injected by registry)
  private componentRegistry: Map<ID, Component> | null = null;
  private generatorRegistry: Map<string, GeneratorRegistration> | null = null;
  private exporterRegistry: Map<string, ExporterRegistration> | null = null;
  private toolRegistry: Map<string, ToolRegistration> | null = null;
  private designSystem: DesignSystem | null = null;
  private pluginRegistry: Map<ID, PluginRegistration> | null = null;

  constructor(
    manifest: PluginManifest,
    hookSystem: HookSystem,
    config?: Record<string, JSONValue>
  ) {
    this.pluginId = manifest.id;
    this.manifest = manifest;
    this.permissions = manifest.permissions ?? [];
    this.hookSystem = hookSystem;
    this.config = config ?? {};
    this.eventHandlers = new Map();
  }

  // ─── System Injection ───────────────────────────────────────────────────

  setComponentRegistry(registry: Map<ID, Component>): void {
    this.componentRegistry = registry;
  }

  setGeneratorRegistry(registry: Map<string, GeneratorRegistration>): void {
    this.generatorRegistry = registry;
  }

  setExporterRegistry(registry: Map<string, ExporterRegistration>): void {
    this.exporterRegistry = registry;
  }

  setToolRegistry(registry: Map<string, ToolRegistration>): void {
    this.toolRegistry = registry;
  }

  setDesignSystem(system: DesignSystem): void {
    this.designSystem = system;
  }

  setPluginRegistry(registry: Map<ID, PluginRegistration>): void {
    this.pluginRegistry = registry;
  }

  // ─── Permissions ────────────────────────────────────────────────────────

  hasPermission(permission: PluginPermission): boolean {
    return this.permissions.includes(permission);
  }

  requestPermission(permission: PluginPermission): boolean {
    // In a real implementation, this might prompt the user
    // For now, only grant if already declared in manifest
    return this.hasPermission(permission);
  }

  private requirePermission(permission: PluginPermission): void {
    if (!this.hasPermission(permission)) {
      throw new Error(
        `Plugin "${this.pluginId}" lacks required permission: ${permission}`
      );
    }
  }

  // ─── Component Extension ────────────────────────────────────────────────

  registerComponent(registration: ComponentRegistration): void {
    this.requirePermission('registry:register');
    if (!this.componentRegistry) {
      throw new Error('Component registry not available');
    }

    const { component, frameworkOverrides } = registration;
    const existing = this.componentRegistry.get(component.id);

    // Apply framework overrides if component already exists
    if (existing && frameworkOverrides) {
      for (const [fw, impl] of Object.entries(frameworkOverrides)) {
        existing.implementations[fw as Framework] = {
          ...existing.implementations[fw as Framework],
          ...impl,
        } as any;
      }
    } else if (!existing) {
      this.componentRegistry.set(component.id, component);
    }

    // Fire hook
    this.hookSystem.doActionSync('component:register', component, {
      pluginId: this.pluginId,
    });
  }

  unregisterComponent(componentId: ID): boolean {
    this.requirePermission('registry:register');
    if (!this.componentRegistry) return false;
    return this.componentRegistry.delete(componentId);
  }

  getComponents(): Component[] {
    this.requirePermission('registry:register');
    if (!this.componentRegistry) return [];
    return Array.from(this.componentRegistry.values());
  }

  getComponent(componentId: ID): Component | undefined {
    this.requirePermission('registry:register');
    if (!this.componentRegistry) return undefined;
    return this.componentRegistry.get(componentId);
  }

  // ─── Generator Extension ────────────────────────────────────────────────

  registerGenerator(registration: GeneratorRegistration): void {
    this.requirePermission('registry:register');
    if (!this.generatorRegistry) {
      throw new Error('Generator registry not available');
    }
    this.generatorRegistry.set(registration.name, registration);
  }

  unregisterGenerator(name: string): boolean {
    this.requirePermission('registry:register');
    if (!this.generatorRegistry) return false;
    return this.generatorRegistry.delete(name);
  }

  getGenerators(): GeneratorRegistration[] {
    this.requirePermission('registry:register');
    if (!this.generatorRegistry) return [];
    return Array.from(this.generatorRegistry.values());
  }

  // ─── Exporter Extension ─────────────────────────────────────────────────

  registerExporter(registration: ExporterRegistration): void {
    this.requirePermission('registry:register');
    if (!this.exporterRegistry) {
      throw new Error('Exporter registry not available');
    }
    this.exporterRegistry.set(registration.name, registration);
  }

  unregisterExporter(name: string): boolean {
    this.requirePermission('registry:register');
    if (!this.exporterRegistry) return false;
    return this.exporterRegistry.delete(name);
  }

  getExporters(): ExporterRegistration[] {
    this.requirePermission('registry:register');
    if (!this.exporterRegistry) return [];
    return Array.from(this.exporterRegistry.values());
  }

  // ─── Tool Extension ─────────────────────────────────────────────────────

  registerTool(registration: ToolRegistration): void {
    this.requirePermission('registry:register');
    if (!this.toolRegistry) {
      throw new Error('Tool registry not available');
    }
    this.toolRegistry.set(registration.name, registration);
  }

  unregisterTool(name: string): boolean {
    this.requirePermission('registry:register');
    if (!this.toolRegistry) return false;
    return this.toolRegistry.delete(name);
  }

  getTools(): ToolRegistration[] {
    this.requirePermission('registry:register');
    if (!this.toolRegistry) return [];
    return Array.from(this.toolRegistry.values());
  }

  // ─── Theme Extension ────────────────────────────────────────────────────

  registerTheme(theme: Theme): void {
    this.requirePermission('design:modify');
    if (!this.designSystem) {
      throw new Error('Design system not available');
    }
    this.designSystem.themes.push(theme);
  }

  unregisterTheme(themeId: ID): boolean {
    this.requirePermission('design:modify');
    if (!this.designSystem) return false;
    const index = this.designSystem.themes.findIndex((t) => t.id === themeId);
    if (index === -1) return false;
    this.designSystem.themes.splice(index, 1);
    return true;
  }

  updateDesignTokens(tokens: Partial<DesignTokens>): void {
    this.requirePermission('design:modify');
    if (!this.designSystem) {
      throw new Error('Design system not available');
    }
    this.designSystem.tokens = { ...this.designSystem.tokens, ...tokens };
  }

  // ─── Hook Registration ──────────────────────────────────────────────────

  addFilter<T = unknown>(
    hookName: string,
    handler: HookHandler<T>,
    priority: number = 10
  ): ID {
    return this.hookSystem.addFilter<T>(hookName, handler, priority, this.pluginId);
  }

  addAction<T = unknown>(
    hookName: string,
    handler: HookHandler<T>,
    priority: number = 10
  ): ID {
    return this.hookSystem.addAction<T>(hookName, handler, priority, this.pluginId);
  }

  removeHook(hookId: ID): boolean {
    return this.hookSystem.removeHook(hookId);
  }

  // ─── Inter-Plugin Communication ─────────────────────────────────────────

  emit(event: string, data?: JSONValue): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      for (const handler of handlers.values()) {
        try {
          handler(data ?? null);
        } catch (error) {
          console.error(`[PluginAPI] Error in event handler for "${event}":`, error);
        }
      }
    }
  }

  on(event: string, handler: (data: JSONValue) => void): ID {
    const id = nanoid();
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Map());
    }
    this.eventHandlers.get(event)!.set(id, handler);
    return id;
  }

  off(subscriptionId: ID): boolean {
    for (const handlers of this.eventHandlers.values()) {
      if (handlers.delete(subscriptionId)) {
        return true;
      }
    }
    return false;
  }

  // ─── Configuration ──────────────────────────────────────────────────────

  getConfig(): Record<string, JSONValue> {
    return { ...this.config };
  }

  setConfig(config: Record<string, JSONValue>): void {
    this.config = { ...this.config, ...config };
  }

  // ─── Logging ────────────────────────────────────────────────────────────

  log(level: 'debug' | 'info' | 'warn' | 'error', message: string, ...args: unknown[]): void {
    const prefix = `[Plugin:${this.pluginId}]`;
    switch (level) {
      case 'debug':
        console.debug(prefix, message, ...args);
        break;
      case 'info':
        console.info(prefix, message, ...args);
        break;
      case 'warn':
        console.warn(prefix, message, ...args);
        break;
      case 'error':
        console.error(prefix, message, ...args);
        break;
    }
  }

  // ─── Plugin Management ──────────────────────────────────────────────────

  getPlugin(pluginId: ID): PluginRegistration | undefined {
    if (!this.pluginRegistry) return undefined;
    return this.pluginRegistry.get(pluginId);
  }

  listPlugins(): PluginRegistration[] {
    if (!this.pluginRegistry) return [];
    return Array.from(this.pluginRegistry.values());
  }

  getDependencies(): PluginDependency[] {
    return this.manifest.dependencies ?? [];
  }
}

// ─── API Factory ─────────────────────────────────────────────────────────────

export function createPluginAPI(
  manifest: PluginManifest,
  hookSystem: HookSystem,
  config?: Record<string, JSONValue>
): PluginAPI {
  return new PluginAPIImpl(manifest, hookSystem, config);
}