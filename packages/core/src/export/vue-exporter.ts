// ============================================================================
// Vue Exporter — Vue 3 + Tailwind CSS
// Generates a complete Vue 3 project with Tailwind CSS styling
// ============================================================================

import type { ProjectSpec, FileChange } from '../types/index.js';
import { BaseExporter, type ExportOptions, type ExportResult } from './types.js';

export class VueExporter extends BaseExporter {
  readonly id = 'vue' as const;
  readonly name = 'Vue';
  readonly description = 'Vue 3 + Tailwind CSS application';
  readonly fileExtension = '.vue';
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
    files.push(this.generateRouter(spec));
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
      files.push(this.createFile('README.md', this.generateReadme(spec, 'Vue 3 + Tailwind CSS', this.getScripts())));
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
      'vue': '^3.4.0',
      'vue-router': '^4.3.0',
      'pinia': '^2.1.0',
    };
  }

  getDevDependencies(): Record<string, string> {
    return {
      '@vitejs/plugin-vue': '^5.0.0',
      '@vue/tsconfig': '^0.5.0',
      'autoprefixer': '^10.4.0',
      'postcss': '^8.4.0',
      'tailwindcss': '^3.4.0',
      'typescript': '^5.4.0',
      'vite': '^5.1.0',
      'vue-tsc': '^2.0.0',
    };
  }

  getScripts(): Record<string, string> {
    return {
      'dev': 'vite',
      'build': 'vue-tsc && vite build',
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
        module: 'ESNext',
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        skipLibCheck: true,
        moduleResolution: 'bundler',
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: 'preserve',
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true,
        paths: {
          '@/*': ['./src/*'],
        },
      },
      include: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.vue'],
      references: [{ path: './tsconfig.node.json' }],
    };
    return this.createFile('tsconfig.json', JSON.stringify(config, null, 2));
  }

  private generateTailwindConfig(spec: ProjectSpec): FileChange {
    const colors = this.extractColors(spec.design?.tokens || {});
    const fonts = this.extractFonts(spec.design?.tokens || {});

    const config = {
      content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
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
    const content = `import { defineConfig } from 'vite';\nimport vue from '@vitejs/plugin-vue';\nimport path from 'path';\n\nexport default defineConfig({\n  plugins: [vue()],\n  resolve: {\n    alias: {\n      '@': path.resolve(__dirname, './src'),\n    },\n  },\n});\n`;
    return this.createFile('vite.config.ts', content);
  }

  private generateIndexHTML(spec: ProjectSpec): FileChange {
    const content = `<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>${spec.name}</title>\n  </head>\n  <body>\n    <div id="app"></div>\n    <script type="module" src="/src/main.ts"></script>\n  </body>\n</html>\n`;
    return this.createFile('index.html', content);
  }

  private generateMain(spec: ProjectSpec): FileChange {
    const content = `import { createApp } from 'vue';\nimport { createPinia } from 'pinia';\nimport App from './App.vue';\nimport router from './router';\nimport './globals.css';\n\nconst app = createApp(App);\napp.use(createPinia());\napp.use(router);\napp.mount('#app');\n`;
    return this.createFile('src/main.ts', content);
  }

  private generateApp(spec: ProjectSpec): FileChange {
    const content = `<script setup lang="ts">\nimport { RouterView } from 'vue-router';\n</script>\n\n<template>\n  <div id="app">\n    <RouterView />\n  </div>\n</template>\n\n<style scoped>\n#app {\n  min-height: 100vh;\n}\n</style>\n`;
    return this.createFile('src/App.vue', content);
  }

  private generateRouter(spec: ProjectSpec): FileChange {
    const routes = spec.structure.pages.map((page: any) => {
      const compName = this.toPascalCase(page.name || 'Page');
      const path = page.path || '/';
      return `  { path: '${path}', component: () => import('./pages/${compName}.vue') },`;
    }).join('\n');

    const content = `import { createRouter, createWebHistory } from 'vue-router';\n\nconst router = createRouter({\n  history: createWebHistory(),\n  routes: [\n${routes}\n  ],\n});\n\nexport default router;\n`;
    return this.createFile('src/router/index.ts', content);
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
        typeof v === 'string' ? `:${k}="${v}"` : `:${k}="${JSON.stringify(v).replace(/"/g, "'")}"`
      ).join(' ');
      return `    <${sectionCompName} ${props} />`;
    }).join('\n');

    const imports = [...new Set((page.sections || []).map((s: any) => s.component || s.type || 'Section'))];
    const importStatements = imports.map((comp: string) => {
      const compNameImport = this.toPascalCase(comp);
      return `import ${compNameImport} from '../components/${compNameImport}.vue';`;
    }).join('\n');

    const content = `<script setup lang="ts">\n${importStatements}\n</script>\n\n<template>\n  <main>\n${sectionComponents}\n  </main>\n</template>\n\n<style scoped>\nmain {\n  min-height: 100vh;\n}\n</style>\n`;
    return this.createFile(`src/pages/${compName}.vue`, content);
  }

  private generateComponent(componentId: string, spec: ProjectSpec): FileChange {
    const compName = this.toPascalCase(componentId);
    const content = `<script setup lang="ts">\ndefineProps<{\n  title?: string;\n  subtitle?: string;\n  className?: string;\n}>();\n</script>\n\n<template>\n  <section :class="['py-16 px-8', className]">\n    <div class="max-w-6xl mx-auto">\n      <h2 class="text-3xl font-bold text-center mb-4">{{ title || '${compName}' }}</h2>\n      <p v-if="subtitle" class="text-gray-600 text-center mb-12">{{ subtitle }}</p>\n      <div class="text-center text-gray-400">\n        <!-- ${compName} content -->\n      </div>\n    </div>\n  </section>\n</template>\n\n<style scoped>\n/* Component styles */\n</style>\n`;
    return this.createFile(`src/components/${compName}.vue`, content);
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

export default VueExporter;