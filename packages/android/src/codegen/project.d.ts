import type { AndroidProjectConfig, GeneratedAndroidProject } from '../types/index.js';
export declare class AndroidProjectGenerator {
    private config;
    constructor(config: AndroidProjectConfig);
    /**
     * Generate the complete Android project
     */
    generate(): GeneratedAndroidProject;
    /**
     * Generate settings.gradle.kts
     */
    private generateSettingsGradle;
    /**
     * Generate project-level build.gradle.kts
     */
    private generateProjectGradle;
    /**
     * Generate app-level build.gradle.kts
     */
    private generateAppGradle;
    /**
     * Generate gradle.properties
     */
    private generateGradleProperties;
    /**
     * Generate libs.versions.toml
     */
    private generateLibsVersions;
    /**
     * Generate AndroidManifest.xml
     */
    private generateManifest;
    /**
     * Generate activity manifest entry
     */
    private generateActivityManifest;
    /**
     * Generate Kotlin source files
     */
    private generateKotlinFiles;
    /**
     * Generate a Compose activity
     */
    private generateComposeActivity;
    /**
     * Generate a traditional (non-Compose) activity
     */
    private generateTraditionalActivity;
    /**
     * Generate a default composable
     */
    private generateDefaultComposable;
    /**
     * Generate a composable function
     */
    private generateComposable;
    /**
     * Generate resource files
     */
    private generateResources;
    /**
     * Get Gradle configuration
     */
    private getGradleConfig;
    /**
     * Get Android manifest
     */
    private getManifest;
    /**
     * Get setup instructions
     */
    private getInstructions;
    /**
     * Convert dependency to libs.versions.toml alias
     */
    private toLibAlias;
}
export declare function generateAndroidProject(config: AndroidProjectConfig): GeneratedAndroidProject;
export default AndroidProjectGenerator;
//# sourceMappingURL=project.d.ts.map