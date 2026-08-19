import type { ProjectSpec, FileChange } from '../types/index.js';
export interface GeneratedProject {
    files: FileChange[];
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
    scripts: Record<string, string>;
    instructions: string[];
}
export declare class CodeGenerator {
    private spec;
    constructor(spec: ProjectSpec);
    /**
     * Generate the complete project
     */
    generate(): GeneratedProject;
    private generatePackageJson;
    private generateTsConfig;
    private generateNextConfig;
    private generateTailwindConfig;
    private generatePostcssConfig;
    private generateGitignore;
    private generateLayout;
    private generateGlobalStyles;
    private generatePage;
    private generateSectionJSX;
    private generateComponentFile;
    private generateDesignTokens;
    private getUsedComponents;
    private extractColors;
    private extractFonts;
    private extractSpacing;
    private extractRadii;
    private extractShadows;
    private getDependencies;
    private getDevDependencies;
    private getScripts;
    private getInstructions;
    private toPascalCase;
}
export declare function generateCode(spec: ProjectSpec): GeneratedProject;
export { ComponentCodeGenerator, generateComponents } from './components.js';
export { ContentGenerator, generateContent } from './content.js';
export type { GeneratedComponent } from './components.js';
export type { GeneratedContent } from './content.js';
export default CodeGenerator;
//# sourceMappingURL=codegen.d.ts.map