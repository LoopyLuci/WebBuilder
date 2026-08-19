// ============================================================================
// Deployer Base Class
// ============================================================================

import type { DeploymentConfig, EnvVar } from '../types/index.js';
import type { DeployResult, DeploymentStatus, DeploymentInfo, EnvVarResult, ListDeploymentsOptions, LogEntry } from './types.js';

export abstract class Deployer {
  protected config: DeploymentConfig;
  protected token: string;

  constructor(config: DeploymentConfig, token: string) {
    this.config = config;
    this.token = token;
  }

  abstract deploy(): Promise<DeployResult>;
  abstract getStatus(deploymentId?: string): Promise<DeploymentStatus>;
  abstract getUrls(deploymentId?: string): Promise<string[]>;
  abstract listDeployments(options?: ListDeploymentsOptions): Promise<DeploymentInfo[]>;
  abstract rollback(deploymentId: string): Promise<DeployResult>;
  abstract setEnvVars(envVars: EnvVar[]): Promise<EnvVarResult[]>;
  abstract getEnvVars(): Promise<EnvVar[]>;
  abstract getLogs(deploymentId?: string, lines?: number): Promise<LogEntry[]>;
  abstract getApiBaseUrl(): string;
  abstract getTokenName(): string;
  abstract getDefaultDomain(): string;

  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!this.token) errors.push(`${this.getTokenName()} environment variable is required`);
    if (!this.config.outputDir) errors.push('Output directory is required');
    return { valid: errors.length === 0, errors };
  }

  protected getHeaders(): Record<string, string> {
    return { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' };
  }

  protected handleError(error: unknown, context: string): DeployResult {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: `${context}: ${message}` };
  }

  protected async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.getApiBaseUrl()}${path}`;
    const response = await fetch(url, {
      ...options,
      headers: { ...this.getHeaders(), ...(options.headers as Record<string, string> || {}) },
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`HTTP ${response.status}: ${body}`);
    }
    return response.json() as Promise<T>;
  }

  protected getDomain(): string {
    return this.config.domain || this.getDefaultDomain();
  }
}
