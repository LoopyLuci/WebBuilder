// ============================================================================
// Context Manager Module
// Maintains full project context across sessions, agents, and time
// ============================================================================

import { nanoid } from 'nanoid';
import type {
  ProjectContext,
  ProjectSpec,
  ContextSnapshot,
  AgentContext,
  ExternalResource,
  UserPreferenceModel,
  Session,
  ChangeSet,
  FileChange,
  ID,
  Timestamp,
  AgentContribution,
} from '../types/index.js';

// ─── Context Manager ────────────────────────────────────────────────────────

export class ContextManager {
  private context: ProjectContext;
  private maxHistorySize: number;
  private listeners: Map<string, Set<(event: ContextEvent) => void>>;

  constructor(spec: ProjectSpec, maxHistorySize = 100) {
    this.maxHistorySize = maxHistorySize;
    this.listeners = new Map();
    this.context = this.createInitialContext(spec);
  }

  // ─── Core Operations ──────────────────────────────────────────────────

  /**
   * Get the full project context
   */
  getContext(): ProjectContext {
    return this.context;
  }

  /**
   * Get the current project spec
   */
  getCurrentSpec(): ProjectSpec {
    return this.context.currentState;
  }

  /**
   * Update the project spec with a new version
   */
  updateSpec(updates: Partial<ProjectSpec>, agentId?: ID, description?: string): void {
    const previousSpec = this.context.currentState;
    const newSpec = { ...previousSpec, ...updates, metadata: { ...previousSpec.metadata, updatedAt: new Date().toISOString() } };

    // Create snapshot before updating
    this.addSnapshot(previousSpec, {
      id: nanoid(),
      timestamp: new Date().toISOString(),
      author: agentId ?? 'user',
      description: description ?? 'Project update',
      files: this.generateFileChanges(previousSpec, newSpec),
      type: 'update',
    });

    this.context.currentState = newSpec;
    this.emit('spec:updated', { previousSpec, newSpec, agentId });
  }

  /**
   * Replace the entire spec (use with caution)
   */
  replaceSpec(newSpec: ProjectSpec, agentId?: ID, description?: string): void {
    const previousSpec = this.context.currentState;
    this.addSnapshot(previousSpec, {
      id: nanoid(),
      timestamp: new Date().toISOString(),
      author: agentId ?? 'user',
      description: description ?? 'Full spec replacement',
      files: this.generateFileChanges(previousSpec, newSpec),
      type: 'update',
    });

    this.context.currentState = newSpec;
    this.emit('spec:replaced', { previousSpec, newSpec, agentId });
  }

  /**
   * Get the history of all snapshots
   */
  getHistory(): ContextSnapshot[] {
    return [...this.context.history];
  }

  /**
   * Get a specific snapshot by ID
   */
  getSnapshot(id: ID): ContextSnapshot | undefined {
    return this.context.history.find(s => s.id === id);
  }

  /**
   * Restore the project to a specific snapshot (time travel)
   */
  restoreSnapshot(snapshotId: ID, agentId?: ID): ProjectSpec | null {
    const snapshot = this.getSnapshot(snapshotId);
    if (!snapshot) return null;

    const previousSpec = this.context.currentState;
    this.addSnapshot(previousSpec, {
      id: nanoid(),
      timestamp: new Date().toISOString(),
      author: agentId ?? 'user',
      description: `Restored to snapshot ${snapshotId}`,
      files: [],
      type: 'update',
    });

    this.context.currentState = snapshot.spec;
    this.emit('snapshot:restored', { snapshot, agentId });
    return snapshot.spec;
  }

  /**
   * Get the diff between two snapshots
   */
  getDiff(snapshotIdA: ID, snapshotIdB: ID): DiffResult | null {
    const snapshotA = this.getSnapshot(snapshotIdA);
    const snapshotB = this.getSnapshot(snapshotIdB);

    if (!snapshotA || !snapshotB) return null;

    return {
      from: snapshotIdA,
      to: snapshotIdB,
      changes: this.generateFileChanges(snapshotA.spec, snapshotB.spec),
    };
  }

  // ─── Agent Memory ─────────────────────────────────────────────────────

  /**
   * Register an agent's context
   */
  registerAgent(agent: AgentContext): void {
    this.context.agentMemory.set(agent.agentId, agent);
    this.emit('agent:registered', { agent });
  }

  /**
   * Get an agent's context
   */
  getAgentContext(agentId: ID): AgentContext | undefined {
    return this.context.agentMemory.get(agentId);
  }

  /**
   * Update an agent's knowledge
   */
  updateAgentKnowledge(agentId: ID, key: string, value: unknown): void {
    const agent = this.context.agentMemory.get(agentId);
    if (agent) {
      agent.knowledge.set(key, value as any);
      this.emit('agent:knowledge-updated', { agentId, key, value });
    }
  }

  /**
   * Get an agent's knowledge
   */
  getAgentKnowledge(agentId: ID, key: string): unknown {
    const agent = this.context.agentMemory.get(agentId);
    return agent?.knowledge.get(key);
  }

  /**
   * Add a task to an agent
   */
  addAgentTask(agentId: ID, task: any): void {
    const agent = this.context.agentMemory.get(agentId);
    if (agent) {
      agent.tasks.push(task);
      this.emit('agent:task-added', { agentId, task });
    }
  }

  /**
   * Update an agent's preferences
   */
  updateAgentPreferences(agentId: ID, preferences: Record<string, unknown>): void {
    const agent = this.context.agentMemory.get(agentId);
    if (agent) {
      agent.preferences = { ...agent.preferences, ...preferences };
      this.emit('agent:preferences-updated', { agentId, preferences });
    }
  }

  /**
   * List all registered agents
   */
  listAgents(): AgentContext[] {
    return Array.from(this.context.agentMemory.values());
  }

  // ─── External Resources ───────────────────────────────────────────────

  /**
   * Add an external resource reference
   */
  addExternalResource(resource: ExternalResource): void {
    this.context.externalContext.push(resource);
    this.emit('resource:added', { resource });
  }

  /**
   * Get all external resources
   */
  getExternalResources(): ExternalResource[] {
    return [...this.context.externalContext];
  }

  /**
   * Find resources by type
   */
  findResourcesByType(type: ExternalResource['type']): ExternalResource[] {
    return this.context.externalContext.filter(r => r.type === type);
  }

  // ─── User Preferences ─────────────────────────────────────────────────

  /**
   * Get user preferences
   */
  getUserPreferences(): UserPreferenceModel {
    return this.context.userPreferences;
  }

  /**
   * Update user preferences
   */
  updateUserPreferences(preferences: Partial<UserPreferenceModel>): void {
    this.context.userPreferences = { ...this.context.userPreferences, ...preferences };
    this.emit('preferences:updated', { preferences: this.context.userPreferences });
  }

  /**
   * Learn from user behavior
   */
  learnFromBehavior(behavior: UserBehavior): void {
    const prefs = this.context.userPreferences;

    // Learn framework preference
    if (behavior.frameworkUsed) {
      prefs.frameworkPreference = behavior.frameworkUsed as any;
    }

    // Learn deployment preference
    if (behavior.deploymentTarget) {
      prefs.deploymentPreference = behavior.deploymentTarget as any;
    }

    // Learn style preferences
    if (behavior.colorScheme) {
      prefs.colorScheme = behavior.colorScheme as any;
    }

    // Learn component preferences
    if (behavior.componentsUsed) {
      const existing = new Set(prefs.componentPreferences);
      behavior.componentsUsed.forEach(c => existing.add(c));
      prefs.componentPreferences = Array.from(existing);
    }

    this.emit('preferences:learned', { behavior, preferences: prefs });
  }

  // ─── Session Management ───────────────────────────────────────────────

  /**
   * Start a new session
   */
  startSession(agentId: ID): Session {
    const session: Session = {
      id: nanoid(),
      startedAt: new Date().toISOString(),
      agent: agentId,
      actions: [],
    };
    this.context.sessions.push(session);
    this.emit('session:started', { session });
    return session;
  }

  /**
   * End a session
   */
  endSession(sessionId: ID): void {
    const session = this.context.sessions.find(s => s.id === sessionId);
    if (session) {
      session.endedAt = new Date().toISOString();
      this.emit('session:ended', { session });
    }
  }

  /**
   * Record an action in a session
   */
  recordAction(sessionId: ID, action: string): void {
    const session = this.context.sessions.find(s => s.id === sessionId);
    if (session) {
      session.actions.push(action);
    }
  }

  /**
   * Get all sessions
   */
  getSessions(): Session[] {
    return [...this.context.sessions];
  }

  // ─── Change Tracking ──────────────────────────────────────────────────

  /**
   * Apply a change set to the project
   */
  applyChanges(changeSet: ChangeSet, agentId?: ID): void {
    const previousSpec = this.context.currentState;
    this.addSnapshot(previousSpec, changeSet);

    // Apply file changes to spec
    let newSpec = { ...previousSpec };
    for (const fileChange of changeSet.files) {
      newSpec = this.applyFileChange(newSpec, fileChange);
    }

    newSpec.metadata.updatedAt = new Date().toISOString();
    this.context.currentState = newSpec;
    this.emit('changes:applied', { changeSet, agentId });
  }

  /**
   * Get all changes by a specific agent
   */
  getChangesByAgent(agentId: ID): ContextSnapshot[] {
    return this.context.history.filter(s => s.change.author === agentId);
  }

  /**
   * Get changes within a time range
   */
  getChangesInRange(startTime: Timestamp, endTime: Timestamp): ContextSnapshot[] {
    return this.context.history.filter(s => {
      const time = new Date(s.timestamp).getTime();
      return time >= new Date(startTime).getTime() && time <= new Date(endTime).getTime();
    });
  }

  // ─── Event System ─────────────────────────────────────────────────────

  /**
   * Subscribe to context events
   */
  on(event: string, callback: (event: ContextEvent) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  /**
   * Emit an event
   */
  private emit(event: string, data: Record<string, unknown>): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const contextEvent: ContextEvent = { type: event, timestamp: new Date().toISOString(), data };
      callbacks.forEach(cb => cb(contextEvent));
    }
  }

  // ─── Private Helpers ──────────────────────────────────────────────────

  /**
   * Create initial context from spec
   */
  private createInitialContext(spec: ProjectSpec): ProjectContext {
    return {
      id: nanoid(),
      currentState: spec,
      history: [],
      agentMemory: new Map(),
      externalContext: [],
      userPreferences: this.getDefaultUserPreferences(),
      sessions: [],
    };
  }

  /**
   * Get default user preferences
   */
  private getDefaultUserPreferences(): UserPreferenceModel {
    return {
      stylePreferences: {
        density: 'comfortable',
      },
      componentPreferences: [],
      colorScheme: 'system',
      animationsEnabled: true,
      reducedMotion: false,
    };
  }

  /**
   * Add a snapshot to history
   */
  private addSnapshot(spec: ProjectSpec, change: ChangeSet): void {
    const snapshot: ContextSnapshot = {
      id: nanoid(),
      timestamp: new Date().toISOString(),
      spec: { ...spec },
      change,
    };

    this.context.history.push(snapshot);

    // Trim history if it exceeds max size
    if (this.context.history.length > this.maxHistorySize) {
      this.context.history = this.context.history.slice(-this.maxHistorySize);
    }
  }

  /**
   * Generate file changes between two specs
   */
  private generateFileChanges(oldSpec: ProjectSpec, newSpec: ProjectSpec): FileChange[] {
    const changes: FileChange[] = [];

    // Compare pages
    const oldPages = new Map(oldSpec.structure.pages.map(p => [p.id, p]));
    const newPages = new Map(newSpec.structure.pages.map(p => [p.id, p]));

    // Find added pages
    for (const [id, page] of newPages) {
      if (!oldPages.has(id)) {
        changes.push({
          path: `pages/${page.path}`,
          content: JSON.stringify(page, null, 2),
          action: 'create',
        });
      }
    }

    // Find removed pages
    for (const [id, page] of oldPages) {
      if (!newPages.has(id)) {
        changes.push({
          path: `pages/${page.path}`,
          content: '',
          action: 'delete',
          previousContent: JSON.stringify(page, null, 2),
        });
      }
    }

    // Find modified pages
    for (const [id, newPage] of newPages) {
      const oldPage = oldPages.get(id);
      if (oldPage && JSON.stringify(oldPage) !== JSON.stringify(newPage)) {
        changes.push({
          path: `pages/${newPage.path}`,
          content: JSON.stringify(newPage, null, 2),
          action: 'update',
          previousContent: JSON.stringify(oldPage, null, 2),
        });
      }
    }

    return changes;
  }

  /**
   * Apply a file change to the spec
   */
  private applyFileChange(spec: ProjectSpec, change: FileChange): ProjectSpec {
    // This is a simplified implementation
    // In a real system, this would apply changes to the spec tree
    return spec;
  }
}

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ContextEvent {
  type: string;
  timestamp: Timestamp;
  data: Record<string, unknown>;
}

export interface DiffResult {
  from: ID;
  to: ID;
  changes: FileChange[];
}

export interface UserBehavior {
  frameworkUsed?: string;
  deploymentTarget?: string;
  colorScheme?: string;
  componentsUsed?: string[];
  action?: string;
}

// ─── Utility Functions ──────────────────────────────────────────────────────

/**
 * Create a new context manager
 */
export function createContext(spec: ProjectSpec): ContextManager {
  return new ContextManager(spec);
}

/**
 * Merge two contexts (for multi-agent collaboration)
 */
export function mergeContexts(base: ProjectContext, incoming: ProjectContext): ProjectContext {
  // Merge agent memories
  for (const [agentId, agent] of incoming.agentMemory) {
    const existing = base.agentMemory.get(agentId);
    if (existing) {
      // Merge knowledge
      for (const [key, value] of agent.knowledge) {
        existing.knowledge.set(key, value);
      }
      // Merge tasks
      existing.tasks.push(...agent.tasks);
    } else {
      base.agentMemory.set(agentId, agent);
    }
  }

  // Merge external context
  base.externalContext.push(...incoming.externalContext);

  // Merge sessions
  base.sessions.push(...incoming.sessions);

  // Merge history
  base.history.push(...incoming.history);
  base.history.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return base;
}

/**
 * Serialize context for storage
 */
export function serializeContext(context: ProjectContext): string {
  return JSON.stringify({
    ...context,
    agentMemory: Array.from(context.agentMemory.entries()),
  });
}

/**
 * Deserialize context from storage
 */
export function deserializeContext(json: string): ProjectContext {
  const parsed = JSON.parse(json);
  return {
    ...parsed,
    agentMemory: new Map(parsed.agentMemory),
  };
}

export default ContextManager;
