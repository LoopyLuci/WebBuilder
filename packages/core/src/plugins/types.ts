// ============================================================================
// WebBuilder Core — Plugin System Types
// Type definitions for the extensible plugin architecture
// ============================================================================

import type {
  Component,
  ComponentSpec,
  DesignSystem,
  DesignTokens,
  FileChange,
  Framework,
  ID,
  JSONValue,
  ProjectSpec,
  Theme,
} from '../types/index.js';

// ─── Plugin Manifest ─────────────────────────────────────────────────────────

export type PluginType = 'component' | 'generator' | 'exporter' | 'tool' | 'theme' | 'integration';

export type PluginPermission =
  | 'filesystem:read'
  | 'filesystem:write'
  | 'network:fetch'
  | 'network:websocket'
  | 'ui:render'
  | 'ui:panel'
  | 'codegen:modify'
  | 'deploy:hook'
  | 'design:modify'
  | 'registry:register';

export interface PluginDependency {
  id: string;
  versionRange: string;
  optional?: boolean;
}

export interface PluginManifest {
  id: ID;
  name: string;
  version: string;
  description: string;
  author: string;
  type: PluginType;
  main: string;
  icon?: string;
  keywords?: string[];
  permissions?: PluginPermission[];
  dependencies?: PluginDependency[];
  hooks?: string[];
  extensionPoints?: string[];
  configSchema?: Record<string, JSONValue>;
  minPlatformVersion?: string;
  homepage?: string;
  repository?: string;
  license?: string;
}

// ─── Plugin Interface ────────────────────────────────────────────────────────

export type PluginState = 'registered' | 'loaded' | 'active' | 'inactive' | 'error';

export interface Plugin {
  manifest: PluginManifest;
  state: PluginState;
  instance?: PluginInstance;
  error?: string;
  loadedAt?: string;
  activatedAt?: string;
}

export interface PluginInstance {
  init?: (api: PluginAPI) => Promise<void> | void;
  activate?: (api: PluginAPI) => Promise<void> | void;
  deactivate?: (api: PluginAPI) => Promise<void> | void;
  destroy?: (api: PluginAPI) => Promise<void> | void;
  onConfigChange?: (config: Record<string, JSONValue>, api: PluginAPI) => Promise<void> | void;
  [key: string]: unknown;
}

export interface PluginModule {
  default: PluginInstance | (() => PluginInstance);
}

// ─── Hook System ─────────────────────────────────────────────────────────────

export type HookType = 'filter' | 'action';

export interface HookRegistration<T = unknown> {
  id: ID;
  pluginId: ID;
  hookName: string;
  handler: HookHandler<T>;
  priority: number;
  type: HookType;
}

export type HookHandler<T = unknown> = (
  value: T,
  context: HookContext
) => T | Promise<T> | void | Promise<void>;

export interface HookContext {
  pluginId: ID;
  hookName: string;
  timestamp: string;
  metadata?: Record<string, JSONValue>;
}

export interface HookExecuteResult<T = unknown> {
  value: T;
  modifiedBy: ID[];
  duration: number;
}

// ─── Plugin API ──────────────────────────────────────────────────────────────

export interface ComponentRegistration {
  component: Component;
  frameworkOverrides?: Partial<Record<Framework, Component['implementations'][Framework]>>;
}

export interface GeneratorRegistration {
  name: string;
  description: string;
  trigger: 'manual' | 'auto' | 'event';
  generate: (spec: ProjectSpec, options?: Record<string, JSONValue>) => Promise<FileChange[]>;
}

export interface ExporterRegistration {
  name: string;
  format: string;
  description: string;
  export: (spec: ProjectSpec, options?: Record<string, JSONValue>) => Promise<string>;
}

export interface ToolRegistration {
  name: string;
  description: string;
  icon?: string;
  category: 'analysis' | 'transformation' | 'validation' | 'utility';
  execute: (input: JSONValue, options?: Record<string, JSONValue>) => Promise<JSONValue>;
}

export interface PluginAPI {
  readonly pluginId: ID;
  readonly manifest: PluginManifest;
  readonly permissions: PluginPermission[];

  // Permission check
  hasPermission(permission: PluginPermission): boolean;
  requestPermission(permission: PluginPermission): boolean;

  // Component extension
  registerComponent(registration: ComponentRegistration): void;
  unregisterComponent(componentId: ID): boolean;
  getComponents(): Component[];
  getComponent(componentId: ID): Component | undefined;

  // Generator extension
  registerGenerator(registration: GeneratorRegistration): void;
  unregisterGenerator(name: string): boolean;
  getGenerators(): GeneratorRegistration[];

  // Exporter extension
  registerExporter(registration: ExporterRegistration): void;
  unregisterExporter(name: string): boolean;
  getExporters(): ExporterRegistration[];

  // Tool extension
  registerTool(registration: ToolRegistration): void;
  unregisterTool(name: string): boolean;
  getTools(): ToolRegistration[];

  // Theme extension
  registerTheme(theme: Theme): void;
  unregisterTheme(themeId: ID): boolean;
  updateDesignTokens(tokens: Partial<DesignTokens>): void;

  // Hook registration
  addFilter<T = unknown>(
    hookName: string,
    handler: HookHandler<T>,
    priority?: number
  ): ID;
  addAction<T = unknown>(
    hookName: string,
    handler: HookHandler<T>,
    priority?: number
  ): ID;
  removeHook(hookId: ID): boolean;

  // Inter-plugin communication
  emit(event: string, data?: JSONValue): void;
  on(event: string, handler: (data: JSONValue) => void): ID;
  off(subscriptionId: ID): boolean;

  // Configuration
  getConfig(): Record<string, JSONValue>;
  setConfig(config: Record<string, JSONValue>): void;

  // Logging
  log(level: 'debug' | 'info' | 'warn' | 'error', message: string, ...args: unknown[]): void;

  // Plugin management
  getPlugin(pluginId: ID): Plugin | undefined;
  listPlugins(): Plugin[];
  getDependencies(): PluginDependency[];
}

// ─── Loader Types ────────────────────────────────────────────────────────────

export interface LoaderOptions {
  hotReload: boolean;
  sandbox: boolean;
  watchDebounce: number;
  maxMemoryMB: number;
  allowedModules?: string[];
  timeout: number;
}

export interface LoaderEvent {
  type: 'loaded' | 'unloaded' | 'reloaded' | 'error' | 'changed';
  pluginId: ID;
  timestamp: string;
  error?: string;
  path?: string;
}

export type LoaderEventHandler = (event: LoaderEvent) => void;

// ─── Registry Types ──────────────────────────────────────────────────────────

export interface RegistryOptions {
  autoActivate: boolean;
  resolveDependencies: boolean;
  allowDuplicates: boolean;
  maxPlugins: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ─── Extension Points ────────────────────────────────────────────────────────

export const EXTENSION_POINTS = {
  PRE_GENERATE: 'codegen:pre-generate',
  POST_GENERATE: 'codegen:post-generate',
  PRE_DEPLOY: 'deploy:pre-deploy',
  POST_DEPLOY: 'deploy:post-deploy',
  PRE_DESIGN: 'design:pre-design',
  POST_DESIGN: 'design:post-design',
  COMPONENT_RENDER: 'component:render',
  COMPONENT_TRANSFORM: 'component:transform',
  PROJECT_SAVE: 'project:save',
  PROJECT_LOAD: 'project:load',
  PAGE_GENERATE: 'page:generate',
  FILE_WRITE: 'file:write',
  FILE_READ: 'file:read',
} as const;

export type ExtensionPoint = (typeof EXTENSION_POINTS)[keyof typeof EXTENSION_POINTS];

// ─── Built-in Hook Names ────────────────────────────────────────────────────

export const HOOKS = {
  // Project lifecycle
  PROJECT_INIT: 'project:init',
  PROJECT_READY: 'project:ready',
  PROJECT_CLOSE: 'project:close',

  // Code generation
  CODEGEN_START: 'codegen:start',
  CODEGEN_PAGE: 'codegen:page',
  CODEGEN_COMPLETE: 'codegen:complete',

  // Deployment
  DEPLOY_PREPARE: 'deploy:prepare',
  DEPLOY_START: 'deploy:start',
  DEPLOY_COMPLETE: 'deploy:complete',
  DEPLOY_FAILED: 'deploy:failed',

  // Design
  DESIGN_TOKENS: 'design:tokens',
  DESIGN_THEME: 'design:theme',
  DESIGN_COMPONENT: 'design:component',

  // Component
  COMPONENT_REGISTER: 'component:register',
  COMPONENT_GENERATE: 'component:generate',

  // File operations
  FILE_PRE_WRITE: 'file:pre-write',
  FILE_POST_WRITE: 'file:post-write',
} as const;