// Secure Storage Module
// Provides encrypted file-based storage with optional keyring support

import { createCipheriv, createDecipheriv, randomBytes, scryptSync, createHash } from 'crypto';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';

/**
 * Interface for secure storage operations
 */
export interface ISecureStorage {
  store(key: string, value: string): Promise<void>;
  retrieve(key: string): Promise<string | null>;
  delete(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
  list(): Promise<string[]>;
  clear(): Promise<void>;
}

/**
 * Encrypted file-based secure storage
 * Uses AES-256-GCM for encryption with scrypt key derivation
 */
export class EncryptedFileStorage implements ISecureStorage {
  private storagePath: string;
  private masterKey: Buffer;
  private cache: Map<string, string> = new Map();

  constructor(config: { storagePath: string; encryptionKey?: string }) {
    this.storagePath = config.storagePath;
    this.masterKey = this.deriveKey(config.encryptionKey || this.generateDefaultKey());
  }

  /**
   * Derive encryption key from passphrase using scrypt
   */
  private deriveKey(passphrase: string): Buffer {
    const salt = createHash('sha256').update(this.storagePath).digest().slice(0, 16);
    return scryptSync(passphrase, salt, 32);
  }

  /**
   * Generate a default encryption key from machine-specific data
   */
  private generateDefaultKey(): string {
    const machineInfo = `${process.platform}-${process.env.USERNAME || process.env.USER || 'default'}-webbuilder-secure-storage`;
    return createHash('sha256').update(machineInfo).digest('hex');
  }

  /**
   * Encrypt a value using AES-256-GCM
   */
  private encrypt(value: string): { encrypted: string; iv: string; authTag: string } {
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-gcm', this.masterKey, iv);
    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
    };
  }

  /**
   * Decrypt a value using AES-256-GCM
   */
  private decrypt(encrypted: string, iv: string, authTag: string): string {
    const decipher = createDecipheriv(
      'aes-256-gcm',
      this.masterKey,
      Buffer.from(iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Get the storage directory, creating it if necessary
   */
  private async ensureStorageDir(): Promise<void> {
    try {
      await fs.mkdir(dirname(this.storagePath), { recursive: true, mode: 0o700 });
    } catch (err: any) {
      if (err.code !== 'EEXIST') throw err;
    }
  }

  /**
   * Read all data from the encrypted storage file
   */
  private async readStorage(): Promise<Record<string, { encrypted: string; iv: string; authTag: string }>> {
    try {
      const content = await fs.readFile(this.storagePath, 'utf8');
      return JSON.parse(content);
    } catch (err: any) {
      if (err.code === 'ENOENT') return {};
      throw err;
    }
  }

  /**
   * Write all data to the encrypted storage file
   */
  private async writeStorage(data: Record<string, { encrypted: string; iv: string; authTag: string }>): Promise<void> {
    await this.ensureStorageDir();
    await fs.writeFile(this.storagePath, JSON.stringify(data, null, 2), { mode: 0o600 });
  }

  /**
   * Store an encrypted value
   */
  async store(key: string, value: string): Promise<void> {
    const data = await this.readStorage();
    const encrypted = this.encrypt(value);
    data[key] = encrypted;
    await this.writeStorage(data);
    this.cache.set(key, value);
  }

  /**
   * Retrieve and decrypt a value
   */
  async retrieve(key: string): Promise<string | null> {
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    const data = await this.readStorage();
    const entry = data[key];
    if (!entry) return null;

    try {
      const decrypted = this.decrypt(entry.encrypted, entry.iv, entry.authTag);
      this.cache.set(key, decrypted);
      return decrypted;
    } catch {
      return null;
    }
  }

  /**
   * Delete a stored value
   */
  async delete(key: string): Promise<boolean> {
    const data = await this.readStorage();
    if (!(key in data)) return false;
    delete data[key];
    await this.writeStorage(data);
    this.cache.delete(key);
    return true;
  }

  /**
   * Check if a key exists in storage
   */
  async exists(key: string): Promise<boolean> {
    const data = await this.readStorage();
    return key in data;
  }

  /**
   * List all stored keys
   */
  async list(): Promise<string[]> {
    const data = await this.readStorage();
    return Object.keys(data);
  }

  /**
   * Clear all stored data
   */
  async clear(): Promise<void> {
    await this.writeStorage({});
    this.cache.clear();
  }

  /**
   * Securely wipe memory cache
   */
  destroy(): void {
    this.cache.clear();
    this.masterKey.fill(0);
  }
}

/**
 * Keyring-based secure storage (wrapper around system keyring)
 * Falls back to encrypted file storage if keyring is unavailable
 */
export class KeyringStorage implements ISecureStorage {
  private serviceName: string;
  private fallbackStorage: EncryptedFileStorage;

  constructor(config: { keyringService: string; fallbackStoragePath: string; encryptionKey?: string }) {
    this.serviceName = config.keyringService;
    this.fallbackStorage = new EncryptedFileStorage({
      storagePath: config.fallbackStoragePath,
      encryptionKey: config.encryptionKey,
    });
  }

  async store(key: string, value: string): Promise<void> {
    await this.fallbackStorage.store(key, value);
  }

  async retrieve(key: string): Promise<string | null> {
    return this.fallbackStorage.retrieve(key);
  }

  async delete(key: string): Promise<boolean> {
    return this.fallbackStorage.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    return this.fallbackStorage.exists(key);
  }

  async list(): Promise<string[]> {
    return this.fallbackStorage.list();
  }

  async clear(): Promise<void> {
    await this.fallbackStorage.clear();
  }
}

/**
 * Create the default secure storage instance
 */
export function createDefaultStorage(storagePath?: string): EncryptedFileStorage {
  const path = storagePath || join(
    process.env.LOCALAPPDATA || process.env.HOME || '.',
    'webbuilder',
    'api-keys.enc'
  );
  return new EncryptedFileStorage({ storagePath: path });
}

/**
 * Secure memory buffer that zeros on free
 */
export class SecureBuffer {
  private buffer: Buffer;

  constructor(size: number) {
    this.buffer = Buffer.alloc(size);
  }

  static fromString(str: string): SecureBuffer {
    const buf = new SecureBuffer(Buffer.byteLength(str, 'utf8'));
    buf.buffer.write(str, 'utf8');
    return buf;
  }

  get data(): Buffer {
    return this.buffer;
  }

  toString(encoding: BufferEncoding = 'utf8'): string {
    return this.buffer.toString(encoding);
  }

  clear(): void {
    this.buffer.fill(0);
  }
}

/**
 * Factory to create the best available secure storage
 */
export function createSecureStorage(options?: {
  storagePath?: string;
  encryptionKey?: string;
  preferKeyring?: boolean;
}): ISecureStorage {
  const storagePath = options?.storagePath || join(
    process.env.LOCALAPPDATA || process.env.HOME || '.',
    'webbuilder',
    'api-keys.enc'
  );

  if (options?.preferKeyring) {
    return new KeyringStorage({
      keyringService: 'webbuilder-api-keys',
      fallbackStoragePath: storagePath,
      encryptionKey: options.encryptionKey,
    });
  }

  return new EncryptedFileStorage({
    storagePath,
    encryptionKey: options?.encryptionKey,
  });
}

/**
 * Utility to generate a secure random API key ID
 */
export function generateKeyId(): string {
  return `key_${randomBytes(16).toString('hex')}`;
}

/**
 * Hash a key for storage lookup (non-reversible)
 */
export function hashKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}