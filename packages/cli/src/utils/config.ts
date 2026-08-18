import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const CONFIG_DIR = path.join(os.homedir(), '.webbuilder');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export interface WebBuilderConfig {
  apiKey?: string;
  defaultTemplate?: string;
  defaultAgent?: string;
  defaultTarget?: string;
  telemetry?: boolean;
  theme?: 'light' | 'dark';
  agents?: Array<{
    id: string;
    type: string;
    name: string;
    status: string;
    createdAt: string;
  }>;
}

export const config = {
  ensureConfigDir(): void {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
  },

  get<T extends keyof WebBuilderConfig>(
    key: T
  ): WebBuilderConfig[T] | undefined {
    this.ensureConfigDir();
    if (!fs.existsSync(CONFIG_FILE)) {
      return undefined;
    }
    try {
      const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      return data[key];
    } catch {
      return undefined;
    }
  },

  set<K extends keyof WebBuilderConfig>(
    key: K,
    value: WebBuilderConfig[K]
  ): void {
    this.ensureConfigDir();
    let data: WebBuilderConfig = {};
    if (fs.existsSync(CONFIG_FILE)) {
      try {
        data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      } catch {
        data = {};
      }
    }
    data[key] = value;
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2));
  },

  getAll(): WebBuilderConfig {
    this.ensureConfigDir();
    if (!fs.existsSync(CONFIG_FILE)) {
      return {};
    }
    try {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    } catch {
      return {};
    }
  },

  delete(key: keyof WebBuilderConfig): void {
    this.ensureConfigDir();
    if (!fs.existsSync(CONFIG_FILE)) {
      return;
    }
    try {
      const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      delete data[key];
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2));
    } catch {
      // ignore
    }
  },

  reset(): void {
    this.ensureConfigDir();
    if (fs.existsSync(CONFIG_FILE)) {
      fs.unlinkSync(CONFIG_FILE);
    }
  },

  getConfigPath(): string {
    return CONFIG_FILE;
  },
};