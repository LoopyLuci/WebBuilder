import type { FeatureSet, Feature, Integration, WorkflowDefinition, Trigger, DataModel, DataField, JSONValue, ID } from '../types/index.js';
export declare class LogicEngine {
    private features;
    private integrations;
    private workflows;
    private dataModels;
    constructor();
    /**
     * Initialize from a feature set
     */
    init(featureSet: FeatureSet): void;
    /**
     * Get the full feature set
     */
    getFeatureSet(): FeatureSet;
    /**
     * Add a feature
     */
    addFeature(feature: Feature): void;
    /**
     * Remove a feature
     */
    removeFeature(featureId: ID): boolean;
    /**
     * Get a feature by ID
     */
    getFeature(featureId: ID): Feature | undefined;
    /**
     * Update a feature
     */
    updateFeature(featureId: ID, updates: Partial<Feature>): boolean;
    /**
     * Enable a feature
     */
    enableFeature(featureId: ID): boolean;
    /**
     * Disable a feature
     */
    disableFeature(featureId: ID): boolean;
    /**
     * List all enabled features
     */
    getEnabledFeatures(): Feature[];
    /**
     * Add an integration
     */
    addIntegration(integration: Integration): void;
    /**
     * Remove an integration
     */
    removeIntegration(integrationId: ID): boolean;
    /**
     * Get an integration
     */
    getIntegration(integrationId: ID): Integration | undefined;
    /**
     * Get integrations by type
     */
    getIntegrationsByType(type: Integration['type']): Integration[];
    /**
     * Generate configuration for an integration
     */
    generateIntegrationConfig(integrationId: ID): Record<string, string>;
    /**
     * Add a workflow
     */
    addWorkflow(workflow: WorkflowDefinition): void;
    /**
     * Remove a workflow
     */
    removeWorkflow(workflowId: ID): boolean;
    /**
     * Get a workflow
     */
    getWorkflow(workflowId: ID): WorkflowDefinition | undefined;
    /**
     * Generate code for a workflow
     */
    generateWorkflowCode(workflowId: ID): string;
    /**
     * Validate a workflow
     */
    validateWorkflow(workflowId: ID): WorkflowValidationResult;
    /**
     * Add a data model
     */
    addDataModel(model: DataModel): void;
    /**
     * Remove a data model
     */
    removeDataModel(modelId: ID): boolean;
    /**
     * Get a data model
     */
    getDataModel(modelId: ID): DataModel | undefined;
    /**
     * Get data model by name
     */
    getDataModelByName(name: string): DataModel | undefined;
    /**
     * Generate TypeScript interface for a data model
     */
    generateModelInterface(modelId: ID): string;
    /**
     * Generate Zod schema for a data model
     */
    generateModelSchema(modelId: ID): string;
    /**
     * Generate API routes for a data model
     */
    generateAPICRUD(modelId: ID): string;
    /**
     * Generate React hook for data model
     */
    generateModelHook(modelId: ID): string;
    /**
     * Generate state management code
     */
    generateStateManagement(storeName: string, initialState: Record<string, unknown>): string;
    /**
     * Generate form validation code
     */
    generateFormValidation(formName: string, fields: DataField[]): string;
    /**
     * Generate API integration code
     */
    generateAPIIntegration(integrationId: ID): string;
    /**
     * Get TypeScript type for a data field type
     */
    private getTypeScriptType;
    /**
     * Get Zod type for a data field type
     */
    private getZodType;
}
export interface WorkflowValidationResult {
    valid: boolean;
    errors: string[];
}
export interface StateStoreConfig {
    name: string;
    initialState: Record<string, unknown>;
    actions: string[];
}
export interface FormConfig {
    name: string;
    fields: DataField[];
    onSubmit: string;
}
export declare function createLogicEngine(): LogicEngine;
export declare function createFeature(name: string, type: Feature['type'], props?: Record<string, JSONValue>): Feature;
export declare function createIntegration(name: string, type: Integration['type'], provider: string): Integration;
export declare function createWorkflow(name: string, trigger: Trigger): WorkflowDefinition;
export declare function createDataModel(name: string, fields: DataField[]): DataModel;
export default LogicEngine;
//# sourceMappingURL=index.d.ts.map