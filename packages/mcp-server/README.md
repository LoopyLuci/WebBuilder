# @webbuilder/mcp-server

WebBuilder MCP Server — AI agent integration for building web and Android apps via the Model Context Protocol.

## Installation

```bash
npm install @webbuilder/mcp-server
```

## Usage

### As a CLI tool

```bash
# Start the MCP server (stdio transport)
npx @webbuilder/mcp-server

# Or install globally
npm install -g @webbuilder/mcp-server
webbuilder-mcp
```

### As a library

```typescript
import { startMCPServer } from '@webbuilder/mcp-server';

await startMCPServer();
```

### With Claude Desktop / Cursor / Windsurf

Add to your MCP configuration:

```json
{
  "mcpServers": {
    "webbuilder": {
      "command": "npx",
      "args": ["@webbuilder/mcp-server"]
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| `webbuilder/project/create` | Create a new web project from natural language |
| `webbuilder/project/list` | List all projects |
| `webbuilder/project/get` | Get project details |
| `webbuilder/project/delete` | Delete a project |
| `webbuilder/codegen/generate` | Generate code files for a project |
| `webbuilder/component/search` | Search for components |
| `webbuilder/design/generate` | Generate a design system |
| `webbuilder/design/apply-theme` | Apply a theme |
| `webbuilder/deploy/preview` | Deploy a preview |
| `webbuilder/deploy/production` | Deploy to production |
| `webbuilder/test/generate` | Generate tests |
| `webbuilder/test/run` | Run tests |
| `webbuilder/optimize/performance` | Optimize performance |
| `webbuilder/optimize/accessibility` | Check accessibility |
| `webbuilder/optimize/seo` | Optimize SEO |
| `webbuilder/android/create` | Create Android project |
| `webbuilder/android/components` | List Android components |
| `webbuilder/android/devices` | List device presets |

## License

MIT
