export interface DatabaseConfig {
  type: 'sqlite' | 'postgresql' | 'mongodb';
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  sqlitePath?: string;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
}

export interface QueryResult<T = any> {
  data: T[];
  total?: number;
  page?: number;
  pageSize?: number;
}

export interface DatabaseAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>>;
  execute(sql: string, params?: any[]): Promise<{ changes: number; insertId?: string }>;
  findOne<T = any>(collection: string, filter: any): Promise<T | null>;
  find<T = any>(collection: string, filter: any, options?: QueryOptions): Promise<QueryResult<T>>;
  insert<T = any>(collection: string, data: Partial<T>): Promise<T>;
  update<T = any>(collection: string, id: string, data: Partial<T>): Promise<T>;
  delete(collection: string, id: string): Promise<boolean>;
  transaction<T>(fn: () => Promise<T> | T): Promise<T>;
}

export class DatabaseError extends Error {
  constructor(
    message: string,
    public code: 'CONNECTION_ERROR' | 'QUERY_ERROR' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'CONSTRAINT_VIOLATION'
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export interface IUserStore {
  create(user: any): Promise<any>;
  findById(id: string): Promise<any | null>;
  findByEmail(email: string): Promise<any | null>;
  update(id: string, data: any): Promise<any>;
  delete(id: string): Promise<boolean>;
}