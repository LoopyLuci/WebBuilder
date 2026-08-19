export interface BuildResult {
    success: boolean;
    output: string;
    errors: string[];
    warnings: string[];
    duration: number;
    apkPath?: string;
}
export interface GradleTask {
    name: string;
    description: string;
    group: string;
}
/**
 * Gradle wrapper configuration
 */
export declare const gradleWrapperProperties: {
    distributionUrl: string;
    distributionSha256Sum: string;
};
/**
 * Generate Gradle wrapper script (Unix)
 */
export declare function generateGradleWrapperScript(): string;
/**
 * Generate Gradle wrapper script (Windows)
 */
export declare function generateGradleWrapperScriptWindows(): string;
/**
 * List of common Gradle tasks
 */
export declare function getCommonGradleTasks(): GradleTask[];
/**
 * Run a Gradle task
 */
export declare function runGradleTask(projectPath: string, task: string, args?: string[]): Promise<BuildResult>;
/**
 * Build the debug APK
 */
export declare function buildDebugApk(projectPath: string): Promise<BuildResult>;
/**
 * Build the release APK
 */
export declare function buildReleaseApk(projectPath: string): Promise<BuildResult>;
/**
 * Install and run the debug APK on the emulator
 */
export declare function installAndRun(projectPath: string): Promise<BuildResult>;
declare const _default: {
    generateGradleWrapperScript: typeof generateGradleWrapperScript;
    generateGradleWrapperScriptWindows: typeof generateGradleWrapperScriptWindows;
    getCommonGradleTasks: typeof getCommonGradleTasks;
    runGradleTask: typeof runGradleTask;
    buildDebugApk: typeof buildDebugApk;
    buildReleaseApk: typeof buildReleaseApk;
    installAndRun: typeof installAndRun;
};
export default _default;
//# sourceMappingURL=index.d.ts.map