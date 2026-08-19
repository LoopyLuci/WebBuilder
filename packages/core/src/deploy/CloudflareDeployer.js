// ============================================================================
// Cloudflare Deployer Adapter
// Integrates with Cloudflare Pages API for real deployments
// Requires CF_API_TOKEN environment variable
// ============================================================================
import { Deployer } from './Deployer.js';
/**
 * Cloudflare Deployer - Real API integration
 */
export class CloudflareDeployer extends Deployer {
    accountId;
    projectName;
    constructor(config, token, accountId, projectName) {
        super(config, token);
        this.accountId = accountId;
        this.projectName = projectName;
    }
    getApiBaseUrl() {
        return 'https://api.cloudflare.com/client/v4';
    }
    getTokenName() {
        return 'CF_API_TOKEN';
    }
    getDefaultDomain() {
        return 'pages.dev';
    }
    /**
     * Deploy to Cloudflare Pages
     * Supports both git-based and direct upload deployments
     */
    async deploy() {
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
            const payload = {
                ...(this.config.branch ? { branch: this.config.branch } : {}),
            };
            if (this.config.files) {
                const manifest = {};
                for (const file of this.config.files) {
                    manifest[file.path] = file.content;
                }
                payload.manifest = manifest;
            }
            // Add environment variables
            if (this.config.envVars && this.config.envVars.length > 0) {
                payload.env_vars = Object.fromEntries(this.config.envVars.map(v => [v.key, { value: v.value, type: 'plain_text' }]));
            }
            // Create deployment
            const response = await this.request(`/accounts/${this.accountId}/pages/projects/${this.projectName}/deployments`, {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            const deployment = response.result;
            return {
                success: true,
                url: deployment.url,
                deploymentId: deployment.id,
                timestamp: deployment.created_on,
            };
        }
        catch (error) {
            return this.handleError(error, 'Cloudflare deployment failed');
        }
    }
    /**
     * Create a new Cloudflare Pages project
     */
    async createProject() {
        const payload = {
            name: this.config.name || 'webbuilder-project',
            production_branch: this.config.branch || 'main',
            build_config: {
                build_command: this.config.buildCommand || '',
                destination_dir: this.config.outputDir || '',
                root_dir: '',
            },
            deployment_configs: {
                production: {
                    env_vars: Object.fromEntries((this.config.envVars || []).map(v => [
                        v.key,
                        { value: v.value, type: 'plain_text' },
                    ])),
                    compatibility_date: new Date().toISOString().split('T')[0],
                    compatibility_flags: [],
                    fail_open: false,
                    always_use_latest_compatibility_date: false,
                    usage_model: 'bundled',
                    placement: { mode: 'smart' },
                },
                preview: {
                    env_vars: Object.fromEntries((this.config.envVars || []).map(v => [
                        v.key,
                        { value: v.value, type: 'plain_text' },
                    ])),
                    compatibility_date: new Date().toISOString().split('T')[0],
                    compatibility_flags: [],
                    fail_open: false,
                    always_use_latest_compatibility_date: false,
                    usage_model: 'bundled',
                    placement: { mode: 'smart' },
                },
            },
        };
        const response = await this.request(`/accounts/${this.accountId}/pages/projects`, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        return response.result;
    }
    /**
     * Get deployment status
     */
    async getStatus(deploymentId) {
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
            const response = await this.request(`/accounts/${this.accountId}/pages/projects/${this.projectName}/deployments/${deploymentId}`);
            const deployment = response.result;
            const statusMap = {
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
        }
        catch (error) {
            return {
                status: 'error',
                message: error instanceof Error ? error.message : String(error),
            };
        }
    }
    /**
     * Get deployment URLs
     */
    async getUrls(deploymentId) {
        try {
            if (!deploymentId) {
                const deployments = await this.listDeployments({ limit: 1 });
                if (deployments.length === 0)
                    return [];
                deploymentId = deployments[0].id;
            }
            const response = await this.request(`/accounts/${this.accountId}/pages/projects/${this.projectName}/deployments/${deploymentId}`);
            const deployment = response.result;
            const urls = [deployment.url];
            // Add aliases
            if (deployment.aliases && deployment.aliases.length > 0) {
                urls.push(...deployment.aliases);
            }
            return urls;
        }
        catch {
            return [];
        }
    }
    /**
     * List deployments
     */
    async listDeployments(options) {
        try {
            const queryParams = new URLSearchParams();
            if (options?.limit)
                queryParams.set('per_page', options.limit.toString());
            if (options?.target)
                queryParams.set('env', options.target);
            const response = await this.request(`/accounts/${this.accountId}/pages/projects/${this.projectName}/deployments?${queryParams.toString()}`);
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
        }
        catch {
            return [];
        }
    }
    /**
     * Rollback to a previous deployment
     */
    async rollback(deploymentId) {
        try {
            // Cloudflare Pages rollback is done by redeploying from a previous deployment
            const response = await this.request(`/accounts/${this.accountId}/pages/projects/${this.projectName}/deployments/${deploymentId}/rollback`, {
                method: 'POST',
            });
            const deployment = response.result;
            return {
                success: true,
                url: deployment.url,
                deploymentId: deployment.id,
                timestamp: deployment.created_on,
            };
        }
        catch (error) {
            return this.handleError(error, 'Cloudflare rollback failed');
        }
    }
    /**
     * Set environment variables
     */
    async setEnvVars(envVars) {
        const results = [];
        if (!this.accountId || !this.projectName) {
            return envVars.map(v => ({
                key: v.key,
                success: false,
                error: 'Account ID and project name are required to set environment variables',
            }));
        }
        try {
            // Get current project to preserve existing env vars
            const projectResponse = await this.request(`/accounts/${this.accountId}/pages/projects/${this.projectName}`);
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
            await this.request(`/accounts/${this.accountId}/pages/projects/${this.projectName}`, {
                method: 'PATCH',
                body: JSON.stringify(payload),
            });
            results.push(...envVars.map(v => ({ key: v.key, success: true })));
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            results.push(...envVars.map(v => ({ key: v.key, success: false, error: errorMsg })));
        }
        return results;
    }
    /**
     * Get environment variables
     */
    async getEnvVars() {
        try {
            if (!this.accountId || !this.projectName)
                return [];
            const response = await this.request(`/accounts/${this.accountId}/pages/projects/${this.projectName}`);
            const project = response.result;
            const envVars = project.deployment_configs?.production?.env_vars || {};
            return Object.entries(envVars).map(([key, value]) => ({
                key,
                value: value.value,
                isSecret: value.type === 'secret_text',
                target: ['production'],
            }));
        }
        catch {
            return [];
        }
    }
    /**
     * Get deployment logs
     */
    async getLogs(deploymentId, lines = 100) {
        try {
            if (!deploymentId) {
                const deployments = await this.listDeployments({ limit: 1 });
                if (deployments.length === 0)
                    return [];
                deploymentId = deployments[0].id;
            }
            const response = await this.request(`/accounts/${this.accountId}/pages/projects/${this.projectName}/deployments/${deploymentId}/history/stages`);
            const logs = [];
            if (response.result?.steps) {
                for (const step of response.result.steps) {
                    logs.push({
                        timestamp: step.started_on,
                        message: `Stage: ${step.name} - ${step.status}`,
                        level: step.status === 'success' ? 'info' : step.status === 'failure' ? 'error' : 'debug',
                    });
                }
            }
            return logs.slice(0, lines);
        }
        catch {
            return [];
        }
    }
}
//# sourceMappingURL=CloudflareDeployer.js.map