import type { ProjectSpec, ChangeSet } from '../types/index.js';
export interface ProjectEntry {
    id: string;
    name: string;
    description: string;
    path: string;
    createdAt: string;
    updatedAt: string;
}
export declare class ProjectManager {
    private basePath;
    constructor();
    /**
     * Create a new project on disk
     */
    create(spec: ProjectSpec): ProjectEntry;
    /**
     * Load a project spec from disk
     */
    load(projectId: string): ProjectSpec | null;
    /**
     * Save a project spec to disk
     */
    save(spec: ProjectSpec): void;
    /**
     * List all projects
     */
    list(): ProjectEntry[];
    /**
     * Delete a project
     */
    delete(projectId: string): boolean;
    /**
     * Save a file to the project's files directory
     */
    saveFile(projectId: string, filePath: string, content: string): void;
    /**
     * Read a file from the project
     */
    readFile(projectId: string, filePath: string): string | null;
    /**
     * Get the base path for projects
     */
    getBasePath(): string;
    /**
     * Get the full path for a specific project
     */
    getProjectPath(projectId: string): string;
    /**
     * Append to project history
     */
    addHistoryEntry(projectId: string, change: ChangeSet): void;
}
export declare function createProjectManager(): ProjectManager;
export default ProjectManager;
//# sourceMappingURL=index.d.ts.map