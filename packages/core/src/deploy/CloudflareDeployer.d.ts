import { Deployer } from './Deployer.js';
import type { DeployResult, DeploymentStatus, DeploymentInfo, EnvVarResult, ListDeploymentsOptions, LogEntry } from './types.js';
import type { DeploymentConfig, EnvVar } from '../types/index.js';
/**
 * Cloudflare Deployer - Real API integration
 */
export declare class CloudflareDeployer extends Deployer {
    private accountId?;
    private projectName?;
    constructor(config: DeploymentConfig, token: string, accountId?: string, projectName?: string);
    getApiBaseUrl(): string;
    getTokenName(): string;
    getDefaultDomain(): string;
    /**
     * Deploy to Cloudflare Pages
     * Supports both git-based and direct upload deployments
     */
    deploy(): Promise<DeployResult>;
    /**
     * Create a new Cloudflare Pages project
     */
    private createProject;
    /**
     * Get deployment status
     */
    getStatus(deploymentId?: string): Promise<DeploymentStatus>;
    /**
     * Get deployment URLs
     */
    getUrls(deploymentId?: string): Promise<string[]>;
    /**
     * List deployments
     */
    listDeployments(options?: ListDeploymentsOptions): Promise<DeploymentInfo[]>;
    /**
     * Rollback to a previous deployment
     */
    rollback(deploymentId: string): Promise<DeployResult>;
    /**
     * Set environment variables
     */
    setEnvVars(envVars: EnvVar[]): Promise<EnvVarResult[]>;
    /**
     * Get environment variables
     */
    getEnvVars(): Promise<EnvVar[]>;
    /**
     * Get deployment logs
     */
    getLogs(deploymentId?: string, lines?: number): Promise<LogEntry[]>;
}
//# sourceMappingURL=CloudflareDeployer.d.ts.map