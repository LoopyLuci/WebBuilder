// ============================================================================
// WebBuilder Frameworks — Central Export Point
// Multi-framework adapters for generating components from WebBuilder specs
// ============================================================================

export { VueAdapter } from './vue/index.js';
export { SvelteAdapter } from './svelte/index.js';
export { iOSAdapter } from './ios/index.js';
export { FlutterAdapter } from './flutter/index.js';

export type { VueAdapterConfig } from './vue/index.js';
export type { SvelteAdapterConfig } from './svelte/index.js';
export type { iOSAdapterConfig } from './ios/index.js';
export type { FlutterAdapterConfig } from './flutter/index.js';