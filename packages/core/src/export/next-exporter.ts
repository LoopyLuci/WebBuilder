// ============================================================================
// Next.js Exporter — Next.js + Tailwind CSS
// Generates a complete Next.js 14 project with App Router and Tailwind CSS
// ============================================================================

import type { ProjectSpec, FileChange } from '../types/index.js';
import { BaseExporter, type ExportOptions, type ExportResult } from './types.js';

export class NextExporter extends BaseExporter {
  readonly id = 'nextjs' as const;
  readonly name = 'Next.js';
  readonly description = 'Next.js 14 + Tailwind CSS with App Router';
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
    files.push(this.generateNextConfig());
    files.push(this.generateTailwindConfig(spec));
    files.push(this.generatePostcssConfig());
    files.push(this.generateNextEnvDts());
    files.push(this.generateGitignore());

    // Generate app directory
    files.push(this.generateLayout(spec));
    files.push(this.generateGlobalCSS(spec));
    files.push(this.generateErrorPage(spec));
    files.push(this.generateLoadingPage(spec));
    files.push(this.generateNotFoundPage(spec));

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
      files.push(this.createFile('README.md', this.generateReadme(spec, 'Next.js 14 + Tailwind CSS', this.getScripts())));
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
      'next': '^14.2.0',
      'react': '^18.2.0',
      'react-dom': '^18.2.0',
    };
  }

  getDevDependencies(): Record<string, string> {
    return {
      '@types/node': '^20.0.0',
      '@types/react': '^18.2.0',
      '@types/react-dom': '^18.2.0',
      'autoprefixer': '^10.4.0',
      'postcss': '^8.4.0',
      'tailwindcss': '^3.4.0',
      'typescript': '^5.4.0',
    };
  }

  getScripts(): Record<string, string> {
    return {
      'dev': 'next dev',
      'build': 'next build',
      'start': 'next start',
      'lint': 'next lint',
    };
  }

  getInstructions(): string[] {
    return [
      '1. Install dependencies: npm install',
      '2. Start dev server: npm run dev',
      '3. Open http://localhost:3000',
      '4. Build for production: npm run build',
    ];
  }

  private generatePackageJson(spec: ProjectSpec): FileChange {
    const pkg = {
      name: this.toKebabCase(spec.name),
      version: '1.0.0',
      private: true,
      scripts: this.getScripts(),
      dependencies: this.getDependencies(),
      devDependencies: this.getDevDependencies(),
    };
    return this.createFile('package.json', JSON.stringify(pkg, null, 2));
  }

  private generateTsConfig(): FileChange {
    const config = {
      compilerOptions: {
        target: 'ES2017',
        lib: ['dom', 'dom.iterable', 'esnext'],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: 'esnext',
        moduleResolution: 'bundler',
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: 'preserve',
        incremental: true,
        plugins: [{ name: 'next' }],
        paths: { '@/*': ['./src/*'] },
      },
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
      exclude: ['node_modules'],
    };
    return this.createFile('tsconfig.json', JSON.stringify(config, null, 2));
  }

  private generateNextConfig(): FileChange {
    const content = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;
`;
    return this.createFile('next.config.js', content);
  }

  private generateTailwindConfig(spec: ProjectSpec): FileChange {
    const colors = this.extractColors(spec.design?.tokens || {});
    const fonts = this.extractFonts(spec.design?.tokens || {});

    const config = {
      content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
      ],
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

  private generateNextEnvDts(): FileChange {
    return this.createFile('next-env.d.ts', `/// <reference types="next" />\n/// <reference types="next/image-types/global" />\n\n// NOTE: This file should not be edited\n// see https://nextjs.org/docs/basic-features/typescript for more information.\n`);
  }

  private generateLayout(spec: ProjectSpec): FileChange {
    const content = `import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '${spec.name}',
  description: '${spec.description}',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`;
    return this.createFile('src/app/layout.tsx', content);
  }

  private generateGlobalCSS(spec: ProjectSpec): FileChange {
    const colors = this.extractColors(spec.design?.tokens || {});
    let css = `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n:root {\n`;
    for (const [name, value] of Object.entries(colors)) {
      css += `  --color-${name}: ${value};\n`;
    }
    css += `}\n\nbody {\n  font-family: 'Inter', system-ui, sans-serif;\n}\n`;
    return this.createFile('src/app/globals.css', css);
  }

  private generateErrorPage(spec: ProjectSpec): FileChange {
    const content = `'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <button
        className="px-4 py-2 bg-primary text-white rounded-lg"
        onClick={() => reset()}
      >
        Try again
      </button>
    </div>
  );
}
`;
    return this.createFile('src/app/error.tsx', content);
  }

  private generateLoadingPage(spec: ProjectSpec): FileChange {
    const content = `export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}
`;
    return this.createFile('src/app/loading.tsx', content);
  }

  private generateNotFoundPage(spec: ProjectSpec): FileChange {
    const content = `export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4">Not Found</h2>
      <p>Could not find the requested resource.</p>
    </div>
  );
}
`;
    return this.createFile('src/app/not-found.tsx', content);
  }

  private generatePage(page: any, spec: ProjectSpec): FileChange {
    const pageName = this.toPascalCase(page.name || 'Page');
    const routePath = page.path === '/' ? '' : page.path.replace(/^\//, '');
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
      return `import ${compNameImport} from '@/components/${compNameImport}';`;
    }).join('\n');

    const content = `import type { Metadata } from 'next';\n${importStatements}\n\nexport const metadata: Metadata = {\n  title: '${page.title || pageName}',\n  description: '${page.description || spec.description}',\n};\n\nexport default function ${pageName}Page() {\n  return (\n    <main>\n${sectionComponents}\n    </main>\n  );\n}\n`;
    return this.createFile(`src/app${routePath ? '/' + routePath : ''}/page.tsx`, content);
  }

  private generateComponent(componentId: string, spec: ProjectSpec): FileChange {
    const compName = this.toPascalCase(componentId);
    const content = `export interface ${compName}Props {\n  title?: string;\n  subtitle?: string;\n  className?: string;\n  [key: string]: unknown;\n}\n\nexport default function ${compName}({ title = '${compName}', subtitle, className = '', ...props }: ${compName}Props) {\n  return (\n    <section className={\\`py-16 px-8 \\${className}\\`}>\n      <div className=\"max-w-6xl mx-auto\">\n        <h2 className=\"text-3xl font-bold text-center mb-4\">{title}</h2>\n        {subtitle && <p className=\"text-gray-600 text-center mb-12\">{subtitle}</p>}\n        <div className=\"text-center text-gray-400\">\n          {/* ${compName} content */}\n        </div>\n      </div>\n    </section>\n  );\n}\n`;
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

export default NextExporter;