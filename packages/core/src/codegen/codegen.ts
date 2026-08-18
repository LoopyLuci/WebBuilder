// ============================================================================
// Code Generator — Main module
// Converts project specifications into actual working code files
// ============================================================================

import type {
  ProjectSpec,
  Page,
  Section,
  FileChange,
} from '../types/index.js';

export interface GeneratedProject {
  files: FileChange[];
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
  instructions: string[];
}

export class CodeGenerator {
  private spec: ProjectSpec;

  constructor(spec: ProjectSpec) {
    this.spec = spec;
  }

  /**
   * Generate the complete project
   */
  generate(): GeneratedProject {
    const files: FileChange[] = [];

    // Config files
    files.push(this.generatePackageJson());
    files.push(this.generateTsConfig());
    files.push(this.generateNextConfig());
    files.push(this.generateTailwindConfig());
    files.push(this.generatePostcssConfig());
    files.push(this.generateGitignore());

    // App files
    files.push(this.generateLayout());
    files.push(this.generateGlobalStyles());

    // Pages
    for (const page of this.spec.structure.pages) {
      files.push(this.generatePage(page));
    }

    // Components (extract unique components from all pages)
    const usedComponents = this.getUsedComponents();
    for (const compId of usedComponents) {
      files.push(this.generateComponentFile(compId));
    }

    // Design tokens
    files.push(this.generateDesignTokens());

    return {
      files,
      dependencies: this.getDependencies(),
      devDependencies: this.getDevDependencies(),
      scripts: this.getScripts(),
      instructions: this.getInstructions(),
    };
  }

  private generatePackageJson(): FileChange {
    const deps = this.getDependencies();
    const devDeps = this.getDevDependencies();
    const scripts = this.getScripts();

    const pkg = {
      name: this.spec.name.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      private: true,
      scripts,
      dependencies: deps,
      devDependencies: devDeps,
    };

    return { path: 'package.json', content: JSON.stringify(pkg, null, 2), action: 'create' };
  }

  private generateTsConfig(): FileChange {
    return {
      path: 'tsconfig.json',
      content: JSON.stringify({
        compilerOptions: {
          target: 'es5', lib: ['dom', 'dom.iterable', 'esnext'], allowJs: true,
          skipLibCheck: true, strict: true, noEmit: true, esModuleInterop: true,
          module: 'esnext', moduleResolution: 'node', resolveJsonModule: true,
          isolatedModules: true, jsx: 'preserve', incremental: true,
          plugins: [{ name: 'next' }], paths: { '@/*': ['./src/*'] },
        },
        include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
        exclude: ['node_modules'],
      }, null, 2),
      action: 'create',
    };
  }

  private generateNextConfig(): FileChange {
    return { path: 'next.config.js', content: `/** @type {import('next').NextConfig} */\nconst nextConfig = { reactStrictMode: true };\nmodule.exports = nextConfig;\n`, action: 'create' };
  }

  private generateTailwindConfig(): FileChange {
    const tokens = this.spec.design.tokens;
    const config = {
      content: ['./src/pages/**/*.{js,ts,jsx,tsx,mdx}', './src/components/**/*.{js,ts,jsx,tsx,mdx}'],
      theme: {
        extend: {
          colors: this.extractColors(tokens),
          fontFamily: this.extractFonts(tokens),
          spacing: this.extractSpacing(tokens),
          borderRadius: this.extractRadii(tokens),
          boxShadow: this.extractShadows(tokens),
        },
      },
      plugins: [],
    };
    return { path: 'tailwind.config.js', content: `/** @type {import('tailwindcss').Config} */\nmodule.exports = ${JSON.stringify(config, null, 2)};`, action: 'create' };
  }

  private generatePostcssConfig(): FileChange {
    return { path: 'postcss.config.js', content: `module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };`, action: 'create' };
  }

  private generateGitignore(): FileChange {
    return { path: '.gitignore', content: `node_modules\n.next\nout\nbuild\ndist\n.env*.local\n.DS_Store\n*.log`, action: 'create' };
  }

  private generateLayout(): FileChange {
    const hasHeader = this.spec.structure.globals.some((g: any) => g.position === 'header');
    const hasFooter = this.spec.structure.globals.some((g: any) => g.position === 'footer');
    let content = `'use client';\nimport './globals.css';\n`;
    if (hasHeader) content += `import { Header } from '@/components/Header';\n`;
    if (hasFooter) content += `import { Footer } from '@/components/Footer';\n`;
    content += `\nexport const metadata = { title: '${this.spec.name}', description: '${this.spec.description}' };\n\nexport default function RootLayout({ children }: { children: React.ReactNode }) {\n  return (\n    <html lang="en">\n      <body>\n        ${hasHeader ? '<Header />\n        ' : ''}<main>{children}</main>${hasFooter ? '\n        <Footer />' : ''}\n      </body>\n    </html>\n  );\n}\n`;
    return { path: 'src/app/layout.tsx', content, action: 'create' };
  }

  private generateGlobalStyles(): FileChange {
    const tokens = this.spec.design.tokens;
    let css = `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n:root {\n`;
    for (const [name, token] of Object.entries(tokens.colors || {})) css += `  --color-${name}: ${(token as any).value};\n`;
    for (const [name, token] of Object.entries(tokens.spacing || {})) css += `  --spacing-${name}: ${(token as any).value};\n`;
    css += `}\n\nbody { font-family: ${tokens.fonts?.sans?.value ?? 'Inter, sans-serif'}; color: var(--color-gray-900); background-color: var(--color-white); }\n`;
    return { path: 'src/app/globals.css', content: css, action: 'create' };
  }

  private generatePage(page: Page): FileChange {
    const compImports = new Set<string>();
    const compUsage: string[] = [];
    for (const section of page.sections) {
      const compName = this.toPascalCase(section.component);
      compImports.add(`import { ${compName} } from '@/components/${compName}';`);
      compUsage.push(this.generateSectionJSX(section));
    }
    const content = `'use client';\n\n${Array.from(compImports).join('\n')}\n\nexport default function ${this.toPascalCase(page.name)}Page() {\n  return (\n    <div>\n${compUsage.join('\n')}\n    </div>\n  );\n}\n`;
    const slug = page.path === '/' ? 'index' : page.path.replace(/^\//, '').replace(/\//g, '-');
    return { path: `src/pages/${slug}.tsx`, content, action: 'create' };
  }

  private generateSectionJSX(section: Section): string {
    const compName = this.toPascalCase(section.component);
    const props = Object.entries(section.props).map(([k, v]) => typeof v === 'string' ? `${k}="${v}"` : `${k}={${JSON.stringify(v)}}`).join(' ');
    return `      <${compName} ${props} />`;
  }

  private generateComponentFile(componentId: string): FileChange {
    const compName = this.toPascalCase(componentId);
    const content = `'use client';\n\nexport interface ${compName}Props {\n  // Add props here\n}\n\nexport function ${compName}(props: ${compName}Props) {\n  return (\n    <div>\n      {/* ${compName} component */}\n    </div>\n  );\n}\n`;
    return { path: `src/components/${compName}.tsx`, content, action: 'create' };
  }

  private generateDesignTokens(): FileChange {
    return { path: 'src/styles/tokens.json', content: JSON.stringify(this.spec.design.tokens, null, 2), action: 'create' };
  }

  private getUsedComponents(): Set<string> {
    const components = new Set<string>();
    const scan = (section: Section) => { components.add(section.component); section.children.forEach(scan); };
    this.spec.structure.pages.forEach((p: Page) => p.sections.forEach(scan));
    return components;
  }

  private extractColors(tokens: any): Record<string, any> {
    const colors: Record<string, any> = {};
    if (tokens.colors) for (const [n, t] of Object.entries(tokens.colors)) colors[n] = (t as any).value;
    if (tokens.semantic) for (const [n, t] of Object.entries(tokens.semantic)) if (!(n in colors)) colors[n] = (t as any).value;
    return colors;
  }

  private extractFonts(tokens: any): Record<string, any> {
    const fonts: Record<string, any> = {};
    if (tokens.fonts) for (const [n, t] of Object.entries(tokens.fonts)) fonts[n] = (t as any).value.split(',').map((s: string) => s.trim());
    return fonts;
  }

  private extractSpacing(tokens: any): Record<string, any> {
    const s: Record<string, any> = {};
    if (tokens.spacing) for (const [n, t] of Object.entries(tokens.spacing)) s[n] = (t as any).value;
    return s;
  }

  private extractRadii(tokens: any): Record<string, any> {
    const r: Record<string, any> = {};
    if (tokens.radii) for (const [n, t] of Object.entries(tokens.radii)) r[n] = (t as any).value;
    return r;
  }

  private extractShadows(tokens: any): Record<string, any> {
    const s: Record<string, any> = {};
    if (tokens.shadows) for (const [n, t] of Object.entries(tokens.shadows)) s[n] = (t as any).value;
    return s;
  }

  private getDependencies(): Record<string, string> {
    return { 'next': '^14.0.0', 'react': '^18.2.0', 'react-dom': '^18.2.0' };
  }

  private getDevDependencies(): Record<string, string> {
    return { 'typescript': '^5.4.0', '@types/node': '^20.0.0', '@types/react': '^18.2.0', '@types/react-dom': '^18.2.0', 'tailwindcss': '^3.4.0', 'postcss': '^8.4.0', 'autoprefixer': '^10.4.0' };
  }

  private getScripts(): Record<string, string> {
    return { 'dev': 'next dev', 'build': 'next build', 'start': 'next start', 'lint': 'next lint' };
  }

  private getInstructions(): string[] {
    return ['1. Install dependencies: npm install', '2. Start dev server: npm run dev', '3. Open http://localhost:3000'];
  }

  private toPascalCase(str: string): string {
    return str.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
  }
}

export function generateCode(spec: ProjectSpec): GeneratedProject {
  return new CodeGenerator(spec).generate();
}

// Re-export component and content generators
export { ComponentCodeGenerator, generateComponents } from './components.js';
export { ContentGenerator, generateContent } from './content.js';
export type { GeneratedComponent } from './components.js';
export type { GeneratedContent } from './content.js';

export default CodeGenerator;
