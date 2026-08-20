// ============================================================================
// WebBuilder Core — Example Plugin
// Demonstrates how to build a plugin using the plugin API
// ============================================================================

import type { PluginAPI, PluginInstance, PluginManifest } from './types.js';

// ─── Plugin Manifest ─────────────────────────────────────────────────────────

export const manifest: PluginManifest = {
  id: 'example-analytics-plugin',
  name: 'Analytics Integration',
  version: '1.0.0',
  description: 'Adds analytics tracking and page view reporting to generated projects',
  author: 'WebBuilder Team',
  type: 'integration',
  main: 'index.ts',
  keywords: ['analytics', 'tracking', 'reporting'],
  permissions: ['registry:register', 'codegen:modify', 'filesystem:read'],
  dependencies: [],
  hooks: ['codegen:complete', 'deploy:pre-deploy'],
  extensionPoints: ['component:generate', 'page:generate'],
  configSchema: {
    trackingId: { type: 'string', description: 'Analytics tracking ID' },
    provider: { type: 'string', description: 'Analytics provider (gtag, segment, etc.)' },
  },
  minPlatformVersion: '1.0.0',
  license: 'MIT',
};

// ─── Plugin Instance ─────────────────────────────────────────────────────────

export const plugin: PluginInstance = {
  /**
   * Initialize the plugin (called once when loaded)
   */
  async init(api: PluginAPI): Promise<void> {
    api.log('info', 'Analytics plugin initialized');
    api.log('debug', 'Permissions:', api.permissions);

    // Register hook for code generation completion
    api.addFilter('codegen:complete', async (files) => {
      api.log('info', `Adding analytics to ${files.length} files`);

      // Add analytics script to HTML files
      const analyticsScript = generateAnalyticsSnippet(api.getConfig());
      const enhancedFiles = files.map((file) => {
        if (file.path.endsWith('.html') || file.path === 'layout.tsx') {
          return {
            ...file,
            content: file.content.replace(
              '</head>',
              `${analyticsScript}\n</head>`
            ),
          };
        }
        return file;
      });

      return enhancedFiles;
    }, 10);

    // Register hook for pre-deployment
    api.addAction('deploy:pre-deploy', async (config) => {
      api.log('info', 'Pre-deploy: validating analytics config');
    });
  },

  /**
   * Activate the plugin (called when enabled)
   */
  async activate(api: PluginAPI): Promise<void> {
    api.log('info', 'Analytics plugin activated');

    // Register a custom generator for analytics reports
    api.registerGenerator({
      name: 'analytics-report',
      description: 'Generate analytics tracking report',
      trigger: 'manual',
      generate: async (spec, options) => {
        const report = {
          projectId: spec.id,
          pages: spec.structure.pages.length,
          trackingEnabled: true,
          provider: api.getConfig().provider || 'gtag',
          timestamp: new Date().toISOString(),
        };

        return [{
          path: 'analytics-report.json',
          content: JSON.stringify(report, null, 2),
        }];
      },
    });

    // Register an exporter for analytics configuration
    api.registerExporter({
      name: 'analytics-config',
      format: 'json',
      description: 'Export analytics configuration',
      export: async (spec, options) => {
        const config = {
          trackingId: api.getConfig().trackingId || 'UA-XXXXX',
          pages: spec.structure.pages.map(p => p.path),
        };
        return JSON.stringify(config, null, 2);
      },
    });

    // Register a tool for checking analytics setup
    api.registerTool({
      name: 'analytics-check',
      description: 'Check if analytics is properly configured',
      category: 'validation',
      execute: async (input, options) => {
        const trackingId = api.getConfig().trackingId;
        return {
          configured: !!trackingId,
          trackingId: trackingId || null,
          recommendations: trackingId ? [] : ['Set a tracking ID in plugin config'],
        };
      },
    });
  },

  /**
   * Deactivate the plugin
   */
  async deactivate(api: PluginAPI): Promise<void> {
    api.log('info', 'Analytics plugin deactivated');
  },

  /**
   * Destroy the plugin (cleanup)
   */
  async destroy(api: PluginAPI): Promise<void> {
    api.log('info', 'Analytics plugin destroyed');
  },

  /**
   * Handle configuration changes
   */
  async onConfigChange(config: Record<string, unknown>, api: PluginAPI): Promise<void> {
    api.log('info', 'Analytics config updated:', config);
  },
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

function generateAnalyticsSnippet(config: Record<string, unknown>): string {
  const trackingId = (config.trackingId as string) || 'UA-XXXXX-Y';
  const provider = (config.provider as string) || 'gtag';

  if (provider === 'gtag') {
    return `<script async src="https://www.googletagmanager.com/gtag/js?id=${trackingId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${trackingId}');
</script>`;
  }

  if (provider === 'segment') {
    return `<script>
  !function(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","once","off","on","addSourceMiddleware","addIntegrationMiddleware","setAnonymousId","addDestinationMiddleware"];analytics.factory=function(e){return function(){var t=Array.prototype.slice.call(arguments);t.unshift(e);analytics.push(t);return analytics}};for(var e=0;e<analytics.methods.length;e++){var key=analytics.methods[e];analytics[key]=analytics.factory(key)}analytics.load=function(key,e){var t=document.createElement("script");t.type="text/javascript";t.async=!0;t.src="https://cdn.segment.com/analytics.js/v1/" + key + "/analytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n);analytics._writeKey=key;analytics._loadOptions=e};analytics.SNIPPET_VERSION="4.13.2";
  analytics.load("${trackingId}");
  analytics.page();
  }}();
</script>`;
  }

  return `<!-- Analytics: ${provider} (${trackingId}) -->`;
}

// ─── Default Export ──────────────────────────────────────────────────────────

export default plugin;