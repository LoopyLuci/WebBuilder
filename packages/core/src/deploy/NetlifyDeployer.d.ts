import { Deployer } from './Deployer.js';
import type { DeployResult, DeploymentStatus, DeploymentInfo, EnvVarResult, ListDeploymentsOptions, LogEntry } from './types.js';
import type { DeploymentConfig, EnvVar } from '../types/index.js';
/**
 * Netlify Deployer - Real API integration
 */
export declare class NetlifyDeployer extends Deployer {
    private siteId?;
    constructor(config: DeploymentConfig, token: string, siteId?: string);
    getApiBaseUrl(): string;
    getTokenName(): string;
    getDefaultDomain(): string;
    /**
     * Deploy to Netlify
     * Supports both git-based and direct upload deployments
     */
    deploy(): Promise<DeployResult>;
    /**
     * Create a new Netlify site
     */
    private createSite;
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
//# sourceMappingURL=NetlifyDeployer.d.ts.map