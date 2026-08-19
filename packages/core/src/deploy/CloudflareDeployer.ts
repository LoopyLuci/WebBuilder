// ============================================================================
// Cloudflare Deployer Adapter
// Integrates with Cloudflare Pages API for real deployments
// Requires CF_API_TOKEN environment variable
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
 * Cloudflare API response types
 */
interface CloudflareProject {
  name: string;
  id: string;
  subdomain: string;
  domains: string[];
  source: {
    type: string;
    config: {
      owner: string;
      repo_name: string;
      production_branch: string;
      pr_comments_enabled: boolean;
      deployments_enabled: boolean;
    };
  };
  build_config: {
    build_command: string;
    destination_dir: string;
    root_dir: string;
  };
  deployment_configs: Record<string, {
    env_vars: Record<string, { value: string; type: string }>;
    kv_namespaces: Record<string, string>;
    r2_buckets: Record<string, string>;
    d1_databases: Record<string, string>;
    compatibility_date: string;
    compatibility_flags: string[];
    fail_open: boolean;
    always_use_latest_compatibility_date: boolean;
    usage_model: string;
    placement: { mode: string };
  }>;
  created_on: string;
  modified_on: string;
}

interface CloudflareDeployment {
  id: string;
  short_id: string;
  project_id: string;
  project_name: string;
  environment: string;
  url: string;
  created_on: string;
  modified_on: string;
  status: 'active' | 'pending_deploy' | 'new' | 'inactive';
  latest_stage: {
    name: string;
    status: string;
    started_on: string;
    ended_on: string;
  };
  deployment_trigger: {
    type: string;
    metadata: {
      branch: string;
      commit_hash: string;
      commit_message: string;
    };
  };
  env_vars: Record<string, { value: string; type: string }>;
  aliases: string[];
}

interface CloudflareDeploymentsResponse {
  result: CloudflareDeployment[];
  success: boolean;
  errors: string[];
  messages: string[];
}

interface CloudflareProjectResponse {
  result: CloudflareProject;
  success: boolean;
  errors: string[];
  messages: string[];
}

interface CloudflareDeploymentResponse {
  result: CloudflareDeployment;
  success: boolean;
  errors: string[];
  messages: string[];
}

/**
 * Cloudflare Deployer - Real API integration
 */
export class CloudflareDeployer extends Deployer {
  private accountId?: string;
  private projectName?: string;

  constructor(config: DeploymentConfig, token: string, accountId?: string, projectName?: string) {
    super(config, token);
    this.accountId = accountId;
    this.projectName = projectName;
  }

  getApiBaseUrl(): string {
    return 'https://api.cloudflare.com/client/v4';
  }

  getTokenName(): string {
    return 'CF_API_TOKEN';
  }

  getDefaultDomain(): string {
    return 'pages.dev';
  }

  /**
   * Deploy to Cloudflare Pages
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

      if (!this.accountId) {
        return {
          success: false,
          error: 'Account ID is required for Cloudflare deployments',
        };
      }

      // Create project if no projectName provided
      if (!this.projectName) {
        const project = await this.createProject();
        this.projectName = project.name;
      }

      // Prepare deployment payload
      const payload: Record<string, unknown> = {
        branch: this.config.branch || 'main',
      };

      // Add files for direct upload
      if (this.config.files && this.config.files.length > 0) {
        payload.manifest = {};
        for (const file of this.config.files) {
          payload.manifest = {
            ...payload.manifest,
            [file.path]: file.content,
          };
        }
      }

      // Add environment variables
      if (this.config.envVars && this.config.envVars.length > 0) {
        payload.env_vars = Object.fromEntries(
          this.config.envVars.map(v => [v.key, { value: v.value, type: 'plain_text' }])
        );
      }

      // Create deployment
      const response = await this.request<CloudflareDeploymentResponse>(
        `/accounts/${this.accountId}/pages/projects/${this.projectName}/deployments`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );

      const deployment = response.result;

      return {
        success: true,
        url: deployment.url,
        deploymentId: deployment.id,
        timestamp: deployment.created_on,
      };
    } catch (error) {
      return this.handleError(error, 'Cloudflare deployment failed');
    }
  }

  /**
   * Create a new Cloudflare Pages project
   */
  private async createProject(): Promise<CloudflareProject> {
    const payload: Record<string, unknown> = {
      name: this.config.name || 'webbuilder-project',
      production_branch: this.config.branch || 'main',
      build_config: {
        build_command: this.config.buildCommand || '',
        destination_dir: this.config.outputDir || '',
        root_dir: '',
      },
      deployment_configs: {
        production: {
          env_vars: Object.fromEntries(
            (this.config.envVars || []).map(v => [
              v.key,
              { value: v.value, type: 'plain_text' },
            ])
          ),
          compatibility_date: new Date().toISOString().split('T')[0],
          compatibility_flags: [],
          fail_open: false,
          always_use_latest_compatibility_date: false,
          usage_model: 'bundled',
          placement: { mode: 'smart' },
        },
        preview: {
          env_vars: Object.fromEntries(
            (this.config.envVars || []).map(v => [
              v.key,
              { value: v.value, type: 'plain_text' },
            ])
          ),
          compatibility_date: new Date().toISOString().split('T')[0],
          compatibility_flags: [],
          fail_open: false,
          always_use_latest_compatibility_date: false,
          usage_model: 'bundled',
          placement: { mode: 'smart' },
        },
      },
    };

    const response = await this.request<CloudflareProjectResponse>(
      `/accounts/${this.accountId}/pages/projects`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );

    return response.result;
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

      const response = await this.request<CloudflareDeploymentResponse>(
        `/accounts/${this.accountId}/pages/projects/${this.projectName}/deployments/${deploymentId}`
      );

      const deployment = response.result;
      const statusMap: Record<string, DeploymentStatus['status']> = {
        active: 'ready',
        pending_deploy: 'building',
        new: 'pending',
        inactive: 'error',
      };

      return {
        status: statusMap[deployment.status] || 'unknown',
        message: `Deployment is ${deployment.status}`,
        url: deployment.url,
        lastDeployed: deployment.modified_on || deployment.created_on,
        deploymentId: deployment.id,
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

      const response = await this.request<CloudflareDeploymentResponse>(
        `/accounts/${this.accountId}/pages/projects/${this.projectName}/deployments/${deploymentId}`
      );

      const deployment = response.result;
      const urls: string[] = [deployment.url];

      // Add aliases
      if (deployment.aliases && deployment.aliases.length > 0) {
        urls.push(...deployment.aliases);
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
      if (options?.target) queryParams.set('env', options.target);

      const response = await this.request<CloudflareDeploymentsResponse>(
        `/accounts/${this.accountId}/pages/projects/${this.projectName}/deployments?${queryParams.toString()}`
      );

      return response.result.map(d => ({
        id: d.id,
        url: d.url,
        state: d.status,
        createdAt: d.created_on,
        updatedAt: d.modified_on,
        target: d.environment,
        meta: {
          short_id: d.short_id,
          branch: d.deployment_trigger?.metadata?.branch,
          commit_hash: d.deployment_trigger?.metadata?.commit_hash,
          commit_message: d.deployment_trigger?.metadata?.commit_message,
          stage: d.latest_stage?.name,
          stage_status: d.latest_stage?.status,
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
      // Cloudflare Pages rollback is done by redeploying from a previous deployment
      const response = await this.request<CloudflareDeploymentResponse>(
        `/accounts/${this.accountId}/pages/projects/${this.projectName}/deployments/${deploymentId}/rollback`,
        {
          method: 'POST',
        }
      );

      const deployment = response.result;

      return {
        success: true,
        url: deployment.url,
        deploymentId: deployment.id,
        timestamp: deployment.created_on,
      };
    } catch (error) {
      return this.handleError(error, 'Cloudflare rollback failed');
    }
  }

  /**
   * Set environment variables
   */
  async setEnvVars(envVars: EnvVar[]): Promise<EnvVarResult[]> {
    const results: EnvVarResult[] = [];

    if (!this.accountId || !this.projectName) {
      return envVars.map(v => ({
        key: v.key,
        success: false,
        error: 'Account ID and project name are required to set environment variables',
      }));
    }

    try {
      // Get current project to preserve existing env vars
      const projectResponse = await this.request<CloudflareProjectResponse>(
        `/accounts/${this.accountId}/pages/projects/${this.projectName}`
      );

      const project = projectResponse.result;
      const currentEnvVars = project.deployment_configs?.production?.env_vars || {};

      // Merge with new env vars
      const updatedEnvVars = { ...currentEnvVars };
      for (const envVar of envVars) {
        updatedEnvVars[envVar.key] = {
          value: envVar.value,
          type: envVar.isSecret ? 'secret_text' : 'plain_text',
        };
      }

      // Update project with new env vars
      const payload = {
        deployment_configs: {
          production: {
            ...project.deployment_configs?.production,
            env_vars: updatedEnvVars,
          },
          preview: {
            ...project.deployment_configs?.preview,
            env_vars: updatedEnvVars,
          },
        },
      };

      await this.request(
        `/accounts/${this.accountId}/pages/projects/${this.projectName}`,
        {
          method: 'PATCH',
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
      if (!this.accountId || !this.projectName) return [];

      const response = await this.request<CloudflareProjectResponse>(
        `/accounts/${this.accountId}/pages/projects/${this.projectName}`
      );

      const project = response.result;
      const envVars = project.deployment_configs?.production?.env_vars || {};

      return Object.entries(envVars).map(([key, value]) => ({
        key,
        value: value.value,
        isSecret: value.type === 'secret_text',
        target: ['production'],
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

      const response = await this.request<{ result: { steps: Array<{ name: string; status: string; started_on: string; end_on: string }> } }>(
        `/accounts/${this.accountId}/pages/projects/${this.projectName}/deployments/${deploymentId}/history/stages`
      );

      const logs: LogEntry[] = [];
      for (const step of response.result.steps) {
        logs.push({
          timestamp: step.started_on,
          message: `Stage: ${step.name} - ${step.status}`,
          level: step.status === 'success' ? 'info' : step.status === 'failure' ? 'error' : 'debug',
        });
      }

      return logs.slice(0, lines);
    } catch {
      return [];
    }
  }
}