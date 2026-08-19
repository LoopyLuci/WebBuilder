// ============================================================================
// Deployment Adapter Types
// Shared types for deployment adapters
// ============================================================================

/**
 * Result of a deployment operation
 */
export interface DeployResult {
  success: boolean;
  url?: string;
  deploymentId?: string;
  timestamp?: string;
  error?: string;
}

/**
 * Status of a deployment
 */
export interface DeploymentStatus {
  status: 'pending' | 'building' | 'deploying' | 'ready' | 'error' | 'unknown';
  message: string;
  url?: string;
  lastDeployed?: string;
  deploymentId?: string;
}

/**
 * Deployment information
 */
export interface DeploymentInfo {
  id: string;
  url: string;
  state: string;
  createdAt: string;
  updatedAt?: string;
  target?: string;
  meta?: Record<string, unknown>;
}

/**
 * Environment variable result
 */
export interface EnvVarResult {
  key: string;
  success: boolean;
  error?: string;
}

/**
 * Options for listing deployments
 */
export interface ListDeploymentsOptions {
  limit?: number;
  target?: string;
  projectId?: string;
}

/**
 * Log entry from a deployment
 */
export interface LogEntry {
  timestamp: string;
  message: string;
  level: 'info' | 'warn' | 'error' | 'debug';
}

/**
 * Deploy options
 */
export interface DeployOptions {
  build?: boolean;
  force?: boolean;
  skipChecks?: boolean;
}

/**
 * Pre-deploy checks result
 */
export interface PreDeployChecks {
  passed: boolean;
  failures: string[];
}

/**
 * Build result
 */
export interface BuildResult {
  success: boolean;
  output: string;
  duration: number;
  error?: string;
}

/**
 * Deployment config files
 */
export interface DeployConfigFiles {
  files: { path: string; content: string }[];
}

/**
 * Cost estimate
 */
export interface CostEstimate {
  base: number;
  scaling: number;
  cdn: number;
  monitoring: number;
  total: number;
  currency: string;
  period: string;
}