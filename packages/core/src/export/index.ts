// ============================================================================
// WebBuilder Core — Export System
// Complete export system for generating production-ready code
// ============================================================================

import type { ProjectSpec, FileChange } from '../types/index.js';
import { BaseExporter, type ExportOptions, type ExportResult, type ExportFormatId, type Exporter, type ExportManager } from './types.js';
import { HTMLExporterSync as HTMLExporter } from './html-exporter.js';
import { ReactExporter } from './react-exporter.js';
import { VueExporter } from './vue-exporter.js';
import { NextExporter } from './next-exporter.js';
import { StaticExporter } from './static-exporter.js';
import { PWAExporter } from './pwa-exporter.js';

// Re-export types
export * from './types.js';

// Re-export individual exporters
export { HTMLExporter } from './html-exporter.js';
export { ReactExporter } from './react-exporter.js';
export { VueExporter } from './vue-exporter.js';
export { NextExporter } from './next-exporter.js';
export { StaticExporter } from './static-exporter.js';
export { PWAExporter } from './pwa-exporter.js';

/**
 * ExportManager implementation — coordinates all exporters
 */
class ExportManagerImpl implements ExportManager {
  private exporters: Map<ExportFormatId, Exporter> = new Map();

  constructor() {
    // Register built-in exporters
    this.register(new HTMLExporter());
    this.register(new ReactExporter());
    this.register(new VueExporter());
    this.register(new NextExporter());
    this.register(new StaticExporter());
    this.register(new PWAExporter());
  }

  register(exporter: Exporter): void {
    this.exporters.set(exporter.id, exporter);
  }

  getExporter(id: ExportFormatId): Exporter | undefined {
    return this.exporters.get(id);
  }

  listExporters(): Exporter[] {
    return Array.from(this.exporters.values());
  }

  async export(format: ExportFormatId, options: ExportOptions): Promise<ExportResult> {
    const exporter = this.exporters.get(format);
    if (!exporter) {
      return {
        success: false,
        files: [],
        dependencies: {},
        devDependencies: {},
        scripts: {},
        instructions: [],
        warnings: [`Unknown export format: ${format}`],
        format,
      };
    }

    const validation = exporter.validate(options.spec);
    if (!validation.valid) {
      return {
        success: false,
        files: [],
        dependencies: {},
        devDependencies: {},
        scripts: {},
        instructions: [],
        warnings: validation.errors,
        format,
      };
    }

    return exporter.export(options);
  }

  async exportAll(options: ExportOptions): Promise<Record<ExportFormatId, ExportResult>> {
    const results: Record<ExportFormatId, ExportResult> = {} as any;
    for (const [id, exporter] of this.exporters) {
      results[id] = await this.export(id, options);
    }
    return results;
  }
}

// Singleton instance
let defaultManager: ExportManagerImpl | null = null;

/**
 * Get the default export manager instance
 */
export function getExportManager(): ExportManagerImpl {
  if (!defaultManager) {
    defaultManager = new ExportManagerImpl();
  }
  return defaultManager;
}

/**
 * Create a new export manager (for custom configurations)
 */
export function createExportManager(): ExportManagerImpl {
  return new ExportManagerImpl();
}

/**
 * Convenience function: export a project to a specific format
 */
export async function exportProject(
  format: ExportFormatId,
  spec: ProjectSpec,
  options?: Partial<ExportOptions>
): Promise<ExportResult> {
  const manager = getExportManager();
  return manager.export(format, { spec, ...options });
}

/**
 * Convenience function: export a project to all formats
 */
export async function exportProjectAll(
  spec: ProjectSpec,
  options?: Partial<ExportOptions>
): Promise<Record<ExportFormatId, ExportResult>> {
  const manager = getExportManager();
  return manager.exportAll({ spec, ...options });
}

/**
 * Get list of available export formats
 */
export function getAvailableFormats(): { id: ExportFormatId; name: string; description: string }[] {
  const manager = getExportManager();
  return manager.listExporters().map((e) => ({
    id: e.id,
    name: e.name,
    description: e.description,
  }));
}

// Default export
export default ExportManagerImpl;