// ============================================================================
// Tool Registry — Manages tool registration, discovery, and execution
// ============================================================================

import {
  ToolDefinition,
  RegisteredTool,
  ToolParameter,
  ToolResult,
  ToolContext,
  ProviderToolDefinition,
} from './types.js';

export class ToolRegistry {
  private tools: Map<string, RegisteredTool> = new Map();

  // ---------- Registration ----------

  register(definition: ToolDefinition): void {
    if (this.tools.has(definition.name)) {
      throw new Error(`Tool already registered: ${definition.name}`);
    }

    this.validateToolDefinition(definition);

    this.tools.set(definition.name, {
      definition,
      enabled: true,
      category: this.inferCategory(definition.name),
    });
  }

  registerBatch(definitions: ToolDefinition[]): void {
    for (const def of definitions) {
      this.register(def);
    }
  }

  unregister(name: string): boolean {
    return this.tools.delete(name);
  }

  // ---------- Query ----------

  get(name: string): ToolDefinition | undefined {
    const registered = this.tools.get(name);
    return registered?.enabled ? registered.definition : undefined;
  }

  getRegistered(name: string): RegisteredTool | undefined {
    return this.tools.get(name);
  }

  listTools(): string[] {
    return Array.from(this.tools.entries())
      .filter(([, r]) => r.enabled)
      .map(([name]) => name);
  }

  listAll(): RegisteredTool[] {
    return Array.from(this.tools.values());
  }

  has(name: string): boolean {
    const tool = this.tools.get(name);
    return tool !== undefined && tool.enabled;
  }

  // ---------- Enable/Disable ----------

  enable(name: string): boolean {
    const tool = this.tools.get(name);
    if (tool) {
      tool.enabled = true;
      return true;
    }
    return false;
  }

  disable(name: string): boolean {
    const tool = this.tools.get(name);
    if (tool) {
      tool.enabled = false;
      return true;
    }
    return false;
  }

  isEnabled(name: string): boolean {
    return this.tools.get(name)?.enabled ?? false;
  }

  // ---------- Categories ----------

  getByCategory(category: string): ToolDefinition[] {
    return Array.from(this.tools.values())
      .filter((r) => r.category === category && r.enabled)
      .map((r) => r.definition);
  }

  getCategories(): string[] {
    const categories = new Set<string>();
    for (const tool of this.tools.values()) {
      if (tool.category) categories.add(tool.category);
    }
    return Array.from(categories);
  }

  // ---------- Execution ----------

  async execute(name: string, input: Record<string, unknown>, context: ToolContext): Promise<ToolResult> {
    const tool = this.get(name);
    if (!tool) {
      return { success: false, output: `Tool not found: ${name}` };
    }

    try {
      const result = await tool.handler(input, context);
      return result;
    } catch (error) {
      return {
        success: false,
        output: `Tool execution error: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  // ---------- Provider Format ----------

  getProviderDefinitions(): ProviderToolDefinition[] {
    return Array.from(this.tools.values())
      .filter((r) => r.enabled)
      .map((r) => this.toProviderDefinition(r.definition));
  }

  private toProviderDefinition(tool: ToolDefinition): ProviderToolDefinition {
    const properties: Record<string, { type: string; description: string; enum?: (string | number)[] }> = {};
    const required: string[] = [];

    for (const param of tool.parameters) {
      properties[param.name] = {
        type: param.type,
        description: param.description,
        ...(param.enum ? { enum: param.enum } : {}),
      };
      if (param.required) {
        required.push(param.name);
      }
    }

    return {
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: {
          type: 'object',
          properties,
          ...(required.length > 0 ? { required } : {}),
        },
      },
    };
  }

  // ---------- Validation ----------

  private validateToolDefinition(definition: ToolDefinition): void {
    if (!definition.name || typeof definition.name !== 'string') {
      throw new Error('Tool name is required and must be a string');
    }
    if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(definition.name)) {
      throw new Error(`Invalid tool name: ${definition.name}. Must start with a letter and contain only alphanumeric, underscore, or hyphen.`);
    }
    if (!definition.description || typeof definition.description !== 'string') {
      throw new Error('Tool description is required and must be a string');
    }
    if (!Array.isArray(definition.parameters)) {
      throw new Error('Tool parameters must be an array');
    }
    if (typeof definition.handler !== 'function') {
      throw new Error('Tool handler must be a function');
    }

    // Validate parameter names are unique
    const paramNames = new Set<string>();
    for (const param of definition.parameters) {
      if (paramNames.has(param.name)) {
        throw new Error(`Duplicate parameter name: ${param.name} in tool ${definition.name}`);
      }
      paramNames.add(param.name);
    }
  }

  // ---------- Helpers ----------

  private inferCategory(name: string): string {
    if (name.includes('search') || name.includes('query') || name.includes('find')) return 'search';
    if (name.includes('create') || name.includes('generate') || name.includes('write')) return 'creation';
    if (name.includes('update') || name.includes('edit') || name.includes('modify')) return 'modification';
    if (name.includes('delete') || name.includes('remove') || name.includes('clear')) return 'deletion';
    if (name.includes('read') || name.includes('get') || name.includes('fetch')) return 'retrieval';
    if (name.includes('analyze') || name.includes('process') || name.includes('compute')) return 'analysis';
    return 'general';
  }

  // ---------- Stats ----------

  getStats(): { total: number; enabled: number; disabled: number; categories: number } {
    const all = Array.from(this.tools.values());
    return {
      total: all.length,
      enabled: all.filter((t) => t.enabled).length,
      disabled: all.filter((t) => !t.enabled).length,
      categories: this.getCategories().length,
    };
  }
}

export default ToolRegistry;