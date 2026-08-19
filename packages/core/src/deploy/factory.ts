// ============================================================================
// Deployer Factory
// ============================================================================

import { Deployer } from './Deployer.js';
import { VercelDeployer } from './VercelDeployer.js';
import { NetlifyDeployer } from './NetlifyDeployer.js';
import { CloudflareDeployer } from './CloudflareDeployer.js';
import type { DeploymentTarget } from '../types/index.js';
import type { DeploymentConfig } from '../types/index.js';

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
