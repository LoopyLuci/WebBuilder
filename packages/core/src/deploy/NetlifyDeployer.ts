// ============================================================================
// Netlify Deployer Adapter
// Integrates with Netlify REST API for real deployments
// Requires NETLIFY_TOKEN environment variable
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
 * Netlify API response types
 */
interface NetlifySite {
  id: string;
  name: string;
  url: string;
  admin_url: string;
  build_settings: {
    repo_url: string;
    repo_branch: string;
    deploy_preview: boolean;
    production_branch: string;
  };
  ssl: boolean;
  force_ssl: boolean;
  created_at: string;
  updated_at: string;
}

interface NetlifyDeploy {
  id: string;
  site_id: string;
  state: 'uploading' | 'building' | 'processing' | 'ready' | 'error';
  name: string;
  url: string;
  admin_url: string;
  deploy_url: string;
  deploy_ssl_url: string;
  created_at: string;
  updated_at: string;
  error_message?: string;
  branch?: string;
  commit_ref?: string;
  review_url?: string;
  required?: string[];
  title?: string;
}

interface NetlifyDeployResponse {
  deploy: NetlifyDeploy;
  site: NetlifySite;
}

interface NetlifyDeploysResponse {
  deploys: NetlifyDeploy[];
}

interface NetlifyEnvVar {
  key: string;
  values: Array<{ value: string; context: string }>;
  scope: string[];
}

interface NetlifyEnvVarsResponse {
  [key: string]: NetlifyEnvVar;
}

/**
 * Netlify Deployer - Real API integration
 */
export class NetlifyDeployer extends Deployer {
  private siteId?: string;

  constructor(config: DeploymentConfig, token: string, siteId?: string) {
    super(config, token);
    this.siteId = siteId;
  }

  getApiBaseUrl(): string {
    return 'https://api.netlify.com';
  }

  getTokenName(): string {
    return 'NETLIFY_TOKEN';
  }

  getDefaultDomain(): string {
    return 'netlify.app';
  }

  /**
   * Deploy to Netlify
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

      // Create site if no siteId provided
      if (!this.siteId) {
        const site = await this.createSite();
        this.siteId = site.id;
      }

      // Prepare deployment payload
      const payload: Record<string, unknown> = {
        files: {},
      };

      // Add files for direct upload
      if (this.config.files && this.config.files.length > 0) {
        for (const file of this.config.files) {
          payload.files = {
            ...payload.files,
            [file.path]: file.content,
          };
        }
      }

      // Add title
      if (this.config.name) {
        payload.title = this.config.name;
      }

      // Add branch
      if (this.config.branch) {
        payload.branch = this.config.branch;
      }

      // Add environment variables
      if (this.config.envVars && this.config.envVars.length > 0) {
        payload.env = Object.fromEntries(
          this.config.envVars.map(v => [v.key, v.value])
        );
      }

      // Create deploy
      const response = await this.request<NetlifyDeployResponse>(
        `/api/v1/sites/${this.siteId}/deploys`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );

      const deploy = response.deploy;

      return {
        success: true,
        url: deploy.deploy_url,
        deploymentId: deploy.id,
        timestamp: deploy.created_at,
      };
    } catch (error) {
      return this.handleError(error, 'Netlify deployment failed');
    }
  }

  /**
   * Create a new Netlify site
   */
  private async createSite(): Promise<NetlifySite> {
    const payload: Record<string, unknown> = {
      name: this.config.name || 'webbuilder-site',
      custom_domain: this.config.domain || undefined,
      ssl: this.config.ssl?.enabled ?? true,
      force_ssl: true,
    };

    const response = await this.request<{ site: NetlifySite }>(
      '/api/v1/sites',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );

    return response.site;
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

      const response = await this.request<NetlifyDeployResponse>(
        `/api/v1/sites/${this.siteId}/deploys/${deploymentId}`
      );

      const deploy = response.deploy;
      const statusMap: Record<string, DeploymentStatus['status']> = {
        uploading: 'pending',
        building: 'building',
        processing: 'deploying',
        ready: 'ready',
        error: 'error',
      };

      return {
        status: statusMap[deploy.state] || 'unknown',
        message: deploy.error_message || `Deployment is ${deploy.state}`,
        url: deploy.deploy_url,
        lastDeployed: deploy.updated_at || deploy.created_at,
        deploymentId: deploy.id,
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

      const response = await this.request<NetlifyDeployResponse>(
        `/api/v1/sites/${this.siteId}/deploys/${deploymentId}`
      );

      const deploy = response.deploy;
      const urls: string[] = [
        deploy.deploy_url,
        deploy.deploy_ssl_url,
        deploy.admin_url,
      ];

      if (deploy.review_url) {
        urls.push(deploy.review_url);
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
      if (options?.limit) queryParams.set('per_page', options.limit.toString());
      if (options?.target) queryParams.set('target', options.target);

      const response = await this.request<NetlifyDeploysResponse>(
        `/api/v1/sites/${this.siteId}/deploys?${queryParams.toString()}`
      );

      return response.deploys.map(d => ({
        id: d.id,
        url: d.deploy_url,
        state: d.state,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
        target: d.branch,
        meta: {
          title: d.title,
          commit_ref: d.commit_ref,
          error_message: d.error_message,
        },
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
      // Restore deploy (Netlify's rollback mechanism)
      const response = await this.request<NetlifyDeployResponse>(
        `/api/v1/sites/${this.siteId}/deploys/${deploymentId}/restore`,
        {
          method: 'POST',
        }
      );

      const deploy = response.deploy;

      return {
        success: true,
        url: deploy.deploy_url,
        deploymentId: deploy.id,
        timestamp: deploy.created_at,
      };
    } catch (error) {
      return this.handleError(error, 'Netlify rollback failed');
    }
  }

  /**
   * Set environment variables
   */
  async setEnvVars(envVars: EnvVar[]): Promise<EnvVarResult[]> {
    const results: EnvVarResult[] = [];

    if (!this.siteId) {
      return envVars.map(v => ({
        key: v.key,
        success: false,
        error: 'Site ID is required to set environment variables',
      }));
    }

    try {
      // Netlify uses account-level env vars with site scoping
      const payload: Record<string, NetlifyEnvVar> = {};
      for (const envVar of envVars) {
        payload[envVar.key] = {
          key: envVar.key,
          values: [{ value: envVar.value, context: 'all' }],
          scope: ['builds', 'functions', 'runtime', 'post-processing'],
        };
      }

      await this.request(
        `/api/v1/sites/${this.siteId}/env`,
        {
          method: 'PUT',
          body: JSON.stringify(payload),
        }
      );

      results.push(...envVars.map(v => ({ key: v.key, success: true })));
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      results.push(...envVars.map(v => ({ key: v.key, success: false, error: errorMsg })));
    }

    return results;
  }

  /**
   * Get environment variables
   */
  async getEnvVars(): Promise<EnvVar[]> {
    try {
      if (!this.siteId) return [];

      const response = await this.request<NetlifyEnvVarsResponse>(
        `/api/v1/sites/${this.siteId}/env`
      );

      return Object.values(response).map(e => ({
        key: e.key,
        value: e.values[0]?.value || '',
        isSecret: false,
        target: e.scope,
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

      const response = await this.request<{ log: Array<{ message: string; timestamp: string; level: string }> }>(
        `/api/v1/sites/${this.siteId}/deploys/${deploymentId}/log`
      );

      return response.log.slice(0, lines).map(log => ({
        timestamp: log.timestamp,
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