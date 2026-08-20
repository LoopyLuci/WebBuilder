// ============================================================================
// HTML Exporter — Clean HTML5 + CSS3
// Generates a complete static HTML project with modern CSS
// ============================================================================

import type { ProjectSpec, FileChange } from '../types/index.js';
import { BaseExporter, type ExportOptions, type ExportResult } from './types.js';

export class HTMLExporter extends BaseExporter {
  readonly id = 'html' as const;
  readonly name = 'HTML';
  readonly description = 'Clean HTML5 + CSS3 static website';
  readonly fileExtension = '.html';
  readonly requiresBuild = false;

  export(options: ExportOptions): Promise<ExportResult> {
    throw new Error('Use exportSync instead');
  }

  getDependencies(): Record<string, string> {
    return {};
  }

  getDevDependencies(): Record<string, string> {
    return {};
  }

  validate(spec: ProjectSpec): { valid: boolean; errors: string[] } {
    const base = super.validate(spec);
    return base;
  }
}

/**
 * Synchronous HTML exporter for generating static HTML files
 */
export class HTMLExporterSync extends BaseExporter {
  readonly id = 'html' as const;
  readonly name = 'HTML';
  readonly description = 'Clean HTML5 + CSS3 static website';
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

    // Generate package.json if requested
    if (includePackageJson) {
      files.push(this.generatePackageJson(spec));
    }

    // Generate README if requested
    if (includeReadme) {
      files.push(this.createFile('README.md', this.generateReadme(spec, 'HTML + CSS', this.getScripts())));
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
      start: 'npx serve .',
      dev: 'npx serve . -l 3000',
    };
  }

  getInstructions(): string[] {
    return [
      '1. Open index.html in a browser, or',
      '2. Run: npm run dev',
      '3. Open http://localhost:3000',
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
})();
`;
    return this.createFile('app.js', js);
  }
}

export default HTMLExporterSync;