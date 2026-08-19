// ============================================================================
// Context Manager Module
// Maintains full project context across sessions, agents, and time
// ============================================================================
import { nanoid } from 'nanoid';
// ─── Context Manager ────────────────────────────────────────────────────────
export class ContextManager {
    context;
    maxHistorySize;
    listeners;
    constructor(spec, maxHistorySize = 100) {
        this.maxHistorySize = maxHistorySize;
        this.listeners = new Map();
        this.context = this.createInitialContext(spec);
    }
    // ─── Core Operations ──────────────────────────────────────────────────
    /**
     * Get the full project context
     */
    getContext() {
        return this.context;
    }
    /**
     * Get the current project spec
     */
    getCurrentSpec() {
        return this.context.currentState;
    }
    /**
     * Update the project spec with a new version
     */
    updateSpec(updates, agentId, description) {
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
    replaceSpec(newSpec, agentId, description) {
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
    getHistory() {
        return [...this.context.history];
    }
    /**
     * Get a specific snapshot by ID
     */
    getSnapshot(id) {
        return this.context.history.find(s => s.id === id);
    }
    /**
     * Restore the project to a specific snapshot (time travel)
     */
    restoreSnapshot(snapshotId, agentId) {
        const snapshot = this.getSnapshot(snapshotId);
        if (!snapshot)
            return null;
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
    getDiff(snapshotIdA, snapshotIdB) {
        const snapshotA = this.getSnapshot(snapshotIdA);
        const snapshotB = this.getSnapshot(snapshotIdB);
        if (!snapshotA || !snapshotB)
            return null;
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
    registerAgent(agent) {
        this.context.agentMemory.set(agent.agentId, agent);
        this.emit('agent:registered', { agent });
    }
    /**
     * Get an agent's context
     */
    getAgentContext(agentId) {
        return this.context.agentMemory.get(agentId);
    }
    /**
     * Update an agent's knowledge
     */
    updateAgentKnowledge(agentId, key, value) {
        const agent = this.context.agentMemory.get(agentId);
        if (agent) {
            agent.knowledge.set(key, value);
            this.emit('agent:knowledge-updated', { agentId, key, value });
        }
    }
    /**
     * Get an agent's knowledge
     */
    getAgentKnowledge(agentId, key) {
        const agent = this.context.agentMemory.get(agentId);
        return agent?.knowledge.get(key);
    }
    /**
     * Add a task to an agent
     */
    addAgentTask(agentId, task) {
        const agent = this.context.agentMemory.get(agentId);
        if (agent) {
            agent.tasks.push(task);
            this.emit('agent:task-added', { agentId, task });
        }
    }
    /**
     * Update an agent's preferences
     */
    updateAgentPreferences(agentId, preferences) {
        const agent = this.context.agentMemory.get(agentId);
        if (agent) {
            agent.preferences = { ...agent.preferences, ...preferences };
            this.emit('agent:preferences-updated', { agentId, preferences });
        }
    }
    /**
     * List all registered agents
     */
    listAgents() {
        return Array.from(this.context.agentMemory.values());
    }
    // ─── External Resources ───────────────────────────────────────────────
    /**
     * Add an external resource reference
     */
    addExternalResource(resource) {
        this.context.externalContext.push(resource);
        this.emit('resource:added', { resource });
    }
    /**
     * Get all external resources
     */
    getExternalResources() {
        return [...this.context.externalContext];
    }
    /**
     * Find resources by type
     */
    findResourcesByType(type) {
        return this.context.externalContext.filter(r => r.type === type);
    }
    // ─── User Preferences ─────────────────────────────────────────────────
    /**
     * Get user preferences
     */
    getUserPreferences() {
        return this.context.userPreferences;
    }
    /**
     * Update user preferences
     */
    updateUserPreferences(preferences) {
        this.context.userPreferences = { ...this.context.userPreferences, ...preferences };
        this.emit('preferences:updated', { preferences: this.context.userPreferences });
    }
    /**
     * Learn from user behavior
     */
    learnFromBehavior(behavior) {
        const prefs = this.context.userPreferences;
        // Learn framework preference
        if (behavior.frameworkUsed) {
            prefs.frameworkPreference = behavior.frameworkUsed;
        }
        // Learn deployment preference
        if (behavior.deploymentTarget) {
            prefs.deploymentPreference = behavior.deploymentTarget;
        }
        // Learn style preferences
        if (behavior.colorScheme) {
            prefs.colorScheme = behavior.colorScheme;
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
    startSession(agentId) {
        const session = {
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
    endSession(sessionId) {
        const session = this.context.sessions.find(s => s.id === sessionId);
        if (session) {
            session.endedAt = new Date().toISOString();
            this.emit('session:ended', { session });
        }
    }
    /**
     * Record an action in a session
     */
    recordAction(sessionId, action) {
        const session = this.context.sessions.find(s => s.id === sessionId);
        if (session) {
            session.actions.push(action);
        }
    }
    /**
     * Get all sessions
     */
    getSessions() {
        return [...this.context.sessions];
    }
    // ─── Change Tracking ──────────────────────────────────────────────────
    /**
     * Apply a change set to the project
     */
    applyChanges(changeSet, agentId) {
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
    getChangesByAgent(agentId) {
        return this.context.history.filter(s => s.change.author === agentId);
    }
    /**
     * Get changes within a time range
     */
    getChangesInRange(startTime, endTime) {
        return this.context.history.filter(s => {
            const time = new Date(s.timestamp).getTime();
            return time >= new Date(startTime).getTime() && time <= new Date(endTime).getTime();
        });
    }
    // ─── Event System ─────────────────────────────────────────────────────
    /**
     * Subscribe to context events
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
        // Return unsubscribe function
        return () => {
            this.listeners.get(event)?.delete(callback);
        };
    }
    /**
     * Emit an event
     */
    emit(event, data) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            const contextEvent = { type: event, timestamp: new Date().toISOString(), data };
            callbacks.forEach(cb => cb(contextEvent));
        }
    }
    // ─── Private Helpers ──────────────────────────────────────────────────
    /**
     * Create initial context from spec
     */
    createInitialContext(spec) {
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
    getDefaultUserPreferences() {
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
    addSnapshot(spec, change) {
        const snapshot = {
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
    generateFileChanges(oldSpec, newSpec) {
        const changes = [];
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
    applyFileChange(spec, change) {
        // This is a simplified implementation
        // In a real system, this would apply changes to the spec tree
        return spec;
    }
}
// ─── Utility Functions ──────────────────────────────────────────────────────
/**
 * Create a new context manager
 */
export function createContext(spec) {
    return new ContextManager(spec);
}
/**
 * Merge two contexts (for multi-agent collaboration)
 */
export function mergeContexts(base, incoming) {
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
        }
        else {
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
export function serializeContext(context) {
    return JSON.stringify({
        ...context,
        agentMemory: Array.from(context.agentMemory.entries()),
    });
}
/**
 * Deserialize context from storage
 */
export function deserializeContext(json) {
    const parsed = JSON.parse(json);
    return {
        ...parsed,
        agentMemory: new Map(parsed.agentMemory),
    };
}
export default ContextManager;
//# sourceMappingURL=index.js.map