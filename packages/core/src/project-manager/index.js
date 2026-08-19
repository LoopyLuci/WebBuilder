// ============================================================================
// Project Manager — Handles project persistence and lifecycle
// ============================================================================
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
export class ProjectManager {
    basePath;
    constructor() {
        this.basePath = join(homedir(), '.webbuilder', 'projects');
        if (!existsSync(this.basePath)) {
            mkdirSync(this.basePath, { recursive: true });
        }
    }
    /**
     * Create a new project on disk
     */
    create(spec) {
        const projectPath = join(this.basePath, spec.id);
        const filesPath = join(projectPath, 'files');
        mkdirSync(projectPath, { recursive: true });
        mkdirSync(filesPath, { recursive: true });
        // Save spec
        writeFileSync(join(projectPath, 'spec.json'), JSON.stringify(spec, null, 2));
        // Initialize history
        writeFileSync(join(projectPath, 'history.json'), JSON.stringify([], null, 2));
        return {
            id: spec.id,
            name: spec.name,
            description: spec.description,
            path: projectPath,
            createdAt: spec.metadata.createdAt,
            updatedAt: spec.metadata.updatedAt,
        };
    }
    /**
     * Load a project spec from disk
     */
    load(projectId) {
        const specPath = join(this.basePath, projectId, 'spec.json');
        if (!existsSync(specPath))
            return null;
        return JSON.parse(readFileSync(specPath, 'utf-8'));
    }
    /**
     * Save a project spec to disk
     */
    save(spec) {
        const projectPath = join(this.basePath, spec.id);
        if (!existsSync(projectPath)) {
            mkdirSync(projectPath, { recursive: true });
        }
        writeFileSync(join(projectPath, 'spec.json'), JSON.stringify(spec, null, 2));
    }
    /**
     * List all projects
     */
    list() {
        if (!existsSync(this.basePath))
            return [];
        const dirs = readdirSync(this.basePath, { withFileTypes: true })
            .filter(d => d.isDirectory());
        const entries = [];
        for (const dir of dirs) {
            const specPath = join(this.basePath, dir.name, 'spec.json');
            if (existsSync(specPath)) {
                try {
                    const spec = JSON.parse(readFileSync(specPath, 'utf-8'));
                    entries.push({
                        id: spec.id,
                        name: spec.name,
                        description: spec.description,
                        path: join(this.basePath, dir.name),
                        createdAt: spec.metadata.createdAt,
                        updatedAt: spec.metadata.updatedAt,
                    });
                }
                catch {
                    // Skip invalid projects
                }
            }
        }
        return entries;
    }
    /**
     * Delete a project
     */
    delete(projectId) {
        const projectPath = join(this.basePath, projectId);
        if (!existsSync(projectPath))
            return false;
        rmSync(projectPath, { recursive: true, force: true });
        return true;
    }
    /**
     * Save a file to the project's files directory
     */
    saveFile(projectId, filePath, content) {
        const fullPath = join(this.basePath, projectId, 'files', filePath);
        const dir = join(fullPath, '..');
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }
        writeFileSync(fullPath, content);
    }
    /**
     * Read a file from the project
     */
    readFile(projectId, filePath) {
        const fullPath = join(this.basePath, projectId, 'files', filePath);
        if (!existsSync(fullPath))
            return null;
        return readFileSync(fullPath, 'utf-8');
    }
    /**
     * Get the base path for projects
     */
    getBasePath() {
        return this.basePath;
    }
    /**
     * Get the full path for a specific project
     */
    getProjectPath(projectId) {
        return join(this.basePath, projectId);
    }
    /**
     * Append to project history
     */
    addHistoryEntry(projectId, change) {
        const historyPath = join(this.basePath, projectId, 'history.json');
        let history = [];
        if (existsSync(historyPath)) {
            history = JSON.parse(readFileSync(historyPath, 'utf-8'));
        }
        history.push(change);
        writeFileSync(historyPath, JSON.stringify(history, null, 2));
    }
}
export function createProjectManager() {
    return new ProjectManager();
}
export default ProjectManager;
//# sourceMappingURL=index.js.map