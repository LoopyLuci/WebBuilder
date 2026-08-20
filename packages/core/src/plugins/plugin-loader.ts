// ============================================================================
// WebBuilder Core — Plugin Loader
// Loads plugins from filesystem with hot-reload and sandboxed execution
// ============================================================================

import { nanoid } from 'nanoid';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as vm from 'node:vm';
import * as crypto from 'node:crypto';
import { createRequire } from 'node:module';
import type {
  ID,
  LoaderEventHandler,
  LoaderEvent,
  LoaderOptions,
  PluginInstance,
  PluginManifest,
  ValidationResult,
} from './types.js';
import { z } from 'zod';

// ─── Manifest Schema (Zod validation) ────────────────────────────────────────

const ManifestSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9][a-z0-9-_]*$/i),
  name: z.string().min(1),
  version: z.string().min(1),
  description: z.string().default(''),
  author: z.string().default(''),
  type: z.enum(['component', 'generator', 'exporter', 'tool', 'theme', 'integration']),
  main: z.string().min(1),
  icon: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  permissions: z.array(z.string()).optional(),
  dependencies: z.array(z.object({
    id: z.string(),
    versionRange: z.string(),
    optional: z.boolean().optional(),
  })).optional(),
  hooks: z.array(z.string()).optional(),
  extensionPoints: z.array(z.string()).optional(),
  configSchema: z.record(z.unknown()).optional(),
  minPlatformVersion: z.string().optional(),
  homepage: z.string().optional(),
  repository: z.string().optional(),
  license: z.string().optional(),
});

// ─── Default Loader Options ──────────────────────────────────────────────────

const DEFAULT_LOADER_OPTIONS: LoaderOptions = {
  hotReload: true,
  sandbox: true,
  watchDebounce: 500,
  maxMemoryMB: 64,
  timeout: 5000,
  allowedModules: ['path', 'url', 'util', 'crypto', 'querystring'],
};

// ─── Plugin Loader ───────────────────────────────────────────────────────────

export class PluginLoader {
  private options: LoaderOptions;
  private watchers: Map<ID, fs.FSWatcher>;
  private pluginPaths: Map<ID, string>;
  private debounceTimers: Map<ID, ReturnType<typeof setTimeout>>;
  private eventHandlers: LoaderEventHandler[];
  private sandboxContext: vm.Context | null;
  private loadedModules: Map<ID, { hash: string; module: PluginInstance }>;

  constructor(options?: Partial<LoaderOptions>) {
    this.options = { ...DEFAULT_LOADER_OPTIONS, ...options };
    this.watchers = new Map();
    this.pluginPaths = new Map();
    this.debounceTimers = new Map();
    this.eventHandlers = [];
    this.sandboxContext = null;
    this.loadedModules = new Map();
  }

  // ─── Event Handling ─────────────────────────────────────────────────────

  /**
   * Register an event handler
   */
  on(handler: LoaderEventHandler): () => void {
    this.eventHandlers.push(handler);
    return () => {
      const index = this.eventHandlers.indexOf(handler);
      if (index !== -1) this.eventHandlers.splice(index, 1);
    };
  }

  /**
   * Emit a loader event
   */
  private emit(event: LoaderEvent): void {
    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch (error) {
        console.error('[Loader] Event handler error:', error);
      }
    }
  }

  // ─── Loading ────────────────────────────────────────────────────────────

  /**
   * Load a plugin from a directory path
   */
  async loadFromDirectory(pluginDir: string): Promise<{ manifest: PluginManifest; instance: PluginInstance } | null> {
    try {
      // Read manifest
      const manifestPath = path.join(pluginDir, 'plugin.json');
      if (!fs.existsSync(manifestPath)) {
        this.emit({
          type: 'error',
          pluginId: 'unknown',
          timestamp: new Date().toISOString(),
          error: `plugin.json not found in ${pluginDir}`,
          path: pluginDir,
        });
        return null;
      }

      const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
      const manifestData = JSON.parse(manifestContent);

      // Validate manifest
      const parseResult = ManifestSchema.safeParse(manifestData);
      if (!parseResult.success) {
        this.emit({
          type: 'error',
          pluginId: manifestData.id || 'unknown',
          timestamp: new Date().toISOString(),
          error: `Invalid manifest: ${parseResult.error.message}`,
          path: pluginDir,
        });
        return null;
      }

      const manifest: PluginManifest = parseResult.data as PluginManifest;

      // Load the main module
      const mainPath = path.join(pluginDir, manifest.main);
      if (!fs.existsSync(mainPath)) {
        this.emit({
          type: 'error',
          pluginId: manifest.id,
          timestamp: new Date().toISOString(),
          error: `Main entry not found: ${mainPath}`,
          path: pluginDir,
        });
        return null;
      }

      const instance = await this.loadModule(mainPath, manifest.id);

      // Track for hot-reload
      this.pluginPaths.set(manifest.id, pluginDir);

      // Setup hot-reload watcher
      if (this.options.hotReload) {
        this.setupWatcher(manifest.id, pluginDir);
      }

      this.emit({
        type: 'loaded',
        pluginId: manifest.id,
        timestamp: new Date().toISOString(),
        path: pluginDir,
      });

      return { manifest, instance };
    } catch (error) {
      this.emit({
        type: 'error',
        pluginId: 'unknown',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
        path: pluginDir,
      });
      return null;
    }
  }

  /**
   * Load a plugin from a file path (single-file plugin)
   */
  async loadFromFile(filePath: string): Promise<{ manifest: PluginManifest; instance: PluginInstance } | null> {
    try {
      if (!fs.existsSync(filePath)) {
        this.emit({
          type: 'error',
          pluginId: 'unknown',
          timestamp: new Date().toISOString(),
          error: `File not found: ${filePath}`,
          path: filePath,
        });
        return null;
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);

      // Check if it's a manifest or a module
      if (data.manifest && data.code) {
        // Single-file plugin format
        const parseResult = ManifestSchema.safeParse(data.manifest);
        if (!parseResult.success) {
          this.emit({
            type: 'error',
            pluginId: data.manifest.id || 'unknown',
            timestamp: new Date().toISOString(),
            error: `Invalid manifest: ${parseResult.error.message}`,
            path: filePath,
          });
          return null;
        }

        const manifest: PluginManifest = parseResult.data as PluginManifest;
        const instance = this.evaluateModule(data.code, manifest.id);

        this.pluginPaths.set(manifest.id, filePath);

        if (this.options.hotReload) {
          this.setupFileWatcher(manifest.id, filePath);
        }

        this.emit({
          type: 'loaded',
          pluginId: manifest.id,
          timestamp: new Date().toISOString(),
          path: filePath,
        });

        return { manifest, instance };
      }

      this.emit({
        type: 'error',
        pluginId: 'unknown',
        timestamp: new Date().toISOString(),
        error: 'File does not contain a valid plugin format',
        path: filePath,
      });
      return null;
    } catch (error) {
      this.emit({
        type: 'error',
        pluginId: 'unknown',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
        path: filePath,
      });
      return null;
    }
  }

  /**
   * Load a plugin module (programmatic registration)
   */
  loadFromObject(
    manifest: PluginManifest,
    instance: PluginInstance
  ): { manifest: PluginManifest; instance: PluginInstance } {
    return { manifest, instance };
  }

  /**
   * Load and evaluate a module
   */
  private async loadModule(modulePath: string, pluginId: ID): Promise<PluginInstance> {
    const content = fs.readFileSync(modulePath, 'utf-8');
    const hash = crypto.createHash('sha256').update(content).digest('hex');

    // Check if unchanged (for hot-reload)
    const cached = this.loadedModules.get(pluginId);
    if (cached && cached.hash === hash) {
      return cached.module;
    }

    let instance: PluginInstance;

    if (this.options.sandbox) {
      instance = this.evaluateInSandbox(content, modulePath, pluginId);
    } else {
      instance = this.evaluateModule(content, pluginId);
    }

    this.loadedModules.set(pluginId, { hash, module: instance });
    return instance;
  }

  /**
   * Evaluate a module in a sandboxed VM context
   */
  private evaluateInSandbox(code: string, modulePath: string, pluginId: ID): PluginInstance {
    // Create sandbox context with limited globals
    const sandbox: Record<string, unknown> = {
      console: {
        log: (...args: unknown[]) => console.log(`[${pluginId}]`, ...args),
        info: (...args: unknown[]) => console.info(`[${pluginId}]`, ...args),
        warn: (...args: unknown[]) => console.warn(`[${pluginId}]`, ...args),
        error: (...args: unknown[]) => console.error(`[${pluginId}]`, ...args),
        debug: (...args: unknown[]) => console.debug(`[${pluginId}]`, ...args),
      },
      setTimeout: (fn: () => void, ms: number) => setTimeout(fn, Math.min(ms, 30000)),
      clearTimeout: (id: ReturnType<typeof setTimeout>) => clearTimeout(id),
      setInterval: () => {
        throw new Error('setInterval is not allowed in sandboxed plugins');
      },
      clearInterval: () => {},
      Math,
      JSON,
      Date,
      Array,
      Object,
      String,
      Number,
      Boolean,
      Promise,
      Error,
      TypeError,
      Map,
      Set,
      Symbol,
      RegExp,
      parseInt,
      parseFloat,
      isNaN,
      isFinite,
    };

    // Add allowed Node modules
    if (this.options.allowedModules) {
      const requireFn = createRequire(import.meta.url);
      for (const modName of this.options.allowedModules) {
        try {
          if (modName === 'path') {
            sandbox.path = path;
          } else if (modName === 'url') {
            sandbox.url = requireFn('node:url');
          } else if (modName === 'util') {
            sandbox.util = requireFn('node:util');
          } else if (modName === 'crypto') {
            sandbox.crypto = crypto;
          }
        } catch {
          // Module not available, skip
        }
      }
    }

    // Plugin-specific exports
    sandbox.module = { exports: {} };
    sandbox.exports = sandbox.module.exports;
    sandbox.__pluginId = pluginId;

    // Create VM context
    vm.createContext(sandbox);

    // Wrap code in module wrapper
    const wrappedCode = `
      (function(exports, require, module, __filename, __dirname) {
        ${code}
      })
    `;

    try {
      const script = new vm.Script(wrappedCode, {
        filename: modulePath,
        timeout: this.options.timeout,
      });

      const moduleFactory = script.runInContext(sandbox, {
        timeout: this.options.timeout,
      });

      // Execute module factory
      const moduleExports = { default: undefined };
      const fakeRequire = (mod: string) => {
        if (sandbox[mod]) return sandbox[mod];
        throw new Error(`Module "${mod}" is not available in sandbox`);
      };

      moduleFactory(moduleExports, fakeRequire, sandbox.module, modulePath, path.dirname(modulePath));

      const result = sandbox.module.exports || moduleExports;

      // Extract plugin instance
      if (result.default) {
        return typeof result.default === 'function' ? result.default() : result.default;
      }
      if (result.activate || result.init || result.deactivate) {
        return result as PluginInstance;
      }

      // If exports has plugin lifecycle methods
      const pluginInstance = result as unknown as PluginInstance;
      if (!pluginInstance.init && !pluginInstance.activate) {
        throw new Error('Plugin must export init or activate function');
      }

      return pluginInstance;
    } catch (error) {
      throw new Error(`Sandbox evaluation error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Evaluate a module without sandboxing (less secure, for trusted plugins)
   */
  private evaluateModule(code: string, pluginId: ID): PluginInstance {
    // Use dynamic import for ESM modules
    // For CJS-style code, wrap and evaluate
    const moduleWrapper = `
      (function() {
        const module = { exports: {} };
        const exports = module.exports;
        ${code}
        return module.exports;
      })()
    `;

    try {
      // Use Function constructor for trusted code
      const factory = new Function('return ' + moduleWrapper);
      const result = factory();

      if (result.default) {
        return typeof result.default === 'function' ? result.default() : result.default;
      }

      return result as PluginInstance;
    } catch (error) {
      throw new Error(`Module evaluation error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // ─── Hot Reload ─────────────────────────────────────────────────────────

  /**
   * Setup a directory watcher for hot-reload
   */
  private setupWatcher(pluginId: ID, pluginDir: string): void {
    // Clean up existing watcher
    this.removeWatcher(pluginId);

    const watcher = fs.watch(pluginDir, { recursive: true }, (eventType, filename) => {
      if (!filename) return;

      // Debounce
      const existing = this.debounceTimers.get(pluginId);
      if (existing) clearTimeout(existing);

      const timer = setTimeout(() => {
        this.debounceTimers.delete(pluginId);
        this.handleFileChange(pluginId, pluginDir);
      }, this.options.watchDebounce);

      this.debounceTimers.set(pluginId, timer);
    });

    this.watchers.set(pluginId, watcher);
  }

  /**
   * Setup a file watcher for single-file plugins
   */
  private setupFileWatcher(pluginId: ID, filePath: string): void {
    this.removeWatcher(pluginId);

    const watcher = fs.watch(filePath, (eventType) => {
      const existing = this.debounceTimers.get(pluginId);
      if (existing) clearTimeout(existing);

      const timer = setTimeout(() => {
        this.debounceTimers.delete(pluginId);
        this.reloadPlugin(pluginId);
      }, this.options.watchDebounce);

      this.debounceTimers.set(pluginId, timer);
    });

    this.watchers.set(pluginId, watcher);
  }

  /**
   * Handle file change for hot-reload
   */
  private async handleFileChange(pluginId: ID, pluginDir: string): Promise<void> {
    const manifestPath = path.join(pluginDir, 'plugin.json');

    // Reload manifest and module
    if (fs.existsSync(manifestPath)) {
      try {
        const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
        const manifestData = JSON.parse(manifestContent);

        const parseResult = ManifestSchema.safeParse(manifestData);
        if (parseResult.success) {
          const manifest: PluginManifest = parseResult.data as PluginManifest;
          const mainPath = path.join(pluginDir, manifest.main);

          if (fs.existsSync(mainPath)) {
            await this.loadModule(mainPath, pluginId);

            this.emit({
              type: 'reloaded',
              pluginId,
              timestamp: new Date().toISOString(),
              path: pluginDir,
            });
          }
        }
      } catch (error) {
        this.emit({
          type: 'error',
          pluginId,
          timestamp: new Date().toISOString(),
          error: `Hot-reload failed: ${error instanceof Error ? error.message : String(error)}`,
          path: pluginDir,
        });
      }
    }
  }

  /**
   * Manually trigger a plugin reload
   */
  async reloadPlugin(pluginId: ID): Promise<boolean> {
    const pluginPath = this.pluginPaths.get(pluginId);
    if (!pluginPath) return false;

    try {
      if (fs.statSync(pluginPath).isDirectory()) {
        await this.loadFromDirectory(pluginPath);
      } else {
        await this.loadFromFile(pluginPath);
      }

      this.emit({
        type: 'reloaded',
        pluginId,
        timestamp: new Date().toISOString(),
        path: pluginPath,
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Remove a file watcher
   */
  private removeWatcher(pluginId: ID): void {
    const watcher = this.watchers.get(pluginId);
    if (watcher) {
      watcher.close();
      this.watchers.delete(pluginId);
    }
  }

  // ─── Manifest Validation ────────────────────────────────────────────────

  /**
   * Validate a plugin manifest object
   */
  validateManifest(manifest: unknown): ValidationResult {
    const parseResult = ManifestSchema.safeParse(manifest);

    if (parseResult.success) {
      return { valid: true, errors: [], warnings: [] };
    }

    const errors = parseResult.error.issues.map(
      (issue) => `${issue.path.join('.')}: ${issue.message}`
    );

    return { valid: false, errors, warnings: [] };
  }

  /**
   * Load and validate manifest from a JSON string
   */
  parseManifest(jsonString: string): PluginManifest | null {
    try {
      const data = JSON.parse(jsonString);
      const parseResult = ManifestSchema.safeParse(data);

      if (parseResult.success) {
        return parseResult.data as PluginManifest;
      }

      console.error('[Loader] Manifest validation failed:', parseResult.error.issues);
      return null;
    } catch {
      console.error('[Loader] Invalid JSON in manifest');
      return null;
    }
  }

  // ─── Cleanup ────────────────────────────────────────────────────────────

  /**
   * Unload a plugin and cleanup resources
   */
  unload(pluginId: ID): boolean {
    this.removeWatcher(pluginId);

    const timer = this.debounceTimers.get(pluginId);
    if (timer) {
      clearTimeout(timer);
      this.debounceTimers.delete(pluginId);
    }

    this.pluginPaths.delete(pluginId);
    this.loadedModules.delete(pluginId);

    this.emit({
      type: 'unloaded',
      pluginId,
      timestamp: new Date().toISOString(),
    });

    return true;
  }

  /**
   * Cleanup all watchers and timers
   */
  destroy(): void {
    for (const watcher of this.watchers.values()) {
      watcher.close();
    }
    this.watchers.clear();

    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();

    this.pluginPaths.clear();
    this.loadedModules.clear();
    this.eventHandlers = [];
  }

  // ─── Introspection ──────────────────────────────────────────────────────

  /**
   * Get loaded plugin IDs
   */
  getLoadedPlugins(): ID[] {
    return Array.from(this.pluginPaths.keys());
  }

  /**
   * Get plugin path
   */
  getPluginPath(pluginId: ID): string | undefined {
    return this.pluginPaths.get(pluginId);
  }
}

// ─── Factory ─────────────────────────────────────────────────────────────────

export function createPluginLoader(options?: Partial<LoaderOptions>): PluginLoader {
  return new PluginLoader(options);
}