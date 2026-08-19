export interface AIModelConfig {
    id: string;
    name: string;
    provider: 'openai' | 'anthropic' | 'local' | 'custom';
    model: string;
    maxTokens: number;
    temperature: number;
    capabilities: string[];
}
export interface PromptTemplate {
    id: string;
    name: string;
    description: string;
    template: string;
    variables: string[];
    model?: string;
    tags: string[];
}
export interface InferenceResult {
    id: string;
    model: string;
    prompt: string;
    response: string;
    tokensUsed: number;
    duration: number;
    metadata?: Record<string, unknown>;
}
export declare class AIModelManager {
    private models;
    private prompts;
    private history;
    constructor();
    private registerDefaultModels;
    private registerDefaultPrompts;
    registerModel(config: AIModelConfig): void;
    getModel(id: string): AIModelConfig | undefined;
    listModels(): AIModelConfig[];
    getModelsByCapability(capability: string): AIModelConfig[];
    registerPrompt(template: PromptTemplate): void;
    getPrompt(id: string): PromptTemplate | undefined;
    listPrompts(): PromptTemplate[];
    getPromptsByTag(tag: string): PromptTemplate[];
    renderPrompt(promptId: string, variables: Record<string, string>): string;
    inference(modelId: string, prompt: string, options?: Partial<AIModelConfig>): Promise<InferenceResult>;
    getHistory(): InferenceResult[];
    clearHistory(): void;
}
export declare class CodeGenerator {
    private modelManager;
    constructor(modelManager: AIModelManager);
    generateComponent(name: string, description: string, framework: string, options?: {
        style?: string;
        wcagLevel?: string;
    }): Promise<string>;
    generateDesignSystem(description: string): Promise<string>;
    generatePageLayout(pageType: string, audience: string, sections: string, style: string): Promise<string>;
    reviewCode(code: string, language: string): Promise<string>;
    suggestOptimizations(code: string): Promise<string>;
}
export declare class DesignAnalyzer {
    analyzeImage(imageUrl: string): Promise<{
        colors: string[];
        fonts: string[];
        layout: string;
        patterns: string[];
    }>;
    analyzeUrl(url: string): Promise<{
        colors: string[];
        fonts: string[];
        components: string[];
        designSystem: Record<string, unknown>;
    }>;
}
declare const _default: {
    AIModelManager: typeof AIModelManager;
    CodeGenerator: typeof CodeGenerator;
    DesignAnalyzer: typeof DesignAnalyzer;
};
export default _default;
//# sourceMappingURL=index.d.ts.map