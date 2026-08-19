// ============================================================================
// Logic Engine Module
// Handles all interactive behavior, state management, and data flow
// ============================================================================
import { nanoid } from 'nanoid';
// ─── Logic Engine ─────────────────────────────────────────────────────────
export class LogicEngine {
    features;
    integrations;
    workflows;
    dataModels;
    constructor() {
        this.features = new Map();
        this.integrations = new Map();
        this.workflows = new Map();
        this.dataModels = new Map();
    }
    /**
     * Initialize from a feature set
     */
    init(featureSet) {
        for (const feature of featureSet.features) {
            this.features.set(feature.id, feature);
        }
        for (const integration of featureSet.integrations) {
            this.integrations.set(integration.id, integration);
        }
        for (const workflow of featureSet.workflows) {
            this.workflows.set(workflow.id, workflow);
        }
        for (const model of featureSet.dataModels) {
            this.dataModels.set(model.id, model);
        }
    }
    /**
     * Get the full feature set
     */
    getFeatureSet() {
        return {
            features: Array.from(this.features.values()),
            integrations: Array.from(this.integrations.values()),
            workflows: Array.from(this.workflows.values()),
            dataModels: Array.from(this.dataModels.values()),
        };
    }
    // ─── Features ─────────────────────────────────────────────────────────
    /**
     * Add a feature
     */
    addFeature(feature) {
        this.features.set(feature.id, feature);
    }
    /**
     * Remove a feature
     */
    removeFeature(featureId) {
        return this.features.delete(featureId);
    }
    /**
     * Get a feature by ID
     */
    getFeature(featureId) {
        return this.features.get(featureId);
    }
    /**
     * Update a feature
     */
    updateFeature(featureId, updates) {
        const feature = this.features.get(featureId);
        if (!feature)
            return false;
        this.features.set(featureId, { ...feature, ...updates });
        return true;
    }
    /**
     * Enable a feature
     */
    enableFeature(featureId) {
        const feature = this.features.get(featureId);
        if (!feature)
            return false;
        feature.enabled = true;
        return true;
    }
    /**
     * Disable a feature
     */
    disableFeature(featureId) {
        const feature = this.features.get(featureId);
        if (!feature)
            return false;
        feature.enabled = false;
        return true;
    }
    /**
     * List all enabled features
     */
    getEnabledFeatures() {
        return Array.from(this.features.values()).filter(f => f.enabled);
    }
    // ─── Integrations ─────────────────────────────────────────────────────
    /**
     * Add an integration
     */
    addIntegration(integration) {
        this.integrations.set(integration.id, integration);
    }
    /**
     * Remove an integration
     */
    removeIntegration(integrationId) {
        return this.integrations.delete(integrationId);
    }
    /**
     * Get an integration
     */
    getIntegration(integrationId) {
        return this.integrations.get(integrationId);
    }
    /**
     * Get integrations by type
     */
    getIntegrationsByType(type) {
        return Array.from(this.integrations.values()).filter(i => i.type === type);
    }
    /**
     * Generate configuration for an integration
     */
    generateIntegrationConfig(integrationId) {
        const integration = this.integrations.get(integrationId);
        if (!integration)
            return {};
        switch (integration.provider) {
            case 'stripe':
                return {
                    publicKey: 'pk_test_...',
                    secretKey: 'sk_test_...',
                    webhookSecret: 'whsec_...',
                };
            case 'auth0':
                return {
                    domain: 'your-domain.auth0.com',
                    clientId: 'your-client-id',
                    clientSecret: 'your-client-secret',
                };
            case 'supabase':
                return {
                    url: 'https://your-project.supabase.co',
                    anonKey: 'your-anon-key',
                    serviceRoleKey: 'your-service-role-key',
                };
            default:
                return {};
        }
    }
    // ─── Workflows ───────────────────────────────────────────────────────
    /**
     * Add a workflow
     */
    addWorkflow(workflow) {
        this.workflows.set(workflow.id, workflow);
    }
    /**
     * Remove a workflow
     */
    removeWorkflow(workflowId) {
        return this.workflows.delete(workflowId);
    }
    /**
     * Get a workflow
     */
    getWorkflow(workflowId) {
        return this.workflows.get(workflowId);
    }
    /**
     * Generate code for a workflow
     */
    generateWorkflowCode(workflowId) {
        const workflow = this.workflows.get(workflowId);
        if (!workflow)
            return '';
        const code = [];
        code.push(`// Workflow: ${workflow.name}`);
        code.push(`// Trigger: ${workflow.trigger.type}`);
        code.push(`export async function ${workflow.name.replace(/[^a-zA-Z0-9]/g, '')}(event: any) {`);
        code.push(`  try {`);
        for (const step of workflow.steps) {
            code.push(`    // Step: ${step.name}`);
            code.push(`    await ${step.action}(${JSON.stringify(step.config)});`);
        }
        code.push(`  } catch (error) {`);
        code.push(`    // Error handling: ${workflow.errorHandling.type}`);
        if (workflow.errorHandling.type === 'retry' && workflow.retryPolicy) {
            code.push(`    // Retry: ${workflow.retryPolicy.maxAttempts} attempts`);
        }
        code.push(`    throw error;`);
        code.push(`  }`);
        code.push(`}`);
        return code.join('\n');
    }
    /**
     * Validate a workflow
     */
    validateWorkflow(workflowId) {
        const workflow = this.workflows.get(workflowId);
        if (!workflow) {
            return { valid: false, errors: ['Workflow not found'] };
        }
        const errors = [];
        if (!workflow.name)
            errors.push('Workflow name is required');
        if (!workflow.steps || workflow.steps.length === 0)
            errors.push('At least one step is required');
        if (!workflow.trigger)
            errors.push('Trigger is required');
        // Check for circular references in steps
        const visited = new Set();
        for (const step of workflow.steps) {
            if (visited.has(step.id)) {
                errors.push(`Duplicate step ID: ${step.id}`);
            }
            visited.add(step.id);
        }
        return { valid: errors.length === 0, errors };
    }
    // ─── Data Models ──────────────────────────────────────────────────────
    /**
     * Add a data model
     */
    addDataModel(model) {
        this.dataModels.set(model.id, model);
    }
    /**
     * Remove a data model
     */
    removeDataModel(modelId) {
        return this.dataModels.delete(modelId);
    }
    /**
     * Get a data model
     */
    getDataModel(modelId) {
        return this.dataModels.get(modelId);
    }
    /**
     * Get data model by name
     */
    getDataModelByName(name) {
        for (const model of this.dataModels.values()) {
            if (model.name === name)
                return model;
        }
        return undefined;
    }
    /**
     * Generate TypeScript interface for a data model
     */
    generateModelInterface(modelId) {
        const model = this.dataModels.get(modelId);
        if (!model)
            return '';
        const lines = [];
        lines.push(`export interface ${model.name} {`);
        for (const field of model.fields) {
            const optional = field.required ? '' : '?';
            const tsType = this.getTypeScriptType(field.type);
            lines.push(`  ${field.name}${optional}: ${tsType};`);
        }
        lines.push(`}`);
        return lines.join('\n');
    }
    /**
     * Generate Zod schema for a data model
     */
    generateModelSchema(modelId) {
        const model = this.dataModels.get(modelId);
        if (!model)
            return '';
        const lines = [];
        lines.push(`import { z } from 'zod';`);
        lines.push('');
        lines.push(`export const ${model.name}Schema = z.object({`);
        for (const field of model.fields) {
            let zodType = this.getZodType(field.type);
            if (!field.required)
                zodType += '.optional()';
            if (field.validation?.min !== undefined)
                zodType += `.min(${field.validation.min})`;
            if (field.validation?.max !== undefined)
                zodType += `.max(${field.validation.max})`;
            if (field.validation?.pattern)
                zodType += `.regex(/${field.validation.pattern}/)`;
            lines.push(`  ${field.name}: ${zodType},`);
        }
        lines.push(`});`);
        lines.push('');
        lines.push(`export type ${model.name} = z.infer<typeof ${model.name}Schema>;`);
        return lines.join('\n');
    }
    /**
     * Generate API routes for a data model
     */
    generateAPICRUD(modelId) {
        const model = this.dataModels.get(modelId);
        if (!model)
            return '';
        const name = model.name;
        const lowerName = name.toLowerCase();
        const lines = [];
        lines.push(`// API Routes for ${name}`);
        lines.push(`// Generated by WebBuilder Logic Engine`);
        lines.push('');
        lines.push(`import { NextRequest, NextResponse } from 'next/server';`);
        lines.push(`import { ${name}Schema } from '@/schemas/${lowerName}';`);
        lines.push('');
        // GET all
        lines.push(`// GET /api/${lowerName}s`);
        lines.push(`export async function GET() {`);
        lines.push(`  // TODO: Implement database query`);
        lines.push(`  const items: ${name}[] = [];`);
        lines.push(`  return NextResponse.json(items);`);
        lines.push(`}`);
        lines.push('');
        // POST
        lines.push(`// POST /api/${lowerName}s`);
        lines.push(`export async function POST(request: NextRequest) {`);
        lines.push(`  const body = await request.json();`);
        lines.push(`  const validated = ${name}Schema.parse(body);`);
        lines.push(`  // TODO: Implement create`);
        lines.push(`  return NextResponse.json(validated, { status: 201 });`);
        lines.push(`}`);
        return lines.join('\n');
    }
    /**
     * Generate React hook for data model
     */
    generateModelHook(modelId) {
        const model = this.dataModels.get(modelId);
        if (!model)
            return '';
        const name = model.name;
        const lowerName = name.toLowerCase();
        const hookName = `use${name}`;
        const lines = [];
        lines.push(`import { useState, useEffect } from 'react';`);
        lines.push(`import { ${name} } from '@/types/${lowerName}';`);
        lines.push('');
        lines.push(`export interface ${hookName}Result {`);
        lines.push(`  ${lowerName}s: ${name}[];`);
        lines.push(`  loading: boolean;`);
        lines.push(`  error: Error | null;`);
        lines.push(`  create: (data: Omit<${name}, 'id'>) => Promise<void>;`);
        lines.push(`  update: (id: string, data: Partial<${name}>) => Promise<void>;`);
        lines.push(`  remove: (id: string) => Promise<void>;`);
        lines.push(`}`);
        lines.push('');
        lines.push(`export function ${hookName}(): ${hookName}Result {`);
        lines.push(`  const [${lowerName}s, set${name}s] = useState<${name}[]>([]);`);
        lines.push(`  const [loading, setLoading] = useState(true);`);
        lines.push(`  const [error, setError] = useState<Error | null>(null);`);
        lines.push('');
        lines.push(`  useEffect(() => {`);
        lines.push(`    fetch(\`/api/${lowerName}s\`)`);
        lines.push(`      .then(res => res.json())`);
        lines.push(`      .then(data => set${name}s(data))`);
        lines.push(`      .catch(setError)`);
        lines.push(`      .finally(() => setLoading(false));`);
        lines.push(`  }, []);`);
        lines.push('');
        lines.push(`  const create = async (data: Omit<${name}, 'id'>) => {`);
        lines.push(`    const res = await fetch(\`/api/${lowerName}s\`, { method: 'POST', body: JSON.stringify(data) });`);
        lines.push(`    const newItem = await res.json();`);
        lines.push(`    set${name}s(prev => [...prev, newItem]);`);
        lines.push(`  };`);
        lines.push('');
        lines.push(`  return { ${lowerName}s, loading, error, create, update: async () => {}, remove: async () => {} };`);
        lines.push(`}`);
        return lines.join('\n');
    }
    // ─── Code Generation ──────────────────────────────────────────────────
    /**
     * Generate state management code
     */
    generateStateManagement(storeName, initialState) {
        return `import { create } from 'zustand';

interface ${storeName}State {
  ${Object.entries(initialState).map(([key, value]) => `${key}: ${typeof value}`).join('\n  ')}
}

export const use${storeName}Store = create<${storeName}State>((set) => ({
  ${Object.entries(initialState).map(([key, value]) => `${key}: ${JSON.stringify(value)},`).join('\n  ')}
}));
`;
    }
    /**
     * Generate form validation code
     */
    generateFormValidation(formName, fields) {
        const lines = [];
        lines.push(`import { z } from 'zod';`);
        lines.push('');
        lines.push(`export const ${formName}Schema = z.object({`);
        for (const field of fields) {
            let zodType = this.getZodType(field.type);
            if (!field.required)
                zodType += '.optional()';
            lines.push(`  ${field.name}: ${zodType},`);
        }
        lines.push(`});`);
        lines.push('');
        lines.push(`export type ${formName}Data = z.infer<typeof ${formName}Schema>;`);
        return lines.join('\n');
    }
    /**
     * Generate API integration code
     */
    generateAPIIntegration(integrationId) {
        const integration = this.integrations.get(integrationId);
        if (!integration)
            return '';
        switch (integration.provider) {
            case 'stripe':
                return `import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createCheckoutSession(priceId: string) {
  return stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: \`\${process.env.NEXT_PUBLIC_URL}/success\`,
    cancel_url: \`\${process.env.NEXT_PUBLIC_URL}/pricing\`,
  });
}`;
            case 'supabase':
                return `import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export { supabase };`;
            default:
                return `// Integration: ${integration.name}\n// Provider: ${integration.provider}`;
        }
    }
    // ─── Private Helpers ──────────────────────────────────────────────────
    /**
     * Get TypeScript type for a data field type
     */
    getTypeScriptType(type) {
        switch (type) {
            case 'string': return 'string';
            case 'number': return 'number';
            case 'boolean': return 'boolean';
            case 'date': return 'Date';
            case 'json': return 'Record<string, unknown>';
            case 'reference': return 'string';
            default: return 'unknown';
        }
    }
    /**
     * Get Zod type for a data field type
     */
    getZodType(type) {
        switch (type) {
            case 'string': return 'z.string()';
            case 'number': return 'z.number()';
            case 'boolean': return 'z.boolean()';
            case 'date': return 'z.date()';
            case 'json': return 'z.record(z.string(), z.unknown())';
            case 'reference': return 'z.string()';
            default: return 'z.unknown()';
        }
    }
}
// ─── Utility Functions ──────────────────────────────────────────────────────
export function createLogicEngine() {
    return new LogicEngine();
}
export function createFeature(name, type, props = {}) {
    return {
        id: nanoid(),
        name,
        description: `${name} feature`,
        type,
        props,
        enabled: true,
        dependencies: [],
    };
}
export function createIntegration(name, type, provider) {
    return {
        id: nanoid(),
        name,
        type,
        provider,
        config: {},
        enabled: true,
    };
}
export function createWorkflow(name, trigger) {
    return {
        id: nanoid(),
        name,
        description: `${name} workflow`,
        trigger,
        steps: [],
        errorHandling: { type: 'stop', notifyOnError: true },
    };
}
export function createDataModel(name, fields) {
    return {
        id: nanoid(),
        name,
        fields,
        relationships: [],
    };
}
export default LogicEngine;
//# sourceMappingURL=index.js.map