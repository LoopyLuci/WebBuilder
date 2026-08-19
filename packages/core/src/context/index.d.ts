import type { ProjectContext, ProjectSpec, ContextSnapshot, AgentContext, ExternalResource, UserPreferenceModel, Session, ChangeSet, FileChange, ID, Timestamp } from '../types/index.js';
export declare class ContextManager {
    private context;
    private maxHistorySize;
    private listeners;
    constructor(spec: ProjectSpec, maxHistorySize?: number);
    /**
     * Get the full project context
     */
    getContext(): ProjectContext;
    /**
     * Get the current project spec
     */
    getCurrentSpec(): ProjectSpec;
    /**
     * Update the project spec with a new version
     */
    updateSpec(updates: Partial<ProjectSpec>, agentId?: ID, description?: string): void;
    /**
     * Replace the entire spec (use with caution)
     */
    replaceSpec(newSpec: ProjectSpec, agentId?: ID, description?: string): void;
    /**
     * Get the history of all snapshots
     */
    getHistory(): ContextSnapshot[];
    /**
     * Get a specific snapshot by ID
     */
    getSnapshot(id: ID): ContextSnapshot | undefined;
    /**
     * Restore the project to a specific snapshot (time travel)
     */
    restoreSnapshot(snapshotId: ID, agentId?: ID): ProjectSpec | null;
    /**
     * Get the diff between two snapshots
     */
    getDiff(snapshotIdA: ID, snapshotIdB: ID): DiffResult | null;
    /**
     * Register an agent's context
     */
    registerAgent(agent: AgentContext): void;
    /**
     * Get an agent's context
     */
    getAgentContext(agentId: ID): AgentContext | undefined;
    /**
     * Update an agent's knowledge
     */
    updateAgentKnowledge(agentId: ID, key: string, value: unknown): void;
    /**
     * Get an agent's knowledge
     */
    getAgentKnowledge(agentId: ID, key: string): unknown;
    /**
     * Add a task to an agent
     */
    addAgentTask(agentId: ID, task: any): void;
    /**
     * Update an agent's preferences
     */
    updateAgentPreferences(agentId: ID, preferences: Record<string, unknown>): void;
    /**
     * List all registered agents
     */
    listAgents(): AgentContext[];
    /**
     * Add an external resource reference
     */
    addExternalResource(resource: ExternalResource): void;
    /**
     * Get all external resources
     */
    getExternalResources(): ExternalResource[];
    /**
     * Find resources by type
     */
    findResourcesByType(type: ExternalResource['type']): ExternalResource[];
    /**
     * Get user preferences
     */
    getUserPreferences(): UserPreferenceModel;
    /**
     * Update user preferences
     */
    updateUserPreferences(preferences: Partial<UserPreferenceModel>): void;
    /**
     * Learn from user behavior
     */
    learnFromBehavior(behavior: UserBehavior): void;
    /**
     * Start a new session
     */
    startSession(agentId: ID): Session;
    /**
     * End a session
     */
    endSession(sessionId: ID): void;
    /**
     * Record an action in a session
     */
    recordAction(sessionId: ID, action: string): void;
    /**
     * Get all sessions
     */
    getSessions(): Session[];
    /**
     * Apply a change set to the project
     */
    applyChanges(changeSet: ChangeSet, agentId?: ID): void;
    /**
     * Get all changes by a specific agent
     */
    getChangesByAgent(agentId: ID): ContextSnapshot[];
    /**
     * Get changes within a time range
     */
    getChangesInRange(startTime: Timestamp, endTime: Timestamp): ContextSnapshot[];
    /**
     * Subscribe to context events
     */
    on(event: string, callback: (event: ContextEvent) => void): () => void;
    /**
     * Emit an event
     */
    private emit;
    /**
     * Create initial context from spec
     */
    private createInitialContext;
    /**
     * Get default user preferences
     */
    private getDefaultUserPreferences;
    /**
     * Add a snapshot to history
     */
    private addSnapshot;
    /**
     * Generate file changes between two specs
     */
    private generateFileChanges;
    /**
     * Apply a file change to the spec
     */
    private applyFileChange;
}
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
/**
 * Create a new context manager
 */
export declare function createContext(spec: ProjectSpec): ContextManager;
/**
 * Merge two contexts (for multi-agent collaboration)
 */
export declare function mergeContexts(base: ProjectContext, incoming: ProjectContext): ProjectContext;
/**
 * Serialize context for storage
 */
export declare function serializeContext(context: ProjectContext): string;
/**
 * Deserialize context from storage
 */
export declare function deserializeContext(json: string): ProjectContext;
export default ContextManager;
//# sourceMappingURL=index.d.ts.map