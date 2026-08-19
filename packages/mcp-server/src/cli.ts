#!/usr/bin/env node
// ============================================================================
// WebBuilder MCP Server — CLI Entry Point
// ============================================================================

import { Command } from 'commander';
import { startMCPServer } from './index.js';

const program = new Command();

program
  .name('webbuilder-mcp')
  .description('WebBuilder MCP Server — AI agent integration for building web and Android apps')
  .version('1.0.0')
  .option('-t, --transport <transport>', 'Transport type (stdio, sse)', 'stdio')
  .option('-p, --port <port>', 'Port for SSE transport', '3000')
  .action(async (options: { transport: string; port: string }) => {
    try {
      console.error('Starting WebBuilder MCP Server...');
      await startMCPServer();
    } catch (error: any) {
      console.error(`Failed to start MCP server: ${error.message}`);
      process.exit(1);
    }
  });

program.parse();
