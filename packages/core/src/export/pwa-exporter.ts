// ============================================================================
// PWA Exporter — Progressive Web App
// Generates a PWA with service worker, manifest, and offline support
// ============================================================================

import type { ProjectSpec, FileChange } from '../types/index.js';
import { BaseExporter, type ExportOptions, type ExportResult } from './types.js';

export class PWAExporter extends BaseExporter {
  readonly id = 'pwa' as const;
  readonly name = 'PWA';
  readonly description = 'Progressive Web App with service worker and manifest';
  readonly fileExtension = '.html';
  readonly requiresBuild = false;

  export(options: ExportOptions): Promise<ExportResult> {
    return Promise.resolve(this.exportSync(options));
  }

  exportSync(options: ExportOptions): ExportResult {
    const { spec, includePackageJson = true, includeReadme = true } = options;
    const files: FileChange[] = [];
    const warnings: string[] = [];

    // Generate HTML pages
    for (const page of spec.structure.pages) {
      files.push(this.generateHTMLPage(spec, page));
    }

    // Generate CSS
    files.push(this.generateCSS(spec));

    // Generate JavaScript
    files.push(this.generateJS(spec));

    // Generate PWA-specific files
    files.push(this.generateManifest(spec));
    files.push(this.generateServiceWorker(spec));
    files.push(this.generateOfflinePage(spec));

    // Generate icons placeholder
    files.push(this.createFile('icons/.gitkeep', ''));

    // Generate package.json if requested
    if (includePackageJson) {
      files.push(this.generatePackageJson(spec));
    }

    // Generate README if requested
    if (includeReadme) {
      files.push(this.createFile('README.md', this.generateReadme(spec, 'Progressive Web App (PWA)', this.getScripts())));
    }

    // Generate .gitignore
    files.push(this.createFile('.gitignore', this.generateGitignore()));

    return {
      success: true,
      files,
      dependencies: this.getDependencies(),
      devDependencies: this.getDevDependencies(),
      scripts: this.getScripts(),
      instructions: this.getInstructions(),
      warnings,
      format: this.id,
    };
  }

  getDependencies(): Record<string, string> {
    return {};
  }

  getDevDependencies(): Record<string, string> {
    return {};
  }

  getScripts(): Record<string, string> {
    return {
      'start': 'npx serve .',
      'dev': 'npx serve . -l 3000',
    };
  }

  getInstructions(): string[] {
    return [
      '1. Open index.html in a browser, or',
      '2. Run: npm run dev',
      '3. Open http://localhost:3000',
      '4. For PWA features, serve over HTTPS in production',
    ];
  }

  private generatePackageJson(spec: ProjectSpec): FileChange {
    const pkg = {
      name: this.toKebabCase(spec.name),
      version: '1.0.0',
      description: spec.description,
      scripts: this.getScripts(),
      license: 'MIT',
    };
    return this.createFile('package.json', JSON.stringify(pkg, null, 2));
  }

  private generateHTMLPage(spec: ProjectSpec, page: any): FileChange {
    const pageName = page.path === '/' ? 'index' : page.path.replace(/^\//, '').replace(/\//g, '-');
    const colors = this.extractColors(spec.design?.tokens || {});
    const fonts = this.extractFonts(spec.design?.tokens || {});

    const fontSans = fonts.sans?.join(', ') || 'Inter, system-ui, sans-serif';
    const fontHeading = fonts.heading?.join(', ') || fontSans;

    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${page.description || spec.description}">
  <meta name="theme-color" content="${colors.primary || '#3b82f6'}">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="apple-mobile-web-app-title" content="${spec.name}">
  <link rel="manifest" href="manifest.json">
  <link rel="apple-touch-icon" href="icons/icon-192.png">
  <title>${page.title || spec.name}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
`;

    // Generate sections
    for (const section of page.sections || []) {
      html += this.generateSectionHTML(section, colors, fontHeading);
    }

    html += `
  <script src="app.js"></script>
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('sw.js')
          .then(function(reg) {
            console.log('ServiceWorker registered:', reg.scope);
          })
          .catch(function(err) {
            console.log('ServiceWorker registration failed:', err);
          });
      });
    }
  </script>
</body>
</html>`;

    return this.createFile(`${pageName}.html`, html);
  }

  private generateSectionHTML(section: any, colors: Record<string, string>, fontHeading: string): string {
    const sectionType = section.component || section.type || 'section';
    const props = section.props || {};
    const title = props.title || section.name || '';
    const subtitle = props.subtitle || '';

    switch (sectionType) {
      case 'hero':
        return `  <section class="hero" style="--primary: ${colors.primary || '#3b82f6'}">
    <div class="container">
      <h1 style="font-family: ${fontHeading}">${title}</h1>
      ${subtitle ? `<p class="subtitle">${subtitle}</p>` : ''}
    </div>
  </section>
`;

      case 'features':
        return `  <section class="features">
    <div class="container">
      <h2 style="font-family: ${fontHeading}">${title}</h2>
      <div class="features-grid">
        <!-- Feature items -->
      </div>
    </div>
  </section>
`;

      case 'cta':
        return `  <section class="cta" style="background: ${colors.primary || '#3b82f6'}">
    <div class="container">
      <h2 style="font-family: ${fontHeading}">${title}</h2>
      ${subtitle ? `<p>${subtitle}</p>` : ''}
    </div>
  </section>
`;

      case 'footer':
        return `  <footer class="footer">
    <div class="container">
      <p>&copy; ${new Date().getFullYear()} ${title || 'All rights reserved'}</p>
    </div>
  </footer>
`;

      default:
        return `  <section class="section ${this.toKebabCase(sectionType)}">
    <div class="container">
      ${title ? `<h2 style="font-family: ${fontHeading}">${title}</h2>` : ''}
      ${subtitle ? `<p>${subtitle}</p>` : ''}
    </div>
  </section>
`;
    }
  }

  private generateCSS(spec: ProjectSpec): FileChange {
    const colors = this.extractColors(spec.design?.tokens || {});
    const fonts = this.extractFonts(spec.design?.tokens || {});

    const fontSans = fonts.sans?.join(', ') || 'Inter, system-ui, sans-serif';
    const fontHeading = fonts.heading?.join(', ') || fontSans;
    const primary = colors.primary || '#3b82f6';
    const secondary = colors.secondary || '#8b5cf6';

    const css = `:root {
  --color-primary: ${primary};
  --color-secondary: ${secondary};
  --color-text: ${colors.gray || '#1f2937'};
  --color-bg: ${colors.white || '#ffffff'};
  --font-sans: ${fontSans};
  --font-heading: ${fontHeading};
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 2rem;
  --spacing-xl: 4rem;
  --radius: 0.5rem;
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-sans);
  color: var(--color-text);
  background-color: var(--color-bg);
  line-height: 1.6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  line-height: 1.2;
  margin-bottom: var(--spacing-md);
}

h1 { font-size: 3rem; }
h2 { font-size: 2.25rem; }
h3 { font-size: 1.5rem; }

p {
  margin-bottom: var(--spacing-md);
}

.hero {
  padding: var(--spacing-xl) 0;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: white;
  text-align: center;
}

.hero h1 {
  font-size: 3.5rem;
  margin-bottom: var(--spacing-md);
}

.hero .subtitle {
  font-size: 1.25rem;
  opacity: 0.9;
}

.features {
  padding: var(--spacing-xl) 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-lg);
  margin-top: var(--spacing-lg);
}

.cta {
  padding: var(--spacing-xl) 0;
  text-align: center;
  color: white;
}

.cta h2 {
  margin-bottom: var(--spacing-md);
}

.footer {
  padding: var(--spacing-lg) 0;
  background: var(--color-text);
  color: var(--color-bg);
  text-align: center;
}

.section {
  padding: var(--spacing-xl) 0;
}

/* PWA Install Banner */
.pwa-install-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-primary);
  color: white;
  padding: var(--spacing-md);
  display: none;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
}

.pwa-install-banner.visible {
  display: flex;
}

.pwa-install-banner button {
  background: white;
  color: var(--color-primary);
  border: none;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius);
  cursor: pointer;
  font-weight: bold;
}

@media (max-width: 768px) {
  h1 { font-size: 2rem; }
  h2 { font-size: 1.75rem; }
  .hero h1 { font-size: 2.5rem; }
}
`;

    return this.createFile('styles.css', css);
  }

  private generateJS(spec: ProjectSpec): FileChange {
    const js = `// ${spec.name} - Main JavaScript
(function() {
  'use strict';

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Intersection Observer for animations
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.section, .features-grid > *').forEach(function(el) {
    observer.observe(el);
  });

  // PWA Install Prompt
  var deferredPrompt;
  var installBanner = document.createElement('div');
  installBanner.className = 'pwa-install-banner';
  installBanner.innerHTML = '<span>Install ${spec.name} app?</span><div><button id="pwa-install-btn">Install</button><button id="pwa-dismiss-btn">Not now</button></div>';

  window.addEventListener('beforeinstallprompt', function(e) {
    e.preventDefault();
    deferredPrompt = e;
    document.body.appendChild(installBanner);
    installBanner.classList.add('visible');
  });

  document.addEventListener('click', function(e) {
    if (e.target.id === 'pwa-install-btn') {
      installBanner.classList.remove('visible');
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function(choice) {
          deferredPrompt = null;
        });
      }
    }
    if (e.target.id === 'pwa-dismiss-btn') {
      installBanner.classList.remove('visible');
    }
  });

  // Online/Offline detection
  window.addEventListener('online', function() {
    document.body.classList.remove('offline');
  });

  window.addEventListener('offline', function() {
    document.body.classList.add('offline');
  });
})();
`;
    return this.createFile('app.js', js);
  }

  private generateManifest(spec: ProjectSpec): FileChange {
    const colors = this.extractColors(spec.design?.tokens || {});
    const manifest = {
      name: spec.name,
      short_name: spec.name.substring(0, 12),
      description: spec.description,
      start_url: '/',
      display: 'standalone',
      background_color: colors.white || '#ffffff',
      theme_color: colors.primary || '#3b82f6',
      orientation: 'portrait',
      icons: [
        {
          src: 'icons/icon-72.png',
          sizes: '72x72',
          type: 'image/png',
        },
        {
          src: 'icons/icon-96.png',
          sizes: '96x96',
          type: 'image/png',
        },
        {
          src: 'icons/icon-128.png',
          sizes: '128x128',
          type: 'image/png',
        },
        {
          src: 'icons/icon-144.png',
          sizes: '144x144',
          type: 'image/png',
        },
        {
          src: 'icons/icon-152.png',
          sizes: '152x152',
          type: 'image/png',
        },
        {
          src: 'icons/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'icons/icon-384.png',
          sizes: '384x384',
          type: 'image/png',
        },
        {
          src: 'icons/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    };
    return this.createFile('manifest.json', JSON.stringify(manifest, null, 2));
  }

  private generateServiceWorker(spec: ProjectSpec): FileChange {
    const cacheName = `${this.toKebabCase(spec.name)}-v1`;
    const sw = `// Service Worker for ${spec.name}
const CACHE_NAME = '${cacheName}';
const OFFLINE_URL = 'offline.json';

// Files to cache on install
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json'
];

// Install event - cache core files
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName !== CACHE_NAME;
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Return cached response if found
        if (response) {
          return response;
        }

        // Clone the request
        var fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(function(response) {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          var responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(function() {
          // Return offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.json');
          }
        });
      })
  );
});

// Handle push notifications (optional)
self.addEventListener('push', function(event) {
  if (event.data) {
    var data = event.data.json();
    var options = {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
    };
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
`;
    return this.createFile('sw.js', sw);
  }

  private generateOfflinePage(spec: ProjectSpec): FileChange {
    const offlinePage = {
      title: 'Offline',
      message: 'You are currently offline. Please check your connection.',
    };
    return this.createFile('offline.json', JSON.stringify(offlinePage, null, 2));
  }
}

export default PWAExporter;