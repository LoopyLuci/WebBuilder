#!/usr/bin/env node
import { Command } from 'commander';
import { createServer } from './server.js';
import path from 'path';
import { existsSync } from 'fs';
const program = new Command();
program
    .name('webbuilder-server')
    .description('WebBuilder Server — Local-first server for hosting WebBuilder projects')
    .version('1.0.0')
    .option('-p, --port <port>', 'Port number', '3000')
    .option('-h, --host <host>', 'Host', '0.0.0.0')
    .option('-r, --root <path>', 'Root directory to serve', './dist')
    .option('-m, --mode <mode>', 'Mode (development, production, static)', 'production')
    .option('--no-cors', 'Disable CORS')
    .option('--no-compression', 'Disable compression')
    .option('--no-helmet', 'Disable Helmet security headers')
    .option('--no-morgan', 'Disable request logging')
    .option('--no-spa', 'Disable SPA fallback')
    .action(async (options) => {
    try {
        const root = path.resolve(options.root);
        if (!existsSync(root)) {
            console.error(`Error: Root directory "${root}" does not exist.`);
            console.error('Build your project first or specify a different root with --root');
            process.exit(1);
        }
        const server = await createServer({
            port: parseInt(options.port),
            host: options.host,
            root,
            mode: options.mode,
            enableCors: options.cors,
            enableCompression: options.compression,
            enableHelmet: options.helmet,
            enableMorgan: options.morgan,
            spa: options.spa,
        });
        await server.start();
    }
    catch (error) {
        console.error(`Failed to start server: ${error.message}`);
        process.exit(1);
    }
});
program.parse();
//# sourceMappingURL=cli.js.map