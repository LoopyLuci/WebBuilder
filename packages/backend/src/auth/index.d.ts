export interface User {
    id: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface AuthConfig {
    jwtSecret: string;
    jwtExpiresIn?: string;
    refreshTokenExpiresIn?: string;
    saltRounds?: number;
}
export interface LoginCredentials {
    email: string;
    password: string;
}
export interface RegisterCredentials {
    email: string;
    password: string;
    name?: string;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
}
export interface Session {
    id: string;
    userId: string;
    token: string;
    refreshToken: string;
    createdAt: Date;
    expiresAt: Date;
    revoked: boolean;
}
export interface AuthResult {
    user: Omit<User, 'passwordHash'>;
    tokens: AuthTokens;
}
export declare class AuthError extends Error {
    code: 'INVALID_CREDENTIALS' | 'USER_EXISTS' | 'USER_NOT_FOUND' | 'TOKEN_EXPIRED' | 'TOKEN_INVALID' | 'SESSION_REVOKED';
    constructor(message: string, code: 'INVALID_CREDENTIALS' | 'USER_EXISTS' | 'USER_NOT_FOUND' | 'TOKEN_EXPIRED' | 'TOKEN_INVALID' | 'SESSION_REVOKED');
}
export interface IAuthProvider {
    register(credentials: RegisterCredentials): Promise<AuthResult>;
    login(credentials: LoginCredentials): Promise<AuthResult>;
    logout(token: string): Promise<void>;
    validateToken(token: string): Promise<Omit<User, 'passwordHash'>>;
    refreshToken(refreshToken: string): Promise<AuthTokens>;
}
export interface SessionStore {
    create(session: Session): Promise<void>;
    findById(id: string): Promise<Session | null>;
    findByUserId(userId: string): Promise<Session[]>;
    revoke(sessionId: string): Promise<void>;
    revokeAll(userId: string): Promise<void>;
    cleanup(): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map