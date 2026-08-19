// ============================================================================
// Deployer Base Class
// Abstract base for all deployment adapters
// ============================================================================

import type {
  DeploymentConfig,
  EnvVar,
} from '../types/index.js';

import type {
  DeployResult,
  DeploymentStatus,
  DeploymentInfo,
  EnvVarResult,
  ListDeploymentsOptions,
  LogEntry,
} from './types.js';

/**
 * Base class for deployment adapters
 * Handles common functionality like error handling and token resolution
 */
export abstract class Deployer {
  protected config: DeploymentConfig;
  protected token: string;

  constructor(config: DeploymentConfig, token: string) {
    this.config = config;
    this.token = token;
  }

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
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.token) {
      errors.push(`${this.getTokenName()} environment variable is required`);
    }

    if (!this.config.outputDir) {
      errors.push('Output directory is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Create standard headers for API requests
   */
  protected getHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Handle API errors consistently
   */
  protected handleError(error: unknown, context: string): DeployResult {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `${context}: ${message}`,
    };
  }

  /**
   * Make an authenticated API request
   */
  protected async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.getApiBaseUrl()}${path}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...(options.headers as Record<string, string> || {}),
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`HTTP ${response.status}: ${body}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Get domain from config or generate default
   */
  protected getDomain(): string {
    return this.config.domain || this.getDefaultDomain();
  }
}

// ============================================================================
// Deployer Factory
// ============================================================================

import { VercelDeployer } from './VercelDeployer.js';
import { NetlifyDeployer } from './NetlifyDeployer.js';
import { CloudflareDeployer } from './CloudflareDeployer.js';
import type { DeploymentTarget } from '../types/index.js';

export interface DeployerOptions {
  config: DeploymentConfig;
  token?: string;
  projectId?: string;
  siteId?: string;
  teamId?: string;
  accountId?: string;
  projectName?: string;
}

/**
 * Factory function to create the appropriate deployer based on target
 */
export function createDeployer(target: DeploymentTarget, options: DeployerOptions): Deployer {
  const { config, token, projectId, siteId, teamId, accountId, projectName } = options;

  // Resolve token from env if not provided
  const resolvedToken = token || getTokenFromEnv(target);

  switch (target) {
    case 'vercel':
      return new VercelDeployer(config, resolvedToken, projectId, teamId);
    case 'netlify':
      return new NetlifyDeployer(config, resolvedToken, siteId);
    case 'cloudflare':
      return new CloudflareDeployer(config, resolvedToken, accountId, projectName);
    default:
      throw new Error(`Unsupported deployment target: ${target}`);
  }
}

/**
 * Get the token from environment variables based on deployment target
 */
function getTokenFromEnv(target: DeploymentTarget): string {
  const tokenMap: Record<string, string> = {
    vercel: process.env.VERCEL_TOKEN || '',
    netlify: process.env.NETLIFY_TOKEN || '',
    cloudflare: process.env.CF_API_TOKEN || '',
  };

  return tokenMap[target] || '';
}

// Re-export deployer classes
export { VercelDeployer } from './VercelDeployer.js';
export { NetlifyDeployer } from './NetlifyDeployer.js';
export { CloudflareDeployer } from './CloudflareDeployer.js';