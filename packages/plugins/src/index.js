// ============================================================================
// Plugin SDK + Marketplace
// ============================================================================
export class PluginManager {
    plugins;
    hooks;
    constructor() {
        this.plugins = new Map();
        this.hooks = new Map();
    }
    async load(pluginId, pluginModule) {
        const api = this.createAPI(pluginId);
        await pluginModule.default(api);
        this.plugins.set(pluginId, api);
    }
    async unload(pluginId) {
        this.plugins.delete(pluginId);
        // Remove hooks
        for (const [event, handlers] of this.hooks) {
            this.hooks.set(event, handlers.filter((_) => true));
        }
    }
    async executeHook(event, context) {
        const handlers = this.hooks.get(event) || [];
        for (const handler of handlers) {
            await handler(context);
        }
    }
    getPlugin(pluginId) {
        return this.plugins.get(pluginId);
    }
    listPlugins() {
        return Array.from(this.plugins.keys());
    }
    createAPI(pluginId) {
        const hooks = this.hooks;
        const log = (msg) => console.log(`[${pluginId}] ${msg}`);
        return {
            registerComponent: (component) => log(`Registered component: ${component.name}`),
            registerTemplate: (template) => log(`Registered template: ${template.name}`),
            registerTheme: (theme) => log(`Registered theme: ${theme.name}`),
            registerTool: (tool) => log(`Registered tool: ${tool.name}`),
            registerHook: (event, handler) => {
                if (!hooks.has(event))
                    hooks.set(event, []);
                hooks.get(event).push(handler);
            },
            getProject: () => ({}),
            updateProject: (updates) => log(`Updated project: ${JSON.stringify(updates)}`),
            log,
        };
    }
}
export class Marketplace {
    items;
    constructor() {
        this.items = new Map();
    }
    async search(query, filters) {
        return Array.from(this.items.values()).filter(item => item.name.toLowerCase().includes(query.toLowerCase()) ||
            item.description.toLowerCase().includes(query.toLowerCase()));
    }
    async install(itemId) {
        const item = this.items.get(itemId);
        if (!item)
            return false;
        item.installed = true;
        item.installDate = new Date().toISOString();
        return true;
    }
    async uninstall(itemId) {
        const item = this.items.get(itemId);
        if (!item)
            return false;
        item.installed = false;
        return true;
    }
    async publish(item) {
        this.items.set(item.id, { ...item, publishedAt: new Date().toISOString() });
    }
    async rate(itemId, rating, review) {
        const item = this.items.get(itemId);
        if (!item)
            return;
        if (!item.reviews)
            item.reviews = [];
        item.reviews.push({ rating, review, date: new Date().toISOString() });
    }
    getCategories() {
        return ['components', 'templates', 'themes', 'integrations', 'ai-agents', 'tools', 'workflows'];
    }
}
export default { PluginManager, Marketplace };
//# sourceMappingURL=index.js.map