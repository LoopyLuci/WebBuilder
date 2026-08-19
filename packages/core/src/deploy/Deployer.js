// ============================================================================
// Deployer Base Class
// Abstract base for all deployment adapters
// ============================================================================
/**
 * Base class for deployment adapters
 * Handles common functionality like error handling and token resolution
 */
export class Deployer {
    config;
    token;
    constructor(config, token) {
        this.config = config;
        this.token = token;
    }
    /**
     * Validate the adapter configuration
     */
    validate() {
        const errors = [];
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
    getHeaders() {
        return {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
        };
    }
    /**
     * Handle API errors consistently
     */
    handleError(error, context) {
        const message = error instanceof Error ? error.message : String(error);
        return {
            success: false,
            error: `${context}: ${message}`,
        };
    }
    /**
     * Make an authenticated API request
     */
    async request(path, options = {}) {
        const url = `${this.getApiBaseUrl()}${path}`;
        const response = await fetch(url, {
            ...options,
            headers: {
                ...this.getHeaders(),
                ...(options.headers || {}),
            },
        });
        if (!response.ok) {
            const body = await response.text();
            throw new Error(`HTTP ${response.status}: ${body}`);
        }
        return response.json();
    }
    /**
     * Get domain from config or generate default
     */
    getDomain() {
        return this.config.domain || this.getDefaultDomain();
    }
}
// ============================================================================
// Deployer Factory
// ============================================================================
import { VercelDeployer } from './VercelDeployer.js';
import { NetlifyDeployer } from './NetlifyDeployer.js';
import { CloudflareDeployer } from './CloudflareDeployer.js';
/**
 * Factory function to create the appropriate deployer based on target
 */
export function createDeployer(target, options) {
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
function getTokenFromEnv(target) {
    const tokenMap = {
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
//# sourceMappingURL=Deployer.js.map