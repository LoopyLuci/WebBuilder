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
//# sourceMappingURL=Deployer.js.map