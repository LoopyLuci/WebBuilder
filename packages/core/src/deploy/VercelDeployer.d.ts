import { Deployer } from './Deployer.js';
import type { DeployResult, DeploymentStatus, DeploymentInfo, EnvVarResult, ListDeploymentsOptions, LogEntry } from './types.js';
import type { DeploymentConfig, EnvVar } from '../types/index.js';
/**
 * Vercel Deployer - Real API integration
 */
export declare class VercelDeployer extends Deployer {
    private projectId?;
    private teamId?;
    constructor(config: DeploymentConfig, token: string, projectId?: string, teamId?: string);
    getApiBaseUrl(): string;
    getTokenName(): string;
    getDefaultDomain(): string;
    /**
     * Deploy to Vercel
     * Supports both git-based and direct upload deployments
     */
    deploy(): Promise<DeployResult>;
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
//# sourceMappingURL=VercelDeployer.d.ts.map