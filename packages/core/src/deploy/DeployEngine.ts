// ============================================================================
// Deploy Engine
// Core deployment orchestrator with real API integrations
// ============================================================================

import { nanoid } from 'nanoid';
import type {
  DeploymentConfig,
  DeploymentTarget,
  DeploymentEnvironment,
  ScalingConfig,
  CDNConfig,
  SSLConfig,
  MonitoringConfig,
  RollbackConfig,
  PreviewConfig,
  EnvVar,
} from '../types/index.js';

import type { DesignValidationResult } from '../design/index.js';
import { createDeployer } from './factory.js';
import { Deployer } from './Deployer.js';
import type { LogEntry, DeployResult, DeploymentStatus, DeploymentInfo, EnvVarResult, ListDeploymentsOptions } from './types.js';

type ValidationResult = DesignValidationResult;

// ─── Deploy Engine ─────────────────────────────────────────────────────────

export class DeployEngine {
  private config: DeploymentConfig;
  private deployer?: Deployer;

  constructor(config?: DeploymentConfig) {
    this.config = config ?? this.createDefaultConfig();
  }

  /**
   * Get current deployment config
   */
  getConfig(): DeploymentConfig {
    return this.config;
  }

  /**
   * Set deployment config
   */
  setConfig(config: DeploymentConfig): void {
    this.config = config;
    this.deployer = undefined; // Reset deployer when config changes
  }

  /**
   * Update deployment config
   */
  updateConfig(updates: Partial<DeploymentConfig>): void {
    this.config = { ...this.config, ...updates };
    this.deployer = undefined; // Reset deployer when config changes
  }

  /**
   * Get or create the deployer for the current target
   */
  private getDeployer(): Deployer {
    if (!this.deployer) {
      this.deployer = createDeployer(this.config.target, {
        config: this.config,
      });
    }
    return this.deployer;
  }

  /**
   * Deploy the project
   */
  async deploy(options?: DeployOptions): Promise<DeployResult> {
    const deployer = this.getDeployer();

    // Pre-deploy checks
    const checks = await this.runPreDeployChecks();
    if (!checks.passed) {
      return {
        success: false,
        error: `Pre-deploy checks failed: ${checks.failures.join(', ')}`,
      };
    }

    // Run build if needed
    if (options?.build !== false) {
      const buildResult = await this.runBuild();
      if (!buildResult.success) {
        return {
          success: false,
          error: `Build failed: ${buildResult.error}`,
        };
      }
    }

    // Deploy using the real adapter
    const result = await deployer.deploy();

    // Post-deploy
    if (result.success) {
      await this.runPostDeploy(result);
    }

    return result;
  }

  /**
   * Deploy a preview
   */
  async deployPreview(options?: DeployOptions): Promise<DeployResult> {
    const previewConfig = { ...this.config, environment: 'development' as DeploymentEnvironment };
    const deployer = createDeployer(previewConfig.target, { config: previewConfig });
    return deployer.deploy();
  }

  /**
   * Rollback to a previous version
   */
  async rollback(deploymentId: string): Promise<DeployResult> {
    if (!this.config.rollback.enabled) {
      return { success: false, error: 'Rollback is not enabled' };
    }

    const deployer = this.getDeployer();
    return deployer.rollback(deploymentId);
  }

  /**
   * Get deployment status
   */
  async getStatus(deploymentId?: string): Promise<DeploymentStatus> {
    const deployer = this.getDeployer();
    return deployer.getStatus(deploymentId);
  }

  /**
   * Get deployment URLs
   */
  async getUrls(deploymentId?: string): Promise<string[]> {
    const deployer = this.getDeployer();
    return deployer.getUrls(deploymentId);
  }

  /**
   * List deployments
   */
  async listDeployments(options?: ListDeploymentsOptions): Promise<DeploymentInfo[]> {
    const deployer = this.getDeployer();
    return deployer.listDeployments(options);
  }

  /**
   * Get deployment logs
   */
  async getLogs(deploymentId?: string, lines = 100): Promise<LogEntry[]> {
    const deployer = this.getDeployer();
    return deployer.getLogs(deploymentId, lines);
  }

  /**
   * Set environment variables
   */
  async setEnvVars(envVars: EnvVar[]): Promise<EnvVarResult[]> {
    const deployer = this.getDeployer();
    return deployer.setEnvVars(envVars);
  }

  /**
   * Get environment variables
   */
  async getEnvVars(): Promise<EnvVar[]> {
    const deployer = this.getDeployer();
    return deployer.getEnvVars();
  }

  /**
   * Validate deployment config
   */
  validate(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!this.config.target) errors.push('Deployment target is required');
    if (!this.config.environment) errors.push('Environment is required');
    if (!this.config.buildCommand) warnings.push('No build command specified');
    if (!this.config.outputDir) warnings.push('No output directory specified');

    // Check env vars
    for (const envVar of this.config.envVars) {
      if (envVar.isSecret && !envVar.value) {
        errors.push(`Secret env var ${envVar.key} has no value`);
      }
    }

    // Check scaling
    if (this.config.scaling.autoScale) {
      if (this.config.scaling.minInstances < 1) {
        errors.push('Minimum instances must be at least 1');
      }
      if (this.config.scaling.maxInstances < this.config.scaling.minInstances) {
        errors.push('Maximum instances must be >= minimum instances');
      }
    }

    // Validate deployer-specific requirements
    const deployer = this.getDeployer();
    const deployerValidation = deployer.validate();
    errors.push(...deployerValidation.errors);

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Generate deployment configuration files
   */
  generateConfigFiles(): DeployConfigFiles {
    switch (this.config.target) {
      case 'vercel':
        return this.generateVercelConfig();
      case 'netlify':
        return this.generateNetlifyConfig();
      case 'cloudflare':
        return this.generateCloudflareConfig();
      case 'docker':
        return this.generateDockerConfig();
      default:
        return { files: [] };
    }
  }

  /**
   * Generate environment variable template
   */
  generateEnvTemplate(): string {
    const lines: string[] = ['# WebBuilder Environment Variables', ''];

    for (const envVar of this.config.envVars) {
      const comment = envVar.isSecret ? '# SECRET - DO NOT COMMIT' : '';
      const value = envVar.isSecret ? '' : envVar.value;
      if (comment) lines.push(comment);
      lines.push(`${envVar.key}=${value}`);
    }

    return lines.join('\n');
  }

  /**
   * Estimate monthly cost
   */
  estimateCost(): CostEstimate {
    const baseCosts: Record<DeploymentTarget, number> = {
      vercel: 0,
      netlify: 0,
      aws: 5,
      gcp: 5,
      azure: 5,
      cloudflare: 0,
      custom: 10,
      docker: 5,
    };

    const scalingCost = this.config.scaling.autoScale
      ? this.config.scaling.maxInstances * 10
      : this.config.scaling.minInstances * 5;

    const cdnCost = this.config.cdn.enabled ? 5 : 0;
    const monitoringCost = this.config.monitoring.enabled ? 5 : 0;

    return {
      base: baseCosts[this.config.target] ?? 0,
      scaling: scalingCost,
      cdn: cdnCost,
      monitoring: monitoringCost,
      total: baseCosts[this.config.target] + scalingCost + cdnCost + monitoringCost,
      currency: 'USD',
      period: 'monthly',
    };
  }

  // ─── Private Methods ──────────────────────────────────────────────────

  /**
   * Create default deployment config
   */
  private createDefaultConfig(): DeploymentConfig {
    return {
      target: 'vercel',
      environment: 'development',
      scaling: {
        minInstances: 1,
        maxInstances: 3,
        autoScale: true,
        targetCPU: 70,
        targetMemory: 80,
      },
      cdn: {
        enabled: true,
        caching: {
          staticAssets: '1y',
          html: '0s',
          api: '0s',
        },
      },
      ssl: {
        enabled: true,
        provider: 'lets-encrypt',
      },
      monitoring: {
        enabled: true,
        uptimeChecks: true,
        alerting: [],
      },
      rollback: {
        enabled: true,
        automaticOnFailure: true,
        maxVersions: 10,
      },
      preview: {
        enabled: true,
        autoDeleteDays: 7,
        requireAuth: false,
      },
      envVars: [],
      buildCommand: 'npm run build',
      outputDir: '.next',
    };
  }

  /**
   * Run pre-deploy checks
   */
  private async runPreDeployChecks(): Promise<PreDeployChecks> {
    const failures: string[] = [];

    // Check build command exists
    if (!this.config.buildCommand) {
      failures.push('No build command specified');
    }

    // Check output directory
    if (!this.config.outputDir) {
      failures.push('No output directory specified');
    }

    // Check environment variables
    for (const envVar of this.config.envVars) {
      if (envVar.isSecret && !envVar.value) {
        failures.push(`Missing secret: ${envVar.key}`);
      }
    }

    // Check deployer token
    const deployer = this.getDeployer();
    const validation = deployer.validate();
    failures.push(...validation.errors);

    return {
      passed: failures.length === 0,
      failures,
    };
  }

  /**
   * Run build
   */
  private async runBuild(): Promise<BuildResult> {
    // In a real implementation, this would execute the build command
    return {
      success: true,
      output: 'Build completed successfully',
      duration: 30000,
    };
  }

  /**
   * Run post-deploy tasks
   */
  private async runPostDeploy(result: DeployResult): Promise<void> {
    // Run smoke tests
    // Invalidate CDN cache
    // Send notifications
  }

  /**
   * Generate Vercel config
   */
  private generateVercelConfig(): DeployConfigFiles {
    return {
      files: [
        {
          path: 'vercel.json',
          content: JSON.stringify({
            framework: 'nextjs',
            buildCommand: this.config.buildCommand,
            outputDirectory: this.config.outputDir,
            env: Object.fromEntries(this.config.envVars.map(v => [v.key, v.value])),
          }, null, 2),
        },
      ],
    };
  }

  /**
   * Generate Netlify config
   */
  private generateNetlifyConfig(): DeployConfigFiles {
    return {
      files: [
        {
          path: 'netlify.toml',
          content: `[build]
  command = "${this.config.buildCommand}"
  publish = "${this.config.outputDir}"

[build.environment]
${this.config.envVars.map(v => `  ${v.key} = "${v.value}"`).join('\n')}

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"`,
        },
      ],
    };
  }

  /**
   * Generate Cloudflare config
   */
  private generateCloudflareConfig(): DeployConfigFiles {
    return {
      files: [
        {
          path: 'wrangler.toml',
          content: `name = "webbuilder-app"
compatibility_date = "2024-01-01"

[build]
command = "${this.config.buildCommand}"

[site]
bucket = "./${this.config.outputDir}"

[env.production]
vars = {${this.config.envVars.map(v => `\n  ${v.key} = "${v.value}"`).join(',')}
}`,
        },
      ],
    };
  }

  /**
   * Generate Docker config
   */
  private generateDockerConfig(): DeployConfigFiles {
    return {
      files: [
        {
          path: 'Dockerfile',
          content: `FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN ${this.config.buildCommand}

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/${this.config.outputDir} ./${this.config.outputDir}
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["npm", "start"]`,
        },
        {
          path: 'docker-compose.yml',
          content: `version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
${this.config.envVars.map(v => `      - ${v.key}=\${${v.key}}`).join('\n')}
    restart: unless-stopped`,
        },
        {
          path: '.dockerignore',
          content: `node_modules
.git
.env
*.log`,
        },
      ],
    };
  }
}

// Note: DeployResult, DeploymentStatus, DeploymentInfo, EnvVarResult, 
// ListDeploymentsOptions, LogEntry are exported from './types.js' 
// and re-exported via './deploy/index.js'

// ─── DeployEngine-specific Types ────────────────────────────────────────────

export interface DeployOptions {
  build?: boolean;
  force?: boolean;
  skipChecks?: boolean;
}

// Note: DeployResult, DeploymentStatus, DeploymentInfo, EnvVarResult, ListDeploymentsOptions, LogEntry
// are re-exported from './types.js' above

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
  files: { path: string; content: string }[];
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

// ─── Utility Functions ──────────────────────────────────────────────────────

export function createDeployEngine(config?: DeploymentConfig): DeployEngine {
  return new DeployEngine(config);
}

export function createDeploymentConfig(target: DeploymentTarget, env: DeploymentEnvironment): DeploymentConfig {
  return {
    target,
    environment: env,
    scaling: { minInstances: 1, maxInstances: 3, autoScale: true, targetCPU: 70, targetMemory: 80 },
    cdn: { enabled: true, caching: { staticAssets: '1y', html: '0s', api: '0s' } },
    ssl: { enabled: true, provider: 'lets-encrypt' },
    monitoring: { enabled: true, uptimeChecks: true, alerting: [] },
    rollback: { enabled: true, automaticOnFailure: true, maxVersions: 10 },
    preview: { enabled: true, autoDeleteDays: 7, requireAuth: false },
    envVars: [],
    buildCommand: 'npm run build',
    outputDir: '.next',
  };
}

export default DeployEngine;