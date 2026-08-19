// ============================================================================
// Vercel Deployer Adapter
// Integrates with Vercel REST API for real deployments
// Requires VERCEL_TOKEN environment variable
// ============================================================================

import { Deployer } from './Deployer.js';
import type {
  DeployResult,
  DeploymentStatus,
  DeploymentInfo,
  EnvVarResult,
  ListDeploymentsOptions,
  LogEntry,
} from './types.js';
import type { DeploymentConfig, EnvVar } from '../types/index.js';

/**
 * Vercel API response types
 */
interface VercelDeployment {
  uid: string;
  name: string;
  url: string;
  state: 'BUILDING' | 'ERROR' | 'INITIALIZING' | 'QUEUED' | 'READY' | 'CANCELED';
  readyState: string;
  createdAt: number;
  updatedAt?: number;
  meta?: Record<string, unknown>;
  target?: string;
}

interface VercelDeploymentResponse {
  deployment: VercelDeployment;
}

interface VercelDeploymentsResponse {
  deployments: VercelDeployment[];
}

interface VercelEnvVar {
  key: string;
  value: string;
  target: string[];
  type: string;
}

interface VercelEnvVarsResponse {
  envs: VercelEnvVar[];
}

/**
 * Vercel Deployer - Real API integration
 */
export class VercelDeployer extends Deployer {
  private projectId?: string;
  private teamId?: string;

  constructor(config: DeploymentConfig, token: string, projectId?: string, teamId?: string) {
    super(config, token);
    this.projectId = projectId;
    this.teamId = teamId;
  }

  getApiBaseUrl(): string {
    return 'https://api.vercel.com';
  }

  getTokenName(): string {
    return 'VERCEL_TOKEN';
  }

  getDefaultDomain(): string {
    return 'vercel.app';
  }

  /**
   * Deploy to Vercel
   * Supports both git-based and direct upload deployments
   */
  async deploy(): Promise<DeployResult> {
    try {
      const validation = this.validate();
      if (!validation.valid) {
        return {
          success: false,
          error: `Validation failed: ${validation.errors.join(', ')}`,
        };
      }

      // Build deployment payload
      const payload: Record<string, unknown> = {
        name: this.config.name || 'webbuilder-deployment',
        target: this.config.environment === 'production' ? 'production' : 'preview',
      };

      // Add git source if available
      if (this.config.gitSource) {
        payload.gitSource = this.config.gitSource;
      } else {
        // Direct upload deployment
        payload.projectSettings = {
          framework: this.config.framework || null,
          buildCommand: this.config.buildCommand || null,
          outputDirectory: this.config.outputDir || null,
          installCommand: this.config.installCommand || null,
        };

        // Add files for direct upload
        if (this.config.files) {
          payload.files = this.config.files.map(f => ({
            file: f.path,
            data: f.content,
            encoding: 'utf-8',
          }));
        }
      }

      // Add environment variables
      if (this.config.envVars && this.config.envVars.length > 0) {
        payload.env = Object.fromEntries(
          this.config.envVars.map(v => [v.key, v.value])
        );
      }

      // Add domain if specified
      if (this.config.domain) {
        payload.domains = [this.config.domain];
      }

      const queryParams = new URLSearchParams();
      if (this.projectId) queryParams.set('projectId', this.projectId);
      if (this.teamId) queryParams.set('teamId', this.teamId);
      queryParams.set('upsert', 'true');

      const response = await this.request<VercelDeploymentResponse>(
        `/v13/deployments?${queryParams.toString()}`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );

      const deployment = response.deployment;
      const url = `https://${deployment.url}`;

      return {
        success: true,
        url,
        deploymentId: deployment.uid,
        timestamp: new Date(deployment.createdAt).toISOString(),
      };
    } catch (error) {
      return this.handleError(error, 'Vercel deployment failed');
    }
  }

  /**
   * Get deployment status
   */
  async getStatus(deploymentId?: string): Promise<DeploymentStatus> {
    try {
      if (!deploymentId) {
        // Get latest deployment
        const deployments = await this.listDeployments({ limit: 1 });
        if (deployments.length === 0) {
          return {
            status: 'unknown',
            message: 'No deployments found',
          };
        }
        deploymentId = deployments[0].id;
      }

      const queryParams = new URLSearchParams();
      if (this.teamId) queryParams.set('teamId', this.teamId);

      const response = await this.request<VercelDeploymentResponse>(
        `/v13/deployments/${deploymentId}?${queryParams.toString()}`
      );

      const deployment = response.deployment;
      const statusMap: Record<string, DeploymentStatus['status']> = {
        BUILDING: 'building',
        ERROR: 'error',
        INITIALIZING: 'pending',
        QUEUED: 'pending',
        READY: 'ready',
        CANCELED: 'error',
      };

      return {
        status: statusMap[deployment.state] || 'unknown',
        message: `Deployment is ${deployment.state.toLowerCase()}`,
        url: `https://${deployment.url}`,
        lastDeployed: deployment.updatedAt
          ? new Date(deployment.updatedAt).toISOString()
          : new Date(deployment.createdAt).toISOString(),
        deploymentId: deployment.uid,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get deployment URLs
   */
  async getUrls(deploymentId?: string): Promise<string[]> {
    try {
      if (!deploymentId) {
        const deployments = await this.listDeployments({ limit: 1 });
        if (deployments.length === 0) return [];
        deploymentId = deployments[0].id;
      }

      const queryParams = new URLSearchParams();
      if (this.teamId) queryParams.set('teamId', this.teamId);

      const response = await this.request<VercelDeploymentResponse>(
        `/v13/deployments/${deploymentId}?${queryParams.toString()}`
      );

      const deployment = response.deployment;
      const urls: string[] = [`https://${deployment.url}`];

      // Add alias URLs if available
      if (deployment.meta && 'alias' in deployment.meta) {
        const aliases = deployment.meta.alias as string[];
        urls.push(...aliases.map(a => `https://${a}`));
      }

      return urls;
    } catch {
      return [];
    }
  }

  /**
   * List deployments
   */
  async listDeployments(options?: ListDeploymentsOptions): Promise<DeploymentInfo[]> {
    try {
      const queryParams = new URLSearchParams();
      if (this.projectId) queryParams.set('projectId', this.projectId);
      if (this.teamId) queryParams.set('teamId', this.teamId);
      if (options?.limit) queryParams.set('limit', options.limit.toString());
      if (options?.target) queryParams.set('target', options.target);

      const response = await this.request<VercelDeploymentsResponse>(
        `/v6/deployments?${queryParams.toString()}`
      );

      return response.deployments.map(d => ({
        id: d.uid,
        url: `https://${d.url}`,
        state: d.state,
        createdAt: new Date(d.createdAt).toISOString(),
        updatedAt: d.updatedAt ? new Date(d.updatedAt).toISOString() : undefined,
        target: d.target,
        meta: d.meta,
      }));
    } catch {
      return [];
    }
  }

  /**
   * Rollback to a previous deployment
   */
  async rollback(deploymentId: string): Promise<DeployResult> {
    try {
      const queryParams = new URLSearchParams();
      if (this.teamId) queryParams.set('teamId', this.teamId);

      // Create a new deployment based on the previous one
      const payload = {
        name: this.config.name || 'webbuilder-rollback',
        deploymentId,
        target: 'production',
      };

      const response = await this.request<VercelDeploymentResponse>(
        `/v13/deployments?${queryParams.toString()}`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );

      const deployment = response.deployment;

      return {
        success: true,
        url: `https://${deployment.url}`,
        deploymentId: deployment.uid,
        timestamp: new Date(deployment.createdAt).toISOString(),
      };
    } catch (error) {
      return this.handleError(error, 'Vercel rollback failed');
    }
  }

  /**
   * Set environment variables
   */
  async setEnvVars(envVars: EnvVar[]): Promise<EnvVarResult[]> {
    const results: EnvVarResult[] = [];

    if (!this.projectId) {
      return envVars.map(v => ({
        key: v.key,
        success: false,
        error: 'Project ID is required to set environment variables',
      }));
    }

    for (const envVar of envVars) {
      try {
        const payload: Record<string, unknown> = {
          key: envVar.key,
          value: envVar.value,
          target: envVar.target || ['production', 'preview', 'development'],
          type: envVar.isSecret ? 'encrypted' : 'plain',
        };

        const queryParams = new URLSearchParams();
        if (this.teamId) queryParams.set('teamId', this.teamId);

        await this.request(
          `/v10/projects/${this.projectId}/env?${queryParams.toString()}`,
          {
            method: 'POST',
            body: JSON.stringify(payload),
          }
        );

        results.push({ key: envVar.key, success: true });
      } catch (error) {
        results.push({
          key: envVar.key,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return results;
  }

  /**
   * Get environment variables
   */
  async getEnvVars(): Promise<EnvVar[]> {
    try {
      if (!this.projectId) return [];

      const queryParams = new URLSearchParams();
      if (this.teamId) queryParams.set('teamId', this.teamId);

      const response = await this.request<VercelEnvVarsResponse>(
        `/v10/projects/${this.projectId}/env?${queryParams.toString()}`
      );

      return response.envs.map(e => ({
        key: e.key,
        value: e.value,
        isSecret: e.type === 'encrypted',
        target: e.target,
      }));
    } catch {
      return [];
    }
  }

  /**
   * Get deployment logs
   */
  async getLogs(deploymentId?: string, lines = 100): Promise<LogEntry[]> {
    try {
      if (!deploymentId) {
        const deployments = await this.listDeployments({ limit: 1 });
        if (deployments.length === 0) return [];
        deploymentId = deployments[0].id;
      }

      const queryParams = new URLSearchParams();
      if (this.teamId) queryParams.set('teamId', this.teamId);
      queryParams.set('limit', lines.toString());

      const response = await this.request<{ logs: Array<{ message: string; timestamp: number; level: string }> }>(
        `/v13/deployments/${deploymentId}/events?${queryParams.toString()}`
      );

      return response.logs.map(log => ({
        timestamp: new Date(log.timestamp).toISOString(),
        message: log.message,
        level: (['info', 'warn', 'error', 'debug'].includes(log.level)
          ? log.level
          : 'info') as LogEntry['level'],
      }));
    } catch {
      return [];
    }
  }
}