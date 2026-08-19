// ============================================================================
// Real-time Collaboration Module
// Enables multi-user editing with CRDT-based state synchronization
// ============================================================================

import { EventEmitter } from 'events';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CollaborationState {
  sections: any[];
  selectedSectionId: string | null;
  viewport: 'mobile' | 'tablet' | 'desktop';
  zoom: number;
}

export interface CollaborationEvent {
  id: string;
  type: 'section:add' | 'section:remove' | 'section:update' | 'section:reorder' | 'selection:change' | 'viewport:change' | 'zoom:change';
  payload: any;
  userId: string;
  timestamp: number;
  vectorClock: Record<string, number>;
}

export interface Presence {
  userId: string;
  name: string;
  color: string;
  avatar?: string;
  cursor?: { x: number; y: number };
  selectedSectionId: string | null;
  lastSeen: number;
}

export interface CollaborationSession {
  id: string;
  projectId: string;
  users: Map<string, Presence>;
  state: CollaborationState;
  eventLog: CollaborationEvent[];
  vectorClock: Record<string, number>;
}

// ─── Vector Clock ────────────────────────────────────────────────────────────

export class VectorClock {
  private clock: Record<string, number> = {};

  constructor(initial?: Record<string, number>) {
    this.clock = { ...initial };
  }

  increment(userId: string): void {
    this.clock[userId] = (this.clock[userId] || 0) + 1;
  }

  merge(other: Record<string, number>): void {
    for (const [key, value] of Object.entries(other)) {
      this.clock[key] = Math.max(this.clock[key] || 0, value);
    }
  }

  getClock(): Record<string, number> {
    return { ...this.clock };
  }

  compare(other: Record<string, number>): 'before' | 'after' | 'concurrent' {
    let allLessOrEqual = true;
    let allGreaterOrEqual = true;
    let hasLess = false;
    let hasGreater = false;

    const allKeys = new Set([...Object.keys(this.clock), ...Object.keys(other)]);

    for (const key of allKeys) {
      const a = this.clock[key] || 0;
      const b = other[key] || 0;

      if (a < b) {
        hasLess = true;
        allGreaterOrEqual = false;
      } else if (a > b) {
        hasGreater = true;
        allLessOrEqual = false;
      }
    }

    if (allLessOrEqual && hasLess) return 'before';
    if (allGreaterOrEqual && hasGreater) return 'after';
    return 'concurrent';
  }
}

// ─── CRDT Operations ─────────────────────────────────────────────────────────

export class CRDTOperations {
  static addSection(state: CollaborationState, section: any, userId: string): CollaborationState {
    return {
      ...state,
      sections: [...state.sections, section],
    };
  }

  static removeSection(state: CollaborationState, sectionId: string): CollaborationState {
    return {
      ...state,
      sections: state.sections.filter(s => s.id !== sectionId),
      selectedSectionId: state.selectedSectionId === sectionId ? null : state.selectedSectionId,
    };
  }

  static updateSection(state: CollaborationState, sectionId: string, props: any): CollaborationState {
    return {
      ...state,
      sections: state.sections.map(s =>
        s.id === sectionId ? { ...s, props: { ...s.props, ...props } } : s
      ),
    };
  }

  static reorderSections(state: CollaborationState, fromIndex: number, toIndex: number): CollaborationState {
    const newSections = [...state.sections];
    const [moved] = newSections.splice(fromIndex, 1);
    newSections.splice(toIndex, 0, moved);
    return {
      ...state,
      sections: newSections,
    };
  }

  static applyEvent(state: CollaborationState, event: CollaborationEvent): CollaborationState {
    switch (event.type) {
      case 'section:add':
        return this.addSection(state, event.payload.section, event.userId);
      case 'section:remove':
        return this.removeSection(state, event.payload.sectionId);
      case 'section:update':
        return this.updateSection(state, event.payload.sectionId, event.payload.props);
      case 'section:reorder':
        return this.reorderSections(state, event.payload.fromIndex, event.payload.toIndex);
      case 'selection:change':
        return { ...state, selectedSectionId: event.payload.sectionId };
      case 'viewport:change':
        return { ...state, viewport: event.payload.viewport };
      case 'zoom:change':
        return { ...state, zoom: event.payload.zoom };
      default:
        return state;
    }
  }
}

// ─── Collaboration Engine ────────────────────────────────────────────────────

export class CollaborationEngine extends EventEmitter {
  private sessions: Map<string, CollaborationSession> = new Map();
  private vectorClocks: Map<string, VectorClock> = new Map();
  private eventLogs: Map<string, CollaborationEvent[]> = new Map();

  createSession(projectId: string): CollaborationSession {
    const session: CollaborationSession = {
      id: `session-${Date.now()}`,
      projectId,
      users: new Map(),
      state: {
        sections: [],
        selectedSectionId: null,
        viewport: 'desktop',
        zoom: 1,
      },
      eventLog: [],
      vectorClock: {},
    };

    this.sessions.set(projectId, session);
    this.vectorClocks.set(projectId, new VectorClock());
    this.eventLogs.set(projectId, []);
    return session;
  }

  getSession(projectId: string): CollaborationSession | undefined {
    return this.sessions.get(projectId);
  }

  joinSession(projectId: string, user: Presence): void {
    const session = this.sessions.get(projectId);
    if (!session) return;

    session.users.set(user.userId, { ...user, lastSeen: Date.now() });
    this.emit('user:join', { projectId, user });
  }

  leaveSession(projectId: string, userId: string): void {
    const session = this.sessions.get(projectId);
    if (!session) return;

    session.users.delete(userId);
    this.emit('user:leave', { projectId, userId });

    if (session.users.size === 0) {
      this.sessions.delete(projectId);
      this.vectorClocks.delete(projectId);
      this.eventLogs.delete(projectId);
    }
  }

  applyEvent(projectId: string, event: CollaborationEvent): void {
    const session = this.sessions.get(projectId);
    if (!session) return;

    const vectorClock = this.vectorClocks.get(projectId);
    if (!vectorClock) return;

    // Update vector clock
    vectorClock.merge(event.vectorClock);
    vectorClock.increment(event.userId);

    // Apply event to state
    session.state = CRDTOperations.applyEvent(session.state, event);
    session.eventLog.push(event);

    // Emit event for real-time updates
    this.emit('state:change', { projectId, state: session.state, event });
  }

  syncState(projectId: string): CollaborationState | null {
    const session = this.sessions.get(projectId);
    return session?.state ?? null;
  }

  getPresenceList(projectId: string): Presence[] {
    const session = this.sessions.get(projectId);
    if (!session) return [];

    return Array.from(session.users.values()).filter(
      u => Date.now() - u.lastSeen < 30000 // Active in last 30s
    );
  }
}

// ─── WebSocket Transport ─────────────────────────────────────────────────────

export interface WebSocketMessage {
  type: 'event' | 'presence' | 'sync' | 'join' | 'leave';
  payload: any;
  userId: string;
  projectId: string;
  timestamp: number;
}

export class WebSocketTransport extends EventEmitter {
  private clients: Map<string, any> = new Map();

  broadcast(message: WebSocketMessage): void {
    for (const [userId, client] of this.clients) {
      if (userId !== message.userId && client.readyState === 1) {
        client.send(JSON.stringify(message));
      }
    }
  }

  send(userId: string, message: WebSocketMessage): void {
    const client = this.clients.get(userId);
    if (client && client.readyState === 1) {
      client.send(JSON.stringify(message));
    }
  }

  addClient(userId: string, socket: any): void {
    this.clients.set(userId, socket);
  }

  removeClient(userId: string): void {
    this.clients.delete(userId);
  }
}

export default { CollaborationEngine, CRDTOperations, VectorClock, WebSocketTransport };
