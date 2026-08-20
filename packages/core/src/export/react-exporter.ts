// ============================================================================
// React Exporter — React + Tailwind CSS
// Generates a complete React project with Tailwind CSS styling
// ============================================================================

import type { ProjectSpec, FileChange } from '../types/index.js';
import { BaseExporter, type ExportOptions, type ExportResult } from './types.js';

export class ReactExporter extends BaseExporter {
  readonly id = 'react' as const;
  readonly name = 'React';
  readonly description = 'React + Tailwind CSS application';
  readonly fileExtension = '.tsx';
  readonly requiresBuild = true;

  export(options: ExportOptions): Promise<ExportResult> {
    return Promise.resolve(this.exportSync(options));
  }

  exportSync(options: ExportOptions): ExportResult {
    const { spec, includePackageJson = true, includeReadme = true } = options;
    const files: FileChange[] = [];
    const warnings: string[] = [];

    // Generate config files
    files.push(this.generatePackageJson(spec));
    files.push(this.generateTsConfig());
    files.push(this.generateTailwindConfig(spec));
    files.push(this.generatePostcssConfig());
    files.push(this.generateViteConfig(spec));
    files.push(this.generateGitignore());

    // Generate app entry
    files.push(this.generateIndexHTML(spec));
    files.push(this.generateMain(spec));
    files.push(this.generateApp(spec));
    files.push(this.generateGlobalCSS(spec));

    // Generate pages
    for (const page of spec.structure.pages) {
      files.push(this.generatePage(page, spec));
    }

    // Generate components
    const usedComponents = this.getUsedComponents(spec);
    for (const compId of usedComponents) {
      files.push(this.generateComponent(compId, spec));
    }

    // Generate README if requested
    if (includeReadme) {
      files.push(this.createFile('README.md', this.generateReadme(spec, 'React + Tailwind CSS', this.getScripts())));
    }

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
    return {
      'react': '^18.2.0',
      'react-dom': '^18.2.0',
      'react-router-dom': '^6.22.0',
    };
  }

  getDevDependencies(): Record<string, string> {
    return {
      '@types/react': '^18.2.0',
      '@types/react-dom': '^18.2.0',
      '@vitejs/plugin-react': '^4.2.0',
      'autoprefixer': '^10.4.0',
      'postcss': '^8.4.0',
      'tailwindcss': '^3.4.0',
      'typescript': '^5.4.0',
      'vite': '^5.1.0',
    };
  }

  getScripts(): Record<string, string> {
    return {
      'dev': 'vite',
      'build': 'tsc && vite build',
      'preview': 'vite preview',
    };
  }

  getInstructions(): string[] {
    return [
      '1. Install dependencies: npm install',
      '2. Start dev server: npm run dev',
      '3. Open http://localhost:5173',
      '4. Build for production: npm run build',
    ];
  }

  private generatePackageJson(spec: ProjectSpec): FileChange {
    const pkg = {
      name: this.toKebabCase(spec.name),
      version: '1.0.0',
      private: true,
      type: 'module',
      scripts: this.getScripts(),
      dependencies: this.getDependencies(),
      devDependencies: this.getDevDependencies(),
    };
    return this.createFile('package.json', JSON.stringify(pkg, null, 2));
  }

  private generateTsConfig(): FileChange {
    const config = {
      compilerOptions: {
        target: 'ES2020',
        useDefineForClassFields: true,
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        skipLibCheck: true,
        moduleResolution: 'bundler',
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: 'react-jsx',
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true,
        paths: {
          '@/*': ['./src/*'],
        },
      },
      include: ['src'],
      references: [{ path: './tsconfig.node.json' }],
    };
    return this.createFile('tsconfig.json', JSON.stringify(config, null, 2));
  }

  private generateTailwindConfig(spec: ProjectSpec): FileChange {
    const colors = this.extractColors(spec.design?.tokens || {});
    const fonts = this.extractFonts(spec.design?.tokens || {});

    const config = {
      content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
      theme: {
        extend: {
          colors: {
            primary: colors.primary || '#3b82f6',
            secondary: colors.secondary || '#8b5cf6',
          },
          fontFamily: {
            sans: fonts.sans || ['Inter', 'system-ui', 'sans-serif'],
            heading: fonts.heading || fonts.sans || ['Inter', 'system-ui', 'sans-serif'],
          },
        },
      },
      plugins: [],
    };
    return this.createFile('tailwind.config.js', `/** @type {import('tailwindcss').Config} */\nmodule.exports = ${JSON.stringify(config, null, 2)};\n`);
  }

  private generatePostcssConfig(): FileChange {
    return this.createFile('postcss.config.js', `module.exports = {\n  plugins: {\n    tailwindcss: {},\n    autoprefixer: {},\n  },\n};\n`);
  }

  private generateViteConfig(spec: ProjectSpec): FileChange {
    const content = `import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\nimport path from 'path';\n\nexport default defineConfig({\n  plugins: [react()],\n  resolve: {\n    alias: {\n      '@': path.resolve(__dirname, './src'),\n    },\n  },\n});\n`;
    return this.createFile('vite.config.ts', content);
  }

  private generateIndexHTML(spec: ProjectSpec): FileChange {
    const content = `<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>${spec.name}</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.tsx"></script>\n  </body>\n</html>\n`;
    return this.createFile('index.html', content);
  }

  private generateMain(spec: ProjectSpec): FileChange {
    const content = `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport { BrowserRouter } from 'react-router-dom';\nimport App from './App';\nimport './globals.css';\n\nReactDOM.createRoot(document.getElementById('root')!).render(\n  <React.StrictMode>\n    <BrowserRouter>\n      <App />\n    </BrowserRouter>\n  </React.StrictMode>\n);\n`;
    return this.createFile('src/main.tsx', content);
  }

  private generateApp(spec: ProjectSpec): FileChange {
    const routes = spec.structure.pages.map((page: any) => {
      const compName = this.toPascalCase(page.name || 'Page');
      const path = page.path || '/';
      return `      <Route path="${path}" element={<${compName} />} />`;
    }).join('\n');

    const imports = spec.structure.pages.map((page: any) => {
      const compName = this.toPascalCase(page.name || 'Page');
      return `import ${compName} from './pages/${compName}';`;
    }).join('\n');

    const content = `import { Routes, Route } from 'react-router-dom';\n${imports}\n\nexport default function App() {\n  return (\n    <Routes>\n${routes}\n    </Routes>\n  );\n}\n`;
    return this.createFile('src/App.tsx', content);
  }

  private generateGlobalCSS(spec: ProjectSpec): FileChange {
    const colors = this.extractColors(spec.design?.tokens || {});
    let css = `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n:root {\n`;
    for (const [name, value] of Object.entries(colors)) {
      css += `  --color-${name}: ${value};\n`;
    }
    css += `}\n\nbody {\n  font-family: 'Inter', system-ui, sans-serif;\n}\n`;
    return this.createFile('src/globals.css', css);
  }

  private generatePage(page: any, spec: ProjectSpec): FileChange {
    const compName = this.toPascalCase(page.name || 'Page');
    const sectionComponents = (page.sections || []).map((section: any) => {
      const sectionCompName = this.toPascalCase(section.component || section.type || 'Section');
      const props = Object.entries(section.props || {}).map(([k, v]) =>
        typeof v === 'string' ? `${k}="${v}"` : `${k}={${JSON.stringify(v)}}`
      ).join(' ');
      return `      <${sectionCompName} ${props} />`;
    }).join('\n');

    const imports = [...new Set((page.sections || []).map((s: any) => s.component || s.type || 'Section'))];
    const importStatements = imports.map((comp: string) => {
      const compNameImport = this.toPascalCase(comp);
      return `import ${compNameImport} from '../components/${compNameImport}';`;
    }).join('\n');

    const content = `'use client';\n\n${importStatements}\n\nexport default function ${compName}() {\n  return (\n    <main>\n${sectionComponents}\n    </main>\n  );\n}\n`;
    return this.createFile(`src/pages/${compName}.tsx`, content);
  }

  private generateComponent(componentId: string, spec: ProjectSpec): FileChange {
    const compName = this.toPascalCase(componentId);
    const content = `export interface ${compName}Props {\n  title?: string;\n  subtitle?: string;\n  className?: string;\n  [key: string]: unknown;\n}\n\nexport default function ${compName}({ title = '${compName}', subtitle, className = '', ...props }: ${compName}Props) {\n  return (\n    <section className={\\`py-16 px-8 \\${className}\\`}>\n      <div className="max-w-6xl mx-auto">\n        <h2 className="text-3xl font-bold text-center mb-4">{title}</h2>\n        {subtitle && <p className="text-gray-600 text-center mb-12">{subtitle}</p>}\n        <div className="text-center text-gray-400">\n          {/* ${compName} content */}\n        </div>\n      </div>\n    </section>\n  );\n}\n`;
    return this.createFile(`src/components/${compName}.tsx`, content);
  }

  private getUsedComponents(spec: ProjectSpec): Set<string> {
    const components = new Set<string>();
    const scan = (section: any) => {
      components.add(section.component || section.type || 'section');
      (section.children || []).forEach(scan);
    };
    spec.structure.pages.forEach((p: any) => (p.sections || []).forEach(scan));
    return components;
  }
}

export default ReactExporter;