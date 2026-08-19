import type { Section, ProjectSpec } from '../types/index.js';
export interface GeneratedComponent {
    path: string;
    content: string;
    name: string;
}
export declare class ComponentCodeGenerator {
    private spec;
    constructor(spec: ProjectSpec);
    /**
     * Generate all components used in the spec
     */
    generateAll(): GeneratedComponent[];
    /**
     * Generate a single component file
     */
    generate(section: Section): GeneratedComponent;
    /**
     * Get the appropriate template based on component type
     */
    private getComponentTemplate;
    /**
     * Generate a Hero section component
     */
    private generateHero;
    /**
     * Generate a Features section component
     */
    private generateFeatures;
    /**
     * Generate a Pricing section component
     */
    private generatePricing;
    /**
     * Generate a CTA section component
     */
    private generateCTA;
    /**
     * Generate a Stats section component
     */
    private generateStats;
    /**
     * Generate a Chart section component
     */
    private generateChart;
    /**
     * Generate an Activity Feed component
     */
    private generateActivityFeed;
    /**
     * Generate a Testimonials component
     */
    private generateTestimonials;
    /**
     * Generate a Footer component
     */
    private generateFooter;
    /**
     * Generate a Navbar component
     */
    private generateNavbar;
    /**
     * Generate a default component
     */
    private generateDefault;
    /**
     * Convert kebab-case to PascalCase
     */
    private toPascalCase;
}
export declare function generateComponents(spec: ProjectSpec): GeneratedComponent[];
export default ComponentCodeGenerator;
//# sourceMappingURL=components.d.ts.map