// ============================================================================
// Netlify Deployer Adapter
// Integrates with Netlify REST API for real deployments
// Requires NETLIFY_TOKEN environment variable
// ============================================================================
import { Deployer } from './Deployer.js';
/**
 * Netlify Deployer - Real API integration
 */
export class NetlifyDeployer extends Deployer {
    siteId;
    constructor(config, token, siteId) {
        super(config, token);
        this.siteId = siteId;
    }
    getApiBaseUrl() {
        return 'https://api.netlify.com';
    }
    getTokenName() {
        return 'NETLIFY_TOKEN';
    }
    getDefaultDomain() {
        return 'netlify.app';
    }
    /**
     * Deploy to Netlify
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
            // Create site if no siteId provided
            if (!this.siteId) {
                const site = await this.createSite();
                this.siteId = site.id;
            }
            // Prepare deployment payload
            const payload = {
                files: {},
            };
            // Add files for direct upload
            if (this.config.files && this.config.files.length > 0) {
                const files = {};
                for (const file of this.config.files) {
                    files[file.path] = file.content;
                }
                payload.files = files;
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
                payload.env = Object.fromEntries(this.config.envVars.map(v => [v.key, v.value]));
            }
            // Create deploy
            const response = await this.request(`/api/v1/sites/${this.siteId}/deploys`, {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            const deploy = response.deploy;
            return {
                success: true,
                url: deploy.deploy_url,
                deploymentId: deploy.id,
                timestamp: deploy.created_at,
            };
        }
        catch (error) {
            return this.handleError(error, 'Netlify deployment failed');
        }
    }
    /**
     * Create a new Netlify site
     */
    async createSite() {
        const payload = {
            name: this.config.name || 'webbuilder-site',
            custom_domain: this.config.domain || undefined,
            ssl: this.config.ssl?.enabled ?? true,
            force_ssl: true,
        };
        const response = await this.request('/api/v1/sites', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        return response.site;
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
            const response = await this.request(`/api/v1/sites/${this.siteId}/deploys/${deploymentId}`);
            const deploy = response.deploy;
            const statusMap = {
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
            const response = await this.request(`/api/v1/sites/${this.siteId}/deploys/${deploymentId}`);
            const deploy = response.deploy;
            const urls = [
                deploy.deploy_url,
                deploy.deploy_ssl_url,
                deploy.admin_url,
            ];
            if (deploy.review_url) {
                urls.push(deploy.review_url);
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
                queryParams.set('target', options.target);
            const response = await this.request(`/api/v1/sites/${this.siteId}/deploys?${queryParams.toString()}`);
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
            // Restore deploy (Netlify's rollback mechanism)
            const response = await this.request(`/api/v1/sites/${this.siteId}/deploys/${deploymentId}/restore`, {
                method: 'POST',
            });
            const deploy = response.deploy;
            return {
                success: true,
                url: deploy.deploy_url,
                deploymentId: deploy.id,
                timestamp: deploy.created_at,
            };
        }
        catch (error) {
            return this.handleError(error, 'Netlify rollback failed');
        }
    }
    /**
     * Set environment variables
     */
    async setEnvVars(envVars) {
        const results = [];
        if (!this.siteId) {
            return envVars.map(v => ({
                key: v.key,
                success: false,
                error: 'Site ID is required to set environment variables',
            }));
        }
        try {
            // Netlify uses account-level env vars with site scoping
            const payload = {};
            for (const envVar of envVars) {
                payload[envVar.key] = {
                    key: envVar.key,
                    values: [{ value: envVar.value, context: 'all' }],
                    scope: ['builds', 'functions', 'runtime', 'post-processing'],
                };
            }
            await this.request(`/api/v1/sites/${this.siteId}/env`, {
                method: 'PUT',
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
            if (!this.siteId)
                return [];
            const response = await this.request(`/api/v1/sites/${this.siteId}/env`);
            return Object.values(response).map(e => ({
                key: e.key,
                value: e.values[0]?.value || '',
                isSecret: false,
                target: e.scope,
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
            const response = await this.request(`/api/v1/sites/${this.siteId}/deploys/${deploymentId}/log`);
            return response.log.slice(0, lines).map(log => ({
                timestamp: log.timestamp,
                message: log.message,
                level: (['info', 'warn', 'error', 'debug'].includes(log.level)
                    ? log.level
                    : 'info'),
            }));
        }
        catch {
            return [];
        }
    }
}
//# sourceMappingURL=NetlifyDeployer.js.map