#!/usr/bin/env node
// ============================================================================
// WebBuilder CLI — Main Entry Point
// ============================================================================
import { Command } from 'commander';
import { createCommand, devCommand, buildCommand, deployCommand, componentCommand, aiCommand, agentCommand } from './commands/index.js';
import { logger } from './utils/logger.js';
const program = new Command();
program
    .name('webbuilder')
    .description('WebBuilder — Next-Generation Agentic Web Building Platform')
    .version('1.0.0');
// Create command
program
    .command('create <name>')
    .description('Create a new web project')
    .option('-t, --template <template>', 'Project template (landing, saas, ecommerce, portfolio, blog)', 'landing')
    .option('-a, --ai <agent>', 'AI agent to use (hermes, claude, codex, none)', 'hermes')
    .option('-f, --framework <framework>', 'Framework (react, vue, svelte)', 'react')
    .option('-s, --styling <styling>', 'Styling (tailwind, css-modules, styled-components)', 'tailwind')
    .option('--no-git', 'Skip git initialization')
    .action(async (name, options) => {
    try {
        await createCommand(name, options);
    }
    catch (error) {
        logger.error(`Failed to create project: ${error.message}`);
        process.exit(1);
    }
});
// Dev command
program
    .command('dev')
    .description('Start development server')
    .option('-p, --port <port>', 'Port number', '3000')
    .option('-h, --host <host>', 'Host', 'localhost')
    .option('--https', 'Enable HTTPS')
    .action(async (options) => {
    try {
        await devCommand(options);
    }
    catch (error) {
        logger.error(`Dev server error: ${error.message}`);
        process.exit(1);
    }
});
// Build command
program
    .command('build')
    .description('Build the project for production')
    .option('-o, --optimize', 'Enable full optimization', true)
    .option('--analyze', 'Analyze bundle size')
    .option('--ssg', 'Enable static site generation')
    .option('--output <dir>', 'Output directory', 'dist')
    .action(async (options) => {
    try {
        await buildCommand(options);
    }
    catch (error) {
        logger.error(`Build error: ${error.message}`);
        process.exit(1);
    }
});
// Deploy command
program
    .command('deploy')
    .description('Deploy the project')
    .option('-t, --target <target>', 'Deployment target (vercel, netlify, cloudflare, aws, docker)', 'vercel')
    .option('--preview', 'Deploy as preview', false)
    .option('--production', 'Deploy to production', false)
    .option('-d, --domain <domain>', 'Custom domain')
    .action(async (options) => {
    try {
        await deployCommand(options);
    }
    catch (error) {
        logger.error(`Deploy error: ${error.message}`);
        process.exit(1);
    }
});
// Component command
program
    .command('add <type> <name>')
    .description('Add a component, page, or feature')
    .option('-p, --props <props>', 'Component properties as JSON string')
    .option('--from <source>', 'Install from registry (shadcn, radix, custom)')
    .option('--customize <prompt>', 'Customize the component with AI')
    .action(async (type, name, options) => {
    try {
        await componentCommand(type, name, options);
    }
    catch (error) {
        logger.error(`Component error: ${error.message}`);
        process.exit(1);
    }
});
// AI command
program
    .command('ai <prompt>')
    .description('AI-assisted development — describe what you want to build')
    .option('-m, --model <model>', 'AI model to use', 'claude-3.5-sonnet')
    .option('--apply', 'Automatically apply changes', false)
    .option('--dry-run', 'Preview changes without applying', false)
    .action(async (prompt, options) => {
    try {
        await aiCommand(prompt, options);
    }
    catch (error) {
        logger.error(`AI error: ${error.message}`);
        process.exit(1);
    }
});
// Agent command
program
    .command('agent <action>')
    .description('Manage AI agents')
    .option('-t, --type <type>', 'Agent type (designer, developer, tester, optimizer, deployer)')
    .option('--task <task>', 'Task description for spawn action')
    .option('--list', 'List running agents')
    .option('--status <id>', 'Get agent status')
    .option('--logs <id>', 'Get agent logs')
    .action(async (action, options) => {
    try {
        await agentCommand(action, options);
    }
    catch (error) {
        logger.error(`Agent error: ${error.message}`);
        process.exit(1);
    }
});
// Parse arguments
program.parse();
//# sourceMappingURL=index.js.map