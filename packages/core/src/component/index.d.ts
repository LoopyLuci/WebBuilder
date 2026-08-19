import type { Component, Framework, FrameworkImplementation, Dependency, ID, ComponentCategory } from '../types/index.js';
export declare class ComponentEngine {
    private components;
    private categories;
    private frameworkAdapters;
    constructor();
    /**
     * Register a new component
     */
    register(component: Component): void;
    /**
     * Unregister a component
     */
    unregister(componentId: ID): boolean;
    /**
     * Get a component by ID
     */
    get(componentId: ID): Component | undefined;
    /**
     * Get a component by name
     */
    getByName(name: string): Component | undefined;
    /**
     * List all components
     */
    list(): Component[];
    /**
     * Get components by category
     */
    getByCategory(category: ComponentCategory): Component[];
    /**
     * Search components
     */
    search(query: string): Component[];
    /**
     * Get component implementation for a specific framework
     */
    getImplementation(componentId: ID, framework: Framework): FrameworkImplementation | undefined;
    /**
     * Add a framework implementation to an existing component
     */
    addImplementation(componentId: ID, framework: Framework, implementation: FrameworkImplementation): boolean;
    /**
     * Generate implementation for a framework using AI
     */
    generateImplementation(componentId: ID, framework: Framework): Promise<FrameworkImplementation | null>;
    /**
     * Get supported frameworks for a component
     */
    getSupportedFrameworks(componentId: ID): Framework[];
    /**
     * Create a composite component from multiple components
     */
    compose(name: string, componentIds: ID[], layout?: 'vertical' | 'horizontal' | 'grid'): Component;
    /**
     * Extend an existing component with new props, styles, or behavior
     */
    extend(componentId: ID, extensions: Partial<Component>): Component | null;
    /**
     * Get all dependencies for a set of components
     */
    resolveDependencies(componentIds: ID[]): Dependency[];
    /**
     * Check for circular dependencies
     */
    detectCircularDependencies(componentIds: ID[]): boolean;
    /**
     * Register built-in components
     */
    private registerBuiltInComponents;
    /**
     * Register Text Input component
     */
    private registerTextInput;
    /**
     * Register Modal component
     */
    private registerModal;
    /**
     * Register CTA component
     */
    private registerCTA;
    /**
     * Register framework adapters
     */
    private registerFrameworkAdapters;
    /**
     * Generate composed React code
     */
    private generateComposedReactCode;
    /**
     * Generate composed styles
     */
    private generateComposedStyles;
}
export declare function createComponentEngine(): ComponentEngine;
export default ComponentEngine;
//# sourceMappingURL=index.d.ts.map