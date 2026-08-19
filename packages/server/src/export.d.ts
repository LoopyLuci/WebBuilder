export interface ExportOptions {
    projectDir: string;
    projectName: string;
    environments: ('local' | 'docker' | 'kubernetes' | 'vercel' | 'netlify' | 'cloudflare')[];
}
export interface ExportResult {
    success: boolean;
    files: string[];
    instructions: string[];
}
/**
 * Export project for deployment to any environment
 */
export declare function exportProject(options: ExportOptions): Promise<ExportResult>;
declare const _default: {
    exportProject: typeof exportProject;
};
export default _default;
//# sourceMappingURL=export.d.ts.map