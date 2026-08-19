import type { DeploymentConfig, EnvVar } from '../types/index.js';
import type { DeployResult, DeploymentStatus, DeploymentInfo, EnvVarResult, ListDeploymentsOptions, LogEntry } from './types.js';
/**
 * Base class for deployment adapters
 * Handles common functionality like error handling and token resolution
 */
export declare abstract class Deployer {
    protected config: DeploymentConfig;
    protected token: string;
    constructor(config: DeploymentConfig, token: string);
    /**
     * Deploy the project
     */
    abstract deploy(): Promise<DeployResult>;
    /**
     * Get deployment status
     */
    abstract getStatus(deploymentId?: string): Promise<DeploymentStatus>;
    /**
     * Get deployment URLs
     */
    abstract getUrls(deploymentId?: string): Promise<string[]>;
    /**
     * List deployments
     */
    abstract listDeployments(options?: ListDeploymentsOptions): Promise<DeploymentInfo[]>;
    /**
     * Rollback to a previous deployment
     */
    abstract rollback(deploymentId: string): Promise<DeployResult>;
    /**
     * Manage environment variables
     */
    abstract setEnvVars(envVars: EnvVar[]): Promise<EnvVarResult[]>;
    /**
     * Get environment variables
     */
    abstract getEnvVars(): Promise<EnvVar[]>;
    /**
     * Get deployment logs
     */
    abstract getLogs(deploymentId?: string, lines?: number): Promise<LogEntry[]>;
    /**
     * Get the API base URL for the service
     */
    abstract getApiBaseUrl(): string;
    /**
     * Get the token name for environment variable resolution
     */
    abstract getTokenName(): string;
    /**
     * Get the default domain for the service
     */
    abstract getDefaultDomain(): string;
    /**
     * Validate the adapter configuration
     */
    validate(): {
        valid: boolean;
        errors: string[];
    };
    /**
     * Create standard headers for API requests
     */
    protected getHeaders(): Record<string, string>;
    /**
     * Handle API errors consistently
     */
    protected handleError(error: unknown, context: string): DeployResult;
    /**
     * Make an authenticated API request
     */
    protected request<T>(path: string, options?: RequestInit): Promise<T>;
    /**
     * Get domain from config or generate default
     */
    protected getDomain(): string;
}
//# sourceMappingURL=Deployer.d.ts.map