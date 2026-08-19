import type { DesignSystem, DesignTokens, Theme, TokenValue } from '../types/index.js';
export declare class DesignEngine {
    private system;
    private compiler;
    constructor(system?: DesignSystem);
    /**
     * Get the current design system
     */
    getSystem(): DesignSystem;
    /**
     * Set the design system
     */
    setSystem(system: DesignSystem): void;
    /**
     * Update design tokens
     */
    updateTokens(tokens: Partial<DesignTokens>): void;
    /**
     * Add a theme
     */
    addTheme(theme: Theme): void;
    /**
     * Set the default theme
     */
    setDefaultTheme(themeId: string): void;
    /**
     * Get the default theme
     */
    getDefaultTheme(): Theme | undefined;
    /**
     * Generate CSS custom properties
     */
    generateCSSVariables(): string;
    /**
     * Generate Tailwind config
     */
    generateTailwindConfig(): string;
    /**
     * Generate CSS for a specific component
     */
    generateComponentCSS(componentName: string, variant?: string): string;
    /**
     * Generate responsive CSS
     */
    generateResponsiveCSS(): string;
    /**
     * Compile to CSS string
     */
    compile(options?: CompileOptions): string;
    /**
     * Validate the design system
     */
    validate(): DesignValidationResult;
    /**
     * Analyze a design from an image/URL
     */
    analyze(source: string): Promise<DesignSystem>;
    /**
     * Merge two design systems
     */
    merge(other: DesignSystem): DesignSystem;
    /**
     * Get a token value by path
     */
    getTokenValue(path: string): string | undefined;
    /**
     * Set a token value by path
     */
    setTokenValue(path: string, value: string, type?: TokenValue['type']): void;
    /**
     * Create default design system
     */
    private createDefaultSystem;
    /**
     * Create default tokens
     */
    private createDefaultTokens;
    /**
     * Create default theme
     */
    private createDefaultTheme;
    /**
     * Create default responsive config
     */
    private createDefaultResponsive;
    /**
     * Create default animations
     */
    private createDefaultAnimations;
    /**
     * Create default typography
     */
    private createDefaultTypography;
    /**
     * Create default color system
     */
    private createDefaultColorSystem;
    /**
     * Create default spacing
     */
    private createDefaultSpacing;
    /**
     * Create default elevation
     */
    private createDefaultElevation;
    /**
     * Create default motion
     */
    private createDefaultMotion;
    /**
     * Merge two token sets
     */
    private mergeTokens;
    /**
     * Calculate contrast ratio between two colors
     */
    private calculateContrast;
    /**
     * Get relative luminance of a color
     */
    private getRelativeLuminance;
}
export interface CompileOptions {
    responsive?: boolean;
    animations?: boolean;
    components?: boolean[];
    format?: 'css' | 'scss' | 'less';
    minify?: boolean;
}
export interface DesignValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
export declare function createDesignEngine(system?: DesignSystem): DesignEngine;
export declare function createDesignTokens(overrides?: Partial<DesignTokens>): DesignTokens;
export default DesignEngine;
//# sourceMappingURL=index.d.ts.map