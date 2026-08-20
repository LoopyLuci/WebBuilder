// ============================================================================
// WebBuilder Core — Hook System
// A priority-based filter/action hook system for plugin extensibility
// ============================================================================

import { nanoid } from 'nanoid';
import type {
  HookContext,
  HookExecuteResult,
  HookHandler,
  HookRegistration,
  HookType,
  ID,
} from './types.js';

// ─── Hook System ─────────────────────────────────────────────────────────────

export class HookSystem {
  private hooks: Map<string, HookRegistration[]>;
  private hookCount: number;

  constructor() {
    this.hooks = new Map();
    this.hookCount = 0;
  }

  // ─── Registration ──────────────────────────────────────────────────────

  /**
   * Add a filter hook — handlers transform and return the value
   */
  addFilter<T = unknown>(
    hookName: string,
    handler: HookHandler<T>,
    priority: number = 10,
    pluginId: ID = 'system'
  ): ID {
    return this.register<T>(hookName, handler, priority, 'filter', pluginId);
  }

  /**
   * Add an action hook — handlers execute side effects
   */
  addAction<T = unknown>(
    hookName: string,
    handler: HookHandler<T>,
    priority: number = 10,
    pluginId: ID = 'system'
  ): ID {
    return this.register<T>(hookName, handler, priority, 'action', pluginId);
  }

  /**
   * Register a hook handler
   */
  private register<T>(
    hookName: string,
    handler: HookHandler<T>,
    priority: number,
    type: HookType,
    pluginId: ID
  ): ID {
    const id = nanoid();

    const registration: HookRegistration<T> = {
      id,
      pluginId,
      hookName,
      handler,
      priority,
      type,
    };

    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, []);
    }

    const hooksForName = this.hooks.get(hookName)!;
    hooksForName.push(registration as HookRegistration<unknown>);

    // Sort by priority (lower number = higher priority = runs first)
    hooksForName.sort((a, b) => a.priority - b.priority);

    this.hookCount++;
    return id;
  }

  /**
   * Remove a specific hook by ID
   */
  removeHook(hookId: ID): boolean {
    for (const [hookName, registrations] of this.hooks.entries()) {
      const index = registrations.findIndex((r) => r.id === hookId);
      if (index !== -1) {
        registrations.splice(index, 1);
        this.hookCount--;

        // Clean up empty hook lists
        if (registrations.length === 0) {
          this.hooks.delete(hookName);
        }
        return true;
      }
    }
    return false;
  }

  /**
   * Remove all hooks registered by a specific plugin
   */
  removePluginHooks(pluginId: ID): number {
    let removed = 0;

    for (const [hookName, registrations] of this.hooks.entries()) {
      const before = registrations.length;
      const filtered = registrations.filter((r) => r.pluginId !== pluginId);
      removed += before - filtered.length;

      if (filtered.length === 0) {
        this.hooks.delete(hookName);
      } else {
        this.hooks.set(hookName, filtered);
      }
    }

    this.hookCount -= removed;
    return removed;
  }

  /**
   * Check if any handlers exist for a hook
   */
  hasHook(hookName: string): boolean {
    return this.hooks.has(hookName) && this.hooks.get(hookName)!.length > 0;
  }

  /**
   * Get all registrations for a hook
   */
  getHooks(hookName: string): HookRegistration[] {
    return this.hooks.get(hookName) ?? [];
  }

  // ─── Execution ─────────────────────────────────────────────────────────

  /**
   * Apply filter hooks — each handler transforms the value sequentially
   */
  async applyFilters<T = unknown>(
    hookName: string,
    initialValue: T,
    metadata?: Record<string, unknown>
  ): Promise<HookExecuteResult<T>> {
    const startTime = Date.now();
    const registrations = this.hooks.get(hookName) ?? [];
    const filters = registrations.filter((r) => r.type === 'filter');
    const modifiedBy: ID[] = [];
    let value = initialValue;

    const context: HookContext = {
      pluginId: 'system',
      hookName,
      timestamp: new Date().toISOString(),
      metadata: metadata as Record<string, unknown>,
    };

    for (const registration of filters) {
      try {
        context.pluginId = registration.pluginId;
        const result = await registration.handler(value, context);

        // Filter handlers may modify the value
        if (result !== undefined) {
          if (registration.type === 'filter') {
            value = result as T;
            modifiedBy.push(registration.pluginId);
          }
        }
      } catch (error) {
        // Log but continue with next filter
        console.error(
          `[HookSystem] Error in filter "${hookName}" from plugin "${registration.pluginId}":`,
          error
        );
      }
    }

    return {
      value,
      modifiedBy,
      duration: Date.now() - startTime,
    };
  }

  /**
   * Execute action hooks — each handler runs sequentially
   */
  async doAction<T = unknown>(
    hookName: string,
    value: T,
    metadata?: Record<string, unknown>
  ): Promise<HookExecuteResult<T>> {
    const startTime = Date.now();
    const registrations = this.hooks.get(hookName) ?? [];
    const actions = registrations.filter((r) => r.type === 'action');
    const modifiedBy: ID[] = [];

    const context: HookContext = {
      pluginId: 'system',
      hookName,
      timestamp: new Date().toISOString(),
      metadata: metadata as Record<string, unknown>,
    };

    for (const registration of actions) {
      try {
        context.pluginId = registration.pluginId;
        await registration.handler(value, context);
        modifiedBy.push(registration.pluginId);
      } catch (error) {
        // Log but continue with next action
        console.error(
          `[HookSystem] Error in action "${hookName}" from plugin "${registration.pluginId}":`,
          error
        );
      }
    }

    return {
      value,
      modifiedBy,
      duration: Date.now() - startTime,
    };
  }

  /**
   * Apply filters synchronously
   */
  applyFiltersSync<T = unknown>(
    hookName: string,
    initialValue: T,
    metadata?: Record<string, unknown>
  ): HookExecuteResult<T> {
    const startTime = Date.now();
    const registrations = this.hooks.get(hookName) ?? [];
    const filters = registrations.filter((r) => r.type === 'filter');
    const modifiedBy: ID[] = [];
    let value = initialValue;

    const context: HookContext = {
      pluginId: 'system',
      hookName,
      timestamp: new Date().toISOString(),
      metadata: metadata as Record<string, unknown>,
    };

    for (const registration of filters) {
      try {
        context.pluginId = registration.pluginId;
        const result = (registration.handler as (value: T, context: HookContext) => T)(
          value,
          context
        );

        if (result !== undefined) {
          value = result as T;
          modifiedBy.push(registration.pluginId);
        }
      } catch (error) {
        console.error(
          `[HookSystem] Error in filter "${hookName}" from plugin "${registration.pluginId}":`,
          error
        );
      }
    }

    return {
      value,
      modifiedBy,
      duration: Date.now() - startTime,
    };
  }

  /**
   * Execute action hooks synchronously
   */
  doActionSync<T = unknown>(
    hookName: string,
    value: T,
    metadata?: Record<string, unknown>
  ): HookExecuteResult<T> {
    const startTime = Date.now();
    const registrations = this.hooks.get(hookName) ?? [];
    const actions = registrations.filter((r) => r.type === 'action');
    const modifiedBy: ID[] = [];

    const context: HookContext = {
      pluginId: 'system',
      hookName,
      timestamp: new Date().toISOString(),
      metadata: metadata as Record<string, unknown>,
    };

    for (const registration of actions) {
      try {
        context.pluginId = registration.pluginId;
        (registration.handler as (value: T, context: HookContext) => void)(value, context);
        modifiedBy.push(registration.pluginId);
      } catch (error) {
        console.error(
          `[HookSystem] Error in action "${hookName}" from plugin "${registration.pluginId}":`,
          error
        );
      }
    }

    return {
      value,
      modifiedBy,
      duration: Date.now() - startTime,
    };
  }

  // ─── Introspection ─────────────────────────────────────────────────────

  /**
   * List all registered hook names
   */
  getRegisteredHooks(): string[] {
    return Array.from(this.hooks.keys());
  }

  /**
   * Get hook count
   */
  getHookCount(): number {
    return this.hookCount;
  }

  /**
   * Clear all hooks
   */
  clear(): void {
    this.hooks.clear();
    this.hookCount = 0;
  }

  /**
   * Get all hooks for a specific plugin
   */
  getPluginHooks(pluginId: ID): HookRegistration[] {
    const result: HookRegistration[] = [];
    for (const registrations of this.hooks.values()) {
      for (const registration of registrations) {
        if (registration.pluginId === pluginId) {
          result.push(registration);
        }
      }
    }
    return result;
  }
}

// ─── Singleton ───────────────────────────────────────────────────────────────

let globalHookSystem: HookSystem | null = null;

export function getHookSystem(): HookSystem {
  if (!globalHookSystem) {
    globalHookSystem = new HookSystem();
  }
  return globalHookSystem;
}

export function createHookSystem(): HookSystem {
  return new HookSystem();
}