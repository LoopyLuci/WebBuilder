import type { ParsedIntent, ProjectSpec } from '../types/index.js';
export declare class IntentParser {
    private vocabulary;
    private componentLibrary;
    private frameworkKeywords;
    constructor();
    /**
     * Parse a natural language description into a structured project specification
     */
    parse(description: string): ParsedIntent;
    /**
     * Extract intent from natural language description
     */
    private extractIntent;
    /**
     * Extract goals from description
     */
    private extractGoals;
    /**
     * Extract constraints from description
     */
    private extractConstraints;
    /**
     * Extract references from description
     */
    private extractReferences;
    /**
     * Extract target audience from description
     */
    private extractAudience;
    /**
     * Extract purpose from description
     */
    private extractPurpose;
    /**
     * Generate a project specification from intent
     */
    private generateSpec;
    /**
     * Generate a project name from intent
     */
    private generateProjectName;
    /**
     * Generate page map from intent
     */
    private generatePageMap;
    /**
     * Generate landing page sections
     */
    private generateLandingSections;
    /**
     * Generate dashboard sections
     */
    private generateDashboardSections;
    /**
     * Generate blog sections
     */
    private generateBlogSections;
    /**
     * Generate design system from intent
     */
    private generateDesignSystem;
    /**
     * Generate design tokens
     */
    private generateDesignTokens;
    /**
     * Generate themes
     */
    private generateThemes;
    /**
     * Generate default theme
     */
    private generateDefaultTheme;
    /**
     * Generate responsive config
     */
    private generateResponsiveConfig;
    /**
     * Generate typography system
     */
    private generateTypographySystem;
    /**
     * Generate color system
     */
    private generateColorSystem;
    /**
     * Generate spacing system
     */
    private generateSpacingSystem;
    /**
     * Generate elevation levels
     */
    private generateElevationLevels;
    /**
     * Generate feature set from intent
     */
    private generateFeatureSet;
    /**
     * Generate deployment config from intent
     */
    private generateDeploymentConfig;
    /**
     * Generate project metadata
     */
    private generateMetadata;
    /**
     * Identify clarifications needed before full spec generation
     */
    private identifyClarifications;
    /**
     * Calculate confidence score for the parsed intent
     */
    private calculateConfidence;
    /**
     * Initialize vocabulary for intent recognition
     */
    private initializeVocabulary;
    /**
     * Initialize component library mapping
     */
    private initializeComponentLibrary;
    /**
     * Initialize framework keywords
     */
    private initializeFrameworkKeywords;
}
/**
 * Quick parse function
 */
export declare function parseIntent(description: string): ParsedIntent;
/**
 * Validate a project spec
 */
export declare function validateSpec(spec: Partial<ProjectSpec>): {
    valid: boolean;
    errors: string[];
};
export default IntentParser;
//# sourceMappingURL=index.d.ts.map