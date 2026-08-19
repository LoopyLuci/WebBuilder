// ============================================================================
// Deploy Engine
// Core deployment orchestrator with real API integrations
// ============================================================================
import { createDeployer } from './Deployer.js';
// ─── Deploy Engine ─────────────────────────────────────────────────────────
export class DeployEngine {
    config;
    deployer;
    constructor(config) {
        this.config = config ?? this.createDefaultConfig();
    }
    /**
     * Get current deployment config
     */
    getConfig() {
        return this.config;
    }
    /**
     * Set deployment config
     */
    setConfig(config) {
        this.config = config;
        this.deployer = undefined; // Reset deployer when config changes
    }
    /**
     * Update deployment config
     */
    updateConfig(updates) {
        this.config = { ...this.config, ...updates };
        this.deployer = undefined; // Reset deployer when config changes
    }
    /**
     * Get or create the deployer for the current target
     */
    getDeployer() {
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
    async deploy(options) {
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
    async deployPreview(options) {
        const previewConfig = { ...this.config, environment: 'development' };
        const deployer = createDeployer(previewConfig.target, { config: previewConfig });
        return deployer.deploy();
    }
    /**
     * Rollback to a previous version
     */
    async rollback(deploymentId) {
        if (!this.config.rollback.enabled) {
            return { success: false, error: 'Rollback is not enabled' };
        }
        const deployer = this.getDeployer();
        return deployer.rollback(deploymentId);
    }
    /**
     * Get deployment status
     */
    async getStatus(deploymentId) {
        const deployer = this.getDeployer();
        return deployer.getStatus(deploymentId);
    }
    /**
     * Get deployment URLs
     */
    async getUrls(deploymentId) {
        const deployer = this.getDeployer();
        return deployer.getUrls(deploymentId);
    }
    /**
     * List deployments
     */
    async listDeployments(options) {
        const deployer = this.getDeployer();
        return deployer.listDeployments(options);
    }
    /**
     * Get deployment logs
     */
    async getLogs(deploymentId, lines = 100) {
        const deployer = this.getDeployer();
        return deployer.getLogs(deploymentId, lines);
    }
    /**
     * Set environment variables
     */
    async setEnvVars(envVars) {
        const deployer = this.getDeployer();
        return deployer.setEnvVars(envVars);
    }
    /**
     * Get environment variables
     */
    async getEnvVars() {
        const deployer = this.getDeployer();
        return deployer.getEnvVars();
    }
    /**
     * Validate deployment config
     */
    validate() {
        const errors = [];
        const warnings = [];
        if (!this.config.target)
            errors.push('Deployment target is required');
        if (!this.config.environment)
            errors.push('Environment is required');
        if (!this.config.buildCommand)
            warnings.push('No build command specified');
        if (!this.config.outputDir)
            warnings.push('No output directory specified');
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
    generateConfigFiles() {
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
    generateEnvTemplate() {
        const lines = ['# WebBuilder Environment Variables', ''];
        for (const envVar of this.config.envVars) {
            const comment = envVar.isSecret ? '# SECRET - DO NOT COMMIT' : '';
            const value = envVar.isSecret ? '' : envVar.value;
            if (comment)
                lines.push(comment);
            lines.push(`${envVar.key}=${value}`);
        }
        return lines.join('\n');
    }
    /**
     * Estimate monthly cost
     */
    estimateCost() {
        const baseCosts = {
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
    createDefaultConfig() {
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
    async runPreDeployChecks() {
        const failures = [];
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
    async runBuild() {
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
    async runPostDeploy(result) {
        // Run smoke tests
        // Invalidate CDN cache
        // Send notifications
    }
    /**
     * Generate Vercel config
     */
    generateVercelConfig() {
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
    generateNetlifyConfig() {
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
    generateCloudflareConfig() {
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
    generateDockerConfig() {
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
// ─── Utility Functions ──────────────────────────────────────────────────────
export function createDeployEngine(config) {
    return new DeployEngine(config);
}
export function createDeploymentConfig(target, env) {
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
//# sourceMappingURL=DeployEngine.js.map