# WebBuilder

**Next-Generation Agentic Web Building Platform**

WebBuilder is a self-evolving, agent-native web development substrate where AI agents (Hermes, Claude, Codex, custom agents) are first-class citizens — not bolted-on assistants.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development
pnpm dev

# Build all packages
pnpm build

# Run tests
pnpm test
```

## 🏗️ Architecture

WebBuilder is a monorepo with the following structure:

### Packages

| Package | Description |
|---------|-------------|
| `@webbuilder/core` | Core platform logic (intent, context, component, design, logic, deploy, observe) |
| `@webbuilder/mcp-server` | MCP server for agent integration |
| `@webbuilder/agents` | Multi-agent orchestration system |
| `@webbuilder/components` | Universal component library |
| `@webbuilder/cli` | Command-line interface |
| `@webbuilder/plugins` | Plugin SDK + Marketplace |
| `@webbuilder/testing` | Testing utilities |
| `@webbuilder/ai` | AI/ML models and inference |

### Apps

| App | Description |
|-----|-------------|
| `apps/web` | Visual editor + dashboard (Next.js) |
| `apps/docs` | Documentation site |
| `apps/playground` | Interactive playground |

## 🤖 Agent Integration

WebBuilder exposes every capability as an MCP tool, making it natively usable by Hermes Agent and any MCP-compatible agent.

```typescript
import { WebBuilderMCPServer } from '@webbuilder/mcp-server';

const server = new WebBuilderMCPServer();
await server.start();
```

## 🎨 Component Library

Universal components that work across React, Vue, Svelte, Angular, and more.

```typescript
import { ComponentEngine } from '@webbuilder/core';

const engine = new ComponentEngine();
const components = engine.getByCategory('layout');
```

## 🧪 Testing

```typescript
import { TestRunner } from '@webbuilder/testing';

const runner = new TestRunner('vitest');
const results = await runner.runTests();
```

## 📦 Deployment

Deploy to any target with one click:

- Vercel, Netlify, Cloudflare
- AWS, GCP, Azure
- Docker, Kubernetes
- Self-hosted

## 🔌 Plugins

Extend WebBuilder with the plugin SDK:

```typescript
import { PluginManager } from '@webbuilder/plugins';

const manager = new PluginManager();
await manager.load('my-plugin', pluginModule);
```

## 📄 License

MIT
