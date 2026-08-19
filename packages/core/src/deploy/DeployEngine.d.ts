import type { DeploymentConfig, DeploymentTarget, DeploymentEnvironment, EnvVar } from '../types/index.js';
import type { DesignValidationResult } from '../design/index.js';
import type { LogEntry, DeployResult, DeploymentStatus, DeploymentInfo, EnvVarResult, ListDeploymentsOptions } from './types.js';
type ValidationResult = DesignValidationResult;
export declare class DeployEngine {
    private config;
    private deployer?;
    constructor(config?: DeploymentConfig);
    /**
     * Get current deployment config
     */
    getConfig(): DeploymentConfig;
    /**
     * Set deployment config
     */
    setConfig(config: DeploymentConfig): void;
    /**
     * Update deployment config
     */
    updateConfig(updates: Partial<DeploymentConfig>): void;
    /**
     * Get or create the deployer for the current target
     */
    private getDeployer;
    /**
     * Deploy the project
     */
    deploy(options?: DeployOptions): Promise<DeployResult>;
    /**
     * Deploy a preview
     */
    deployPreview(options?: DeployOptions): Promise<DeployResult>;
    /**
     * Rollback to a previous version
     */
    rollback(deploymentId: string): Promise<DeployResult>;
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
     * Get deployment logs
     */
    getLogs(deploymentId?: string, lines?: number): Promise<LogEntry[]>;
    /**
     * Set environment variables
     */
    setEnvVars(envVars: EnvVar[]): Promise<EnvVarResult[]>;
    /**
     * Get environment variables
     */
    getEnvVars(): Promise<EnvVar[]>;
    /**
     * Validate deployment config
     */
    validate(): ValidationResult;
    /**
     * Generate deployment configuration files
     */
    generateConfigFiles(): DeployConfigFiles;
    /**
     * Generate environment variable template
     */
    generateEnvTemplate(): string;
    /**
     * Estimate monthly cost
     */
    estimateCost(): CostEstimate;
    /**
     * Create default deployment config
     */
    private createDefaultConfig;
    /**
     * Run pre-deploy checks
     */
    private runPreDeployChecks;
    /**
     * Run build
     */
    private runBuild;
    /**
     * Run post-deploy tasks
     */
    private runPostDeploy;
    /**
     * Generate Vercel config
     */
    private generateVercelConfig;
    /**
     * Generate Netlify config
     */
    private generateNetlifyConfig;
    /**
     * Generate Cloudflare config
     */
    private generateCloudflareConfig;
    /**
     * Generate Docker config
     */
    private generateDockerConfig;
}
export interface DeployOptions {
    build?: boolean;
    force?: boolean;
    skipChecks?: boolean;
}
export interface PreDeployChecks {
    passed: boolean;
    failures: string[];
}
export interface BuildResult {
    success: boolean;
    output: string;
    duration: number;
    error?: string;
}
export interface DeployConfigFiles {
    files: {
        path: string;
        content: string;
    }[];
}
export interface CostEstimate {
    base: number;
    scaling: number;
    cdn: number;
    monitoring: number;
    total: number;
    currency: string;
    period: string;
}
export declare function createDeployEngine(config?: DeploymentConfig): DeployEngine;
export declare function createDeploymentConfig(target: DeploymentTarget, env: DeploymentEnvironment): DeploymentConfig;
export default DeployEngine;
//# sourceMappingURL=DeployEngine.d.ts.map