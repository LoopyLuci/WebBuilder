export interface RealtimeConfig {
  path?: string;
  cors?: {
    origin: string | string[];
    methods: string[];
  };
  pingInterval?: number;
  pingTimeout?: number;
  maxHttpBufferSize?: number;
}

export interface RealtimeEvent {
  event: string;
  data: any;
  room?: string;
  userId?: string;
  timestamp: Date;
}

export interface RealtimeRoom {
  id: string;
  name: string;
  users: string[];
  createdAt: Date;
}

export interface RealtimeUser {
  id: string;
  socketId: string;
  rooms: string[];
  connectedAt: Date;
}

export interface RealtimeMiddleware {
  (event: RealtimeEvent, next: () => Promise<void>): Promise<void>;
}

export interface EventHandler {
  (data: any, ack?: (response: any) => void): Promise<void> | void;
}

export class RealtimeError extends Error {
  constructor(
    message: string,
    public code: 'CONNECTION_ERROR' | 'AUTH_FAILED' | 'ROOM_NOT_FOUND' | 'RATE_LIMITED' | 'INVALID_EVENT'
  ) {
    super(message);
    this.name = 'RealtimeError';
  }
}

export interface IRealtimeProvider {
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  on(event: string, handler: EventHandler): void;
  off(event: string, handler?: EventHandler): void;
  emit(event: string, data: any, room?: string): Promise<void>;
  broadcast(event: string, data: any): Promise<void>;
  joinRoom(room: string, userId: string): Promise<void>;
  leaveRoom(room: string, userId: string): Promise<void>;
  getRoomUsers(room: string): Promise<string[]>;
  getRooms(): Promise<RealtimeRoom[]>;
  use(middleware: RealtimeMiddleware): void;
}