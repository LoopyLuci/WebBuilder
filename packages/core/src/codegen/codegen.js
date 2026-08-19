// ============================================================================
// Code Generator — Main module
// Converts project specifications into actual working code files
// ============================================================================
export class CodeGenerator {
    spec;
    constructor(spec) {
        this.spec = spec;
    }
    /**
     * Generate the complete project
     */
    generate() {
        const files = [];
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
    generatePackageJson() {
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
    generateTsConfig() {
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
    generateNextConfig() {
        return { path: 'next.config.js', content: `/** @type {import('next').NextConfig} */\nconst nextConfig = { reactStrictMode: true };\nmodule.exports = nextConfig;\n`, action: 'create' };
    }
    generateTailwindConfig() {
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
    generatePostcssConfig() {
        return { path: 'postcss.config.js', content: `module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };`, action: 'create' };
    }
    generateGitignore() {
        return { path: '.gitignore', content: `node_modules\n.next\nout\nbuild\ndist\n.env*.local\n.DS_Store\n*.log`, action: 'create' };
    }
    generateLayout() {
        let content = `'use client';\nimport './globals.css';\n\nexport const metadata = { title: '${this.spec.name}', description: '${this.spec.description}' };\n\nexport default function RootLayout({ children }: { children: React.ReactNode }) {\n  return (\n    <html lang="en">\n      <body>\n        <main>{children}</main>\n      </body>\n    </html>\n  );\n}\n`;
        return { path: 'src/app/layout.tsx', content, action: 'create' };
    }
    generateGlobalStyles() {
        const tokens = this.spec.design.tokens;
        let css = `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n:root {\n`;
        for (const [name, token] of Object.entries(tokens.colors || {}))
            css += `  --color-${name}: ${token.value};\n`;
        for (const [name, token] of Object.entries(tokens.spacing || {}))
            css += `  --spacing-${name}: ${token.value};\n`;
        css += `}\n\nbody { font-family: ${tokens.fonts?.sans?.value ?? 'Inter, sans-serif'}; color: var(--color-gray-900); background-color: var(--color-white); }\n`;
        return { path: 'src/app/globals.css', content: css, action: 'create' };
    }
    generatePage(page) {
        const compImports = new Set();
        const compUsage = [];
        for (const section of page.sections) {
            const compName = this.toPascalCase(section.component);
            compImports.add(`import { ${compName} } from '@/components/${compName}';`);
            compUsage.push(this.generateSectionJSX(section));
        }
        const content = `'use client';

${Array.from(compImports).join('\n')}

export default function ${this.toPascalCase(page.name)}Page() {
  return (
    <div>
${compUsage.join('\n')}
    </div>
  );
}
`;
        const slug = page.path === '/' ? 'index' : page.path.replace(/^\//, '').replace(/\//g, '-');
        return { path: `src/pages/${slug}.tsx`, content, action: 'create' };
    }
    generateSectionJSX(section) {
        const compName = this.toPascalCase(section.component);
        const props = Object.entries(section.props).map(([k, v]) => typeof v === 'string' ? `${k}="${v}"` : `${k}={${JSON.stringify(v)}}`).join(' ');
        return `      <${compName} ${props} />`;
    }
    generateComponentFile(componentId) {
        const compName = this.toPascalCase(componentId);
        const content = `'use client';

export interface ${compName}Props {
  title?: string;
  subtitle?: string;
  className?: string;
  [key: string]: any;
}

export function ${compName}({ title = '${compName}', subtitle, className = '', ...props }: ${compName}Props) {
  return (
    <section className={\`py-16 px-8 \${className}\`}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">{title}</h2>
        {subtitle && <p className="text-gray-600 text-center mb-12">{subtitle}</p>}
        <div className="text-center text-gray-400">
          {/* ${compName} content */}
        </div>
      </div>
    </section>
  );
}
`;
        return { path: `src/components/${compName}.tsx`, content, action: 'create' };
    }
    generateDesignTokens() {
        return { path: 'src/styles/tokens.json', content: JSON.stringify(this.spec.design.tokens, null, 2), action: 'create' };
    }
    getUsedComponents() {
        const components = new Set();
        const scan = (section) => { components.add(section.component); section.children.forEach(scan); };
        this.spec.structure.pages.forEach((p) => p.sections.forEach(scan));
        return components;
    }
    extractColors(tokens) {
        const colors = {};
        if (tokens.colors)
            for (const [n, t] of Object.entries(tokens.colors))
                colors[n] = t.value;
        if (tokens.semantic)
            for (const [n, t] of Object.entries(tokens.semantic))
                if (!(n in colors))
                    colors[n] = t.value;
        return colors;
    }
    extractFonts(tokens) {
        const fonts = {};
        if (tokens.fonts)
            for (const [n, t] of Object.entries(tokens.fonts))
                fonts[n] = t.value.split(',').map((s) => s.trim());
        return fonts;
    }
    extractSpacing(tokens) {
        const s = {};
        if (tokens.spacing)
            for (const [n, t] of Object.entries(tokens.spacing))
                s[n] = t.value;
        return s;
    }
    extractRadii(tokens) {
        const r = {};
        if (tokens.radii)
            for (const [n, t] of Object.entries(tokens.radii))
                r[n] = t.value;
        return r;
    }
    extractShadows(tokens) {
        const s = {};
        if (tokens.shadows)
            for (const [n, t] of Object.entries(tokens.shadows))
                s[n] = t.value;
        return s;
    }
    getDependencies() {
        return { 'next': '^14.0.0', 'react': '^18.2.0', 'react-dom': '^18.2.0' };
    }
    getDevDependencies() {
        return { 'typescript': '^5.4.0', '@types/node': '^20.0.0', '@types/react': '^18.2.0', '@types/react-dom': '^18.2.0', 'tailwindcss': '^3.4.0', 'postcss': '^8.4.0', 'autoprefixer': '^10.4.0' };
    }
    getScripts() {
        return { 'dev': 'next dev', 'build': 'next build', 'start': 'next start', 'lint': 'next lint' };
    }
    getInstructions() {
        return ['1. Install dependencies: npm install', '2. Start dev server: npm run dev', '3. Open http://localhost:3000'];
    }
    toPascalCase(str) {
        return str.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
    }
}
export function generateCode(spec) {
    return new CodeGenerator(spec).generate();
}
// Re-export component and content generators
export { ComponentCodeGenerator, generateComponents } from './components.js';
export { ContentGenerator, generateContent } from './content.js';
export default CodeGenerator;
//# sourceMappingURL=codegen.js.map