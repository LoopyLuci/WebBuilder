// ============================================================================
// Plugin SDK + Marketplace
// ============================================================================

export interface PluginContext {
  project: any;
  components: any;
  design: any;
  deploy: any;
}

export interface PluginAPI {
  registerComponent: (component: any) => void;
  registerTemplate: (template: any) => void;
  registerTheme: (theme: any) => void;
  registerTool: (tool: any) => void;
  registerHook: (event: string, handler: Function) => void;
  getProject: () => any;
  updateProject: (updates: any) => void;
  log: (message: string) => void;
}

export class PluginManager {
  private plugins: Map<string, PluginAPI>;
  private hooks: Map<string, Function[]>;

  constructor() {
    this.plugins = new Map();
    this.hooks = new Map();
  }

  async load(pluginId: string, pluginModule: any): Promise<void> {
    const api: PluginAPI = this.createAPI(pluginId);
    await pluginModule.default(api);
    this.plugins.set(pluginId, api);
  }

  async unload(pluginId: string): Promise<void> {
    this.plugins.delete(pluginId);
    // Remove hooks
    for (const [event, handlers] of this.hooks) {
      this.hooks.set(event, handlers.filter((_: any) => true));
    }
  }

  async executeHook(event: string, context: PluginContext): Promise<void> {
    const handlers = this.hooks.get(event) || [];
    for (const handler of handlers) {
      await handler(context);
    }
  }

  getPlugin(pluginId: string): PluginAPI | undefined {
    return this.plugins.get(pluginId);
  }

  listPlugins(): string[] {
    return Array.from(this.plugins.keys());
  }

  private createAPI(pluginId: string): PluginAPI {
    const hooks = this.hooks;
    const log = (msg: string) => console.log(`[${pluginId}] ${msg}`);

    return {
      registerComponent: (component: any) => log(`Registered component: ${component.name}`),
      registerTemplate: (template: any) => log(`Registered template: ${template.name}`),
      registerTheme: (theme: any) => log(`Registered theme: ${theme.name}`),
      registerTool: (tool: any) => log(`Registered tool: ${tool.name}`),
      registerHook: (event: string, handler: Function) => {
        if (!hooks.has(event)) hooks.set(event, []);
        hooks.get(event)!.push(handler);
      },
      getProject: () => ({}),
      updateProject: (updates: any) => log(`Updated project: ${JSON.stringify(updates)}`),
      log,
    };
  }
}

export class Marketplace {
  private items: Map<string, any>;

  constructor() {
    this.items = new Map();
  }

  async search(query: string, filters?: Record<string, string>): Promise<any[]> {
    return Array.from(this.items.values()).filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
    );
  }

  async install(itemId: string): Promise<boolean> {
    const item = this.items.get(itemId);
    if (!item) return false;
    item.installed = true;
    item.installDate = new Date().toISOString();
    return true;
  }

  async uninstall(itemId: string): Promise<boolean> {
    const item = this.items.get(itemId);
    if (!item) return false;
    item.installed = false;
    return true;
  }

  async publish(item: any): Promise<void> {
    this.items.set(item.id, { ...item, publishedAt: new Date().toISOString() });
  }

  async rate(itemId: string, rating: number, review: string): Promise<void> {
    const item = this.items.get(itemId);
    if (!item) return;
    if (!item.reviews) item.reviews = [];
    item.reviews.push({ rating, review, date: new Date().toISOString() });
  }

  getCategories(): string[] {
    return ['components', 'templates', 'themes', 'integrations', 'ai-agents', 'tools', 'workflows'];
  }
}

export default { PluginManager, Marketplace };
