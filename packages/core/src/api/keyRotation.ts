// Key Rotation and Expiration Tracking Module
// Handles automatic key rotation schedules and expiration monitoring

import { ApiKeyMetadata, ApiKeyStatus, KeyRotationConfig } from './types.js';

/**
 * Result of checking key expiration
 */
export interface ExpirationCheckResult {
  metadata: ApiKeyMetadata;
  isExpired: boolean;
  isExpiringSoon: boolean;
  daysUntilExpiry: number;
  needsRotation: boolean;
  action: 'none' | 'warn' | 'rotate' | 'revoke';
}

/**
 * Rotation schedule entry
 */
export interface RotationSchedule {
  keyId: string;
  createdAt: Date;
  lastRotatedAt?: Date;
  nextRotationAt: Date;
  rotationCount: number;
}

/**
 * Check the expiration status of an API key
 */
export function checkKeyExpiration(
  metadata: ApiKeyMetadata,
  config: KeyRotationConfig,
  now: Date = new Date()
): ExpirationCheckResult {
  const expiresAt = metadata.expiresAt;
  
  if (!expiresAt) {
    // No expiration set - check if rotation is needed based on age
    const keyAge = now.getTime() - metadata.createdAt.getTime();
    const keyAgeDays = Math.floor(keyAge / (1000 * 60 * 60 * 24));
    const needsRotation = config.enabled && keyAgeDays >= config.rotateAfterDays;

    return {
      metadata,
      isExpired: false,
      isExpiringSoon: false,
      daysUntilExpiry: Infinity,
      needsRotation,
      action: needsRotation ? 'rotate' : 'none',
    };
  }

  const msUntilExpiry = expiresAt.getTime() - now.getTime();
  const daysUntilExpiry = Math.ceil(msUntilExpiry / (1000 * 60 * 60 * 24));
  const isExpired = msUntilExpiry <= 0;
  const isExpiringSoon = daysUntilExpiry > 0 && daysUntilExpiry <= config.expiryWarningDays;
  
  const keyAge = now.getTime() - metadata.createdAt.getTime();
  const keyAgeDays = Math.floor(keyAge / (1000 * 60 * 60 * 24));
  const needsRotation = config.enabled && keyAgeDays >= config.rotateAfterDays;

  let action: ExpirationCheckResult['action'] = 'none';
  if (isExpired && config.autoRevokeOnExpiry) {
    action = 'revoke';
  } else if (isExpired || needsRotation) {
    action = 'rotate';
  } else if (isExpiringSoon) {
    action = 'warn';
  }

  return {
    metadata,
    isExpired,
    isExpiringSoon,
    daysUntilExpiry,
    needsRotation,
    action,
  };
}

/**
 * Batch check expiration for all keys
 */
export function batchCheckExpiration(
  keys: ApiKeyMetadata[],
  config: KeyRotationConfig,
  now: Date = new Date()
): ExpirationCheckResult[] {
  return keys.map((metadata) => checkKeyExpiration(metadata, config, now));
}

/**
 * Get keys that are expired
 */
export function getExpiredKeys(
  keys: ApiKeyMetadata[],
  now: Date = new Date()
): ApiKeyMetadata[] {
  return keys.filter((k) => k.expiresAt && k.expiresAt.getTime() <= now.getTime());
}

/**
 * Get keys expiring within N days
 */
export function getExpiringKeys(
  keys: ApiKeyMetadata[],
  days: number,
  now: Date = new Date()
): ApiKeyMetadata[] {
  const cutoff = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return keys.filter(
    (k) => k.expiresAt && k.expiresAt.getTime() > now.getTime() && k.expiresAt.getTime() <= cutoff
  );
}

/**
 * Get keys needing rotation
 */
export function getKeysNeedingRotation(
  keys: ApiKeyMetadata[],
  config: KeyRotationConfig,
  now: Date = new Date()
): ApiKeyMetadata[] {
  if (!config.enabled) return [];
  
  return keys.filter((k) => {
    const age = now.getTime() - k.createdAt.getTime();
    const ageDays = Math.floor(age / (1000 * 60 * 60 * 24));
    return ageDays >= config.rotateAfterDays;
  });
}

/**
 * Update key status based on expiration
 */
export function updateKeyStatusForExpiration(
  metadata: ApiKeyMetadata,
  config: KeyRotationConfig,
  now: Date = new Date()
): ApiKeyMetadata {
  const check = checkKeyExpiration(metadata, config, now);
  const updated = { ...metadata, updatedAt: now };

  if (check.isExpired && metadata.status === ApiKeyStatus.ACTIVE) {
    updated.status = ApiKeyStatus.EXPIRED;
  }

  return updated;
}

/**
 * Create a rotation schedule for a key
 */
export function createRotationSchedule(
  keyId: string,
  config: KeyRotationConfig,
  createdAt: Date = new Date()
): RotationSchedule {
  const nextRotationAt = new Date(
    createdAt.getTime() + config.rotateAfterDays * 24 * 60 * 60 * 1000
  );

  return {
    keyId,
    createdAt,
    nextRotationAt,
    rotationCount: 0,
  };
}

/**
 * Record a key rotation in the schedule
 */
export function recordRotation(schedule: RotationSchedule, config: KeyRotationConfig): RotationSchedule {
  const now = new Date();
  return {
    ...schedule,
    lastRotatedAt: now,
    nextRotationAt: new Date(now.getTime() + config.rotateAfterDays * 24 * 60 * 60 * 1000),
    rotationCount: schedule.rotationCount + 1,
  };
}

/**
 * Calculate the next expiration date from a given point
 */
export function calculateExpirationDate(fromDate: Date, daysValid: number): Date {
  return new Date(fromDate.getTime() + daysValid * 24 * 60 * 60 * 1000);
}

/**
 * Default rotation configuration
 */
export const DEFAULT_ROTATION_CONFIG: KeyRotationConfig = {
  enabled: true,
  rotateAfterDays: 90,
  expiryWarningDays: 14,
  autoRevokeOnExpiry: true,
};

/**
 * Strict rotation configuration (more aggressive rotation)
 */
export const STRICT_ROTATION_CONFIG: KeyRotationConfig = {
  enabled: true,
  rotateAfterDays: 30,
  expiryWarningDays: 7,
  autoRevokeOnExpiry: true,
};

/**
 * Relaxed rotation configuration
 */
export const RELAXED_ROTATION_CONFIG: KeyRotationConfig = {
  enabled: true,
  rotateAfterDays: 180,
  expiryWarningDays: 30,
  autoRevokeOnExpiry: false,
};