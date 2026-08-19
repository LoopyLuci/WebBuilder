import type { AndroidFileChange } from '../types/index.js';
export interface AndroidComponentDefinition {
    id: string;
    name: string;
    category: 'layout' | 'input' | 'display' | 'navigation' | 'feedback' | 'screen';
    description: string;
    code: string;
    dependencies?: string[];
}
/**
 * All available Android components with full Jetpack Compose implementations
 */
export declare const androidComponents: AndroidComponentDefinition[];
/**
 * Generate Android component files
 */
export declare function generateAndroidComponents(componentIds: string[], packageName: string): AndroidFileChange[];
/**
 * Get all component IDs
 */
export declare function getAllAndroidComponentIds(): string[];
export default androidComponents;
//# sourceMappingURL=components.d.ts.map