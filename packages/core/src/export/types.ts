// ============================================================================
// WebBuilder Core — Export System Types
// Base types and interfaces for the export system
// ============================================================================

import type { ProjectSpec, FileChange } from '../types/index.js';

/**
 * Export format identifiers
 */
export type ExportFormatId = 'html' | 'react' | 'vue' | 'nextjs' | 'static' | 'pwa';

/**
 * Export options passed to each exporter
 */
export interface ExportOptions {
  /** Project specification to export */
  spec: ProjectSpec;
  /** Output directory path */
  outputDir?: string;
  /** Whether to generate package.json */
  includePackageJson?: boolean;
  /** Whether to generate README */
  includeReadme?: boolean;
  /** Whether to minify output */
  minify?: boolean;
  /** Whether to include source maps */
  sourceMaps?: boolean;
  /** Custom template variables */
  variables?: Record<string, string>;
  /** Target environment */
  target?: 'development' | 'production';
  /** Framework version overrides */
  frameworkVersions?: Record<string, string>;
}

/**
 * Export result returned by each exporter
 */
export interface ExportResult {
  /** Whether the export was successful */
  success: boolean;
  /** Generated files */
  files: FileChange[];
  /** Dependencies required */
  dependencies: Record<string, string>;
  /** Dev dependencies required */
  devDependencies: Record<string, string>;
  /** NPM scripts */
  scripts: Record<string, string>;
  /** Setup instructions */
  instructions: string[];
  /** Warnings generated during export */
  warnings: string[];
  /** The export format used */
  format: ExportFormatId;
}

/**
 * Base exporter interface — all exporters must implement this
 */
export interface Exporter {
  /** Unique identifier for this exporter */
  readonly id: ExportFormatId;
  /** Human-readable name */
  readonly name: string;
  /** Description of what this exporter generates */
  readonly description: string;
  /** File extension for the primary source files */
  readonly fileExtension: string;
  /** Whether this exporter requires a build step */
  readonly requiresBuild: boolean;

  /**
   * Export the project specification to files
   * @param options Export options
   * @returns Export result with generated files
   */
  export(options: ExportOptions): Promise<ExportResult>;

  /**
   * Validate that the spec can be exported with this exporter
   * @param spec Project specification to validate
   * @returns Validation result
   */
  validate(spec: ProjectSpec): { valid: boolean; errors: string[] };

  /**
   * Get the default dependencies for this exporter
   * @returns Map of dependency name to version
   */
  getDependencies(): Record<string, string>;

  /**
   * Get the default dev dependencies for this exporter
   * @returns Map of dependency name to version
   */
  getDevDependencies(): Record<string, string>;
}

/**
 * Abstract base class for exporters with common functionality
 */
export abstract class BaseExporter implements Exporter {
  abstract readonly id: ExportFormatId;
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly fileExtension: string;
  abstract readonly requiresBuild: boolean;

  /**
   * Export the project — implement in subclasses
   */
  abstract export(options: ExportOptions): Promise<ExportResult>;

  /**
   * Validate the spec — override in subclasses for custom validation
   */
  validate(spec: ProjectSpec): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!spec.name) errors.push('Project name is required');
    if (!spec.structure?.pages?.length) errors.push('At least one page is required');
    return { valid: errors.length === 0, errors };
  }

  /**
   * Get default dependencies — override in subclasses
   */
  getDependencies(): Record<string, string> {
    return {};
  }

  /**
   * Get default dev dependencies — override in subclasses
   */
  getDevDependencies(): Record<string, string> {
    return {};
  }

  /**
   * Utility: Convert string to PascalCase
   */
  protected toPascalCase(str: string): string {
    return str
      .split(/[-_\s]+/)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
      .join('');
  }

  /**
   * Utility: Convert string to kebab-case
   */
  protected toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }

  /**
   * Utility: Generate a standard .gitignore
   */
  protected generateGitignore(): string {
    return `# Dependencies
node_modules/
.pnp
.pnp.js

# Build
dist/
build/
.next/
out/
.nuxt/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Cache
.cache/
.eslintcache
.parcel-cache/
.turbo/
`;
  }

  /**
   * Utility: Generate a standard README
   */
  protected generateReadme(spec: ProjectSpec, format: string, scripts: Record<string, string>): string {
    const devScript = scripts.dev ? 'npm run dev' : 'npm start';
    const buildScript = scripts.build ? 'npm run build' : 'npm run build';
    return `# ${spec.name}

${spec.description}

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

\`\`\`bash
npm install
\`\`\`

### Development

\`\`\`bash
${devScript}
\`\`\`

### Build

\`\`\`bash
${buildScript}
\`\`\`

## Generated with WebBuilder

This project was generated using WebBuilder's ${format} exporter.
`;
  }

  /**
   * Utility: Extract colors from design tokens
   */
  protected extractColors(tokens: Record<string, unknown>): Record<string, string> {
    const colors: Record<string, string> = {};
    const colorTokens = (tokens as any).colors || {};
    for (const [name, token] of Object.entries(colorTokens)) {
      if (token && typeof token === 'object' && 'value' in token) {
        colors[name] = (token as any).value;
      }
    }
    return colors;
  }

  /**
   * Utility: Extract fonts from design tokens
   */
  protected extractFonts(tokens: Record<string, unknown>): Record<string, string[]> {
    const fonts: Record<string, string[]> = {};
    const fontTokens = (tokens as any).fonts || {};
    for (const [name, token] of Object.entries(fontTokens)) {
      if (token && typeof token === 'object' && 'value' in token) {
        fonts[name] = (token as any).value.split(',').map((s: string) => s.trim());
      }
    }
    return fonts;
  }

  /**
   * Utility: Create a standard FileChange object
   */
  protected createFile(path: string, content: string): FileChange {
    return { path, content, action: 'create' };
  }
}

/**
 * Export manager that coordinates all exporters
 */
export interface ExportManager {
  /**
   * Register an exporter
   */
  register(exporter: Exporter): void;

  /**
   * Get an exporter by ID
   */
  getExporter(id: ExportFormatId): Exporter | undefined;

  /**
   * List all registered exporters
   */
  listExporters(): Exporter[];

  /**
   * Export a project using the specified format
   */
  export(format: ExportFormatId, options: ExportOptions): Promise<ExportResult>;

  /**
   * Export a project to all formats
   */
  exportAll(options: ExportOptions): Promise<Record<ExportFormatId, ExportResult>>;
}