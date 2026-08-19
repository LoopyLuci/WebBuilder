// ============================================================================
// AI/ML Package
// AI models, inference engine, and prompt management
// ============================================================================
export class AIModelManager {
    models;
    prompts;
    history;
    constructor() {
        this.models = new Map();
        this.prompts = new Map();
        this.history = [];
        this.registerDefaultModels();
        this.registerDefaultPrompts();
    }
    registerDefaultModels() {
        this.registerModel({
            id: 'gpt-4',
            name: 'GPT-4 Turbo',
            provider: 'openai',
            model: 'gpt-4-turbo-preview',
            maxTokens: 128000,
            temperature: 0.7,
            capabilities: ['code-generation', 'text', 'analysis', 'reasoning'],
        });
        this.registerModel({
            id: 'claude-3.5-sonnet',
            name: 'Claude 3.5 Sonnet',
            provider: 'anthropic',
            model: 'claude-3-5-sonnet-20241022',
            maxTokens: 200000,
            temperature: 0.7,
            capabilities: ['code-generation', 'text', 'analysis', 'reasoning', 'design'],
        });
    }
    registerDefaultPrompts() {
        this.registerPrompt({
            id: 'component-generation',
            name: 'Generate Component',
            description: 'Generate a React component from a description',
            template: `Create a {{framework}} component called "{{componentName}}" with the following requirements:
- Description: {{description}}
- Props: {{props}}
- Style: {{style}}
- Accessibility: WCAG {{wcagLevel}}

Provide the complete component code with TypeScript types.`,
            variables: ['framework', 'componentName', 'description', 'props', 'style', 'wcagLevel'],
            tags: ['component', 'code-generation'],
        });
        this.registerPrompt({
            id: 'design-system',
            name: 'Generate Design System',
            description: 'Generate a design system from a description',
            template: `Create a design system based on this description: "{{description}}"

Generate:
1. Color palette (primary, secondary, accent, semantic colors)
2. Typography scale (font families, sizes, weights)
3. Spacing system
4. Border radius values
5. Shadow/elevation levels
6. Animation presets

Output as a structured design tokens JSON.`,
            variables: ['description'],
            tags: ['design', 'tokens'],
        });
        this.registerPrompt({
            id: 'page-layout',
            name: 'Generate Page Layout',
            description: 'Generate a page layout from requirements',
            template: `Design a page layout for: "{{pageType}}"

Requirements:
- Target audience: {{audience}}
- Key sections: {{sections}}
- Style: {{style}}
- Responsive: {{responsive}}

Provide the page structure with component recommendations.`,
            variables: ['pageType', 'audience', 'sections', 'style', 'responsive'],
            tags: ['layout', 'page'],
        });
        this.registerPrompt({
            id: 'code-review',
            name: 'Code Review',
            description: 'Review code for quality, security, and best practices',
            template: `Review the following code and provide feedback:

\`\`\`{{language}}
{{code}}
\`\`\`

Focus on:
- Code quality and readability
- Performance implications
- Security vulnerabilities
- Accessibility concerns
- Best practices adherence`,
            variables: ['language', 'code'],
            tags: ['review', 'quality'],
        });
        this.registerPrompt({
            id: 'optimization',
            name: 'Performance Optimization',
            description: 'Suggest performance optimizations',
            template: `Analyze the following code and suggest performance optimizations:

\`\`\`
{{code}}
\`\`\`

Consider:
- Bundle size reduction
- Render optimization
- Caching strategies
- Code splitting
- Image optimization
- Core Web Vitals impact`,
            variables: ['code'],
            tags: ['optimization', 'performance'],
        });
    }
    registerModel(config) {
        this.models.set(config.id, config);
    }
    getModel(id) {
        return this.models.get(id);
    }
    listModels() {
        return Array.from(this.models.values());
    }
    getModelsByCapability(capability) {
        return this.listModels().filter(m => m.capabilities.includes(capability));
    }
    registerPrompt(template) {
        this.prompts.set(template.id, template);
    }
    getPrompt(id) {
        return this.prompts.get(id);
    }
    listPrompts() {
        return Array.from(this.prompts.values());
    }
    getPromptsByTag(tag) {
        return this.listPrompts().filter(p => p.tags.includes(tag));
    }
    renderPrompt(promptId, variables) {
        const prompt = this.prompts.get(promptId);
        if (!prompt)
            return '';
        let rendered = prompt.template;
        for (const [key, value] of Object.entries(variables)) {
            rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }
        return rendered;
    }
    async inference(modelId, prompt, options) {
        const model = this.models.get(modelId);
        if (!model)
            throw new Error(`Model not found: ${modelId}`);
        const start = Date.now();
        // In a real implementation, this would call the actual AI API
        const result = {
            id: `inf_${Date.now()}`,
            model: modelId,
            prompt,
            response: `Generated response for: ${prompt.substring(0, 50)}...`,
            tokensUsed: Math.floor(prompt.length / 4),
            duration: Date.now() - start,
        };
        this.history.push(result);
        return result;
    }
    getHistory() {
        return [...this.history];
    }
    clearHistory() {
        this.history = [];
    }
}
export class CodeGenerator {
    modelManager;
    constructor(modelManager) {
        this.modelManager = modelManager;
    }
    async generateComponent(name, description, framework, options) {
        const prompt = this.modelManager.renderPrompt('component-generation', {
            framework,
            componentName: name,
            description,
            props: 'standard',
            style: options?.style ?? 'modern',
            wcagLevel: options?.wcagLevel ?? 'AA',
        });
        const result = await this.modelManager.inference('claude-3.5-sonnet', prompt);
        return result.response;
    }
    async generateDesignSystem(description) {
        const prompt = this.modelManager.renderPrompt('design-system', { description });
        const result = await this.modelManager.inference('claude-3.5-sonnet', prompt);
        return result.response;
    }
    async generatePageLayout(pageType, audience, sections, style) {
        const prompt = this.modelManager.renderPrompt('page-layout', {
            pageType,
            audience,
            sections,
            style,
            responsive: 'mobile-first',
        });
        const result = await this.modelManager.inference('claude-3.5-sonnet', prompt);
        return result.response;
    }
    async reviewCode(code, language) {
        const prompt = this.modelManager.renderPrompt('code-review', { code, language });
        const result = await this.modelManager.inference('claude-3.5-sonnet', prompt);
        return result.response;
    }
    async suggestOptimizations(code) {
        const prompt = this.modelManager.renderPrompt('optimization', { code });
        const result = await this.modelManager.inference('claude-3.5-sonnet', prompt);
        return result.response;
    }
}
export class DesignAnalyzer {
    async analyzeImage(imageUrl) {
        return {
            colors: ['#3b82f6', '#8b5cf6', '#10b981'],
            fonts: ['Inter', 'JetBrains Mono'],
            layout: 'grid',
            patterns: ['card-layout', 'hero-section'],
        };
    }
    async analyzeUrl(url) {
        return {
            colors: ['#3b82f6', '#8b5cf6'],
            fonts: ['Inter'],
            components: ['hero', 'features', 'pricing'],
            designSystem: {},
        };
    }
}
export default { AIModelManager, CodeGenerator, DesignAnalyzer };
//# sourceMappingURL=index.js.map