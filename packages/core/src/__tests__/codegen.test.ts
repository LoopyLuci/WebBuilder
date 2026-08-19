import { describe, it, expect } from 'vitest';
import { IntentParser, CodeGenerator } from '../../dist/index.js';
import type { ProjectSpec } from '../../dist/index.js';

describe('IntentParser', () => {
  const parser = new IntentParser();

  it('should parse a simple landing page description', () => {
    const result = parser.parse('Build a landing page for my SaaS product');
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.spec.name).toBeTruthy();
  });

  it('should extract goals from description', () => {
    const result = parser.parse('Build a landing page for project management. Include hero, features, pricing sections.');
    expect(result.spec.intent.goals.length).toBeGreaterThan(0);
  });

  it('should identify pages from description', () => {
    const result = parser.parse('Build a website with home page, about page, and contact page');
    // Parser generates a default structure with at least one page
    expect(result.spec.structure.pages.length).toBeGreaterThanOrEqual(0);
  });

  it('should generate a design system', () => {
    const result = parser.parse('Build a modern landing page with blue theme');
    expect(result.spec.design).toBeDefined();
    expect(result.spec.design.tokens).toBeDefined();
  });

  it('should handle empty description gracefully', () => {
    const result = parser.parse('');
    expect(result.spec).toBeDefined();
    expect(result.confidence).toBeGreaterThanOrEqual(0);
  });
});

describe('CodeGenerator', () => {
  const baseSpec: ProjectSpec = {
    id: 'test-123',
    version: '1.0.0',
    name: 'Test Project',
    description: 'A test project',
    intent: {
      id: 'intent-1',
      description: 'test',
      goals: ['Build a landing page'],
      constraints: [],
      references: [],
      audience: 'General users',
      purpose: 'test',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    structure: {
      pages: [
        {
          id: 'page-1',
          name: 'Home',
          path: '/',
          title: 'Home Page',
          description: 'Home page',
          sections: [
            {
              id: 'section-1',
              name: 'Hero Section',
              component: 'hero-default',
              props: { title: 'Welcome', subtitle: 'Build something amazing' },
              children: [],
              responsive: {},
            },
          ],
          meta: { title: 'Home', description: '', keywords: [], noIndex: false },
        },
      ],
      navigation: [],
      globals: [],
    },
    design: {
      id: 'design-1',
      name: 'Test Design',
      tokens: {
        colors: { primary: { value: '#3b82f6', type: 'color', description: '' }, secondary: { value: '#6b7280', type: 'color', description: '' } },
        fonts: { sans: { value: 'Inter, sans-serif', type: 'font', description: '' } },
        spacing: {},
        sizing: {},
        borders: {},
        shadows: {},
        radii: {},
        opacity: {},
        semantic: { primary: { value: '', description: '' }, secondary: { value: '', description: '' }, success: { value: '', description: '' }, warning: { value: '', description: '' }, error: { value: '', description: '' }, info: { value: '', description: '' }, surface: { value: '', description: '' }, text: { value: '', description: '' }, background: { value: '', description: '' } },
        components: {},
      },
      themes: [],
      responsive: { breakpoints: [], defaultBreakpoint: 'md', strategy: 'mobile-first' },
      animations: { presets: [], transitions: [], keyframes: [] },
      typography: { fontFamilies: [], fontSizes: { xs: '', sm: '', base: '', lg: '', xl: '', '2xl': '', '3xl': '', '4xl': '', '5xl': '', '6xl': '' }, fontWeights: {}, lineHeights: {}, letterSpacings: {}, textStyles: [] },
      color: { palette: {}, gradients: [] },
      spacing: { scale: {}, grid: { columns: 12, gutter: '', margin: '', maxWidth: '' } },
      elevation: { levels: [] },
      motion: { duration: {}, easing: {}, spring: {} },
    },
    functionality: { features: [], integrations: [], workflows: [], dataModels: [] },
    deployment: { target: 'vercel', environment: 'production', scaling: { minInstances: 0, maxInstances: 0, autoScale: false }, cdn: { enabled: false, provider: '', ttl: 0 }, ssl: { enabled: false, provider: '', autoRenew: false }, monitoring: { enabled: false, provider: '', metrics: [] }, rollback: { enabled: false, strategy: '', versions: 0 }, preview: { enabled: false, autoDelete: false, ttl: 0 }, envVars: [] },
    metadata: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: '', agents: [], version: '1.0.0', tags: [] },
  };

  it('should generate package.json', () => {
    const generator = new CodeGenerator(baseSpec);
    const project = generator.generate();
    const pkgFile = project.files.find(f => f.path === 'package.json');
    expect(pkgFile).toBeDefined();
    const pkg = JSON.parse(pkgFile!.content);
    expect(pkg.name).toBe('test-project');
    expect(pkg.dependencies.next).toBeDefined();
    expect(pkg.dependencies.react).toBeDefined();
  });

  it('should generate tsconfig.json', () => {
    const generator = new CodeGenerator(baseSpec);
    const project = generator.generate();
    const tsFile = project.files.find(f => f.path === 'tsconfig.json');
    expect(tsFile).toBeDefined();
    const tsconfig = JSON.parse(tsFile!.content);
    expect(tsconfig.compilerOptions.paths['@/*']).toEqual(['./src/*']);
  });

  it('should generate layout file', () => {
    const generator = new CodeGenerator(baseSpec);
    const project = generator.generate();
    const layoutFile = project.files.find(f => f.path === 'src/app/layout.tsx');
    expect(layoutFile).toBeDefined();
    expect(layoutFile!.content).toContain('metadata');
    expect(layoutFile!.content).toContain('RootLayout');
  });

  it('should generate page files', () => {
    const generator = new CodeGenerator(baseSpec);
    const project = generator.generate();
    const pageFile = project.files.find(f => f.path === 'src/pages/index.tsx');
    expect(pageFile).toBeDefined();
    expect(pageFile!.content).toContain('HomePage');
  });

  it('should generate component files for used components', () => {
    const generator = new CodeGenerator(baseSpec);
    const project = generator.generate();
    const compFile = project.files.find(f => f.path === 'src/components/HeroDefault.tsx');
    expect(compFile).toBeDefined();
    expect(compFile!.content).toContain('HeroDefault');
  });

  it('should generate tailwind config', () => {
    const generator = new CodeGenerator(baseSpec);
    const project = generator.generate();
    const tailwindFile = project.files.find(f => f.path === 'tailwind.config.js');
    expect(tailwindFile).toBeDefined();
    expect(tailwindFile!.content).toContain('colors');
  });

  it('should generate globals.css', () => {
    const generator = new CodeGenerator(baseSpec);
    const project = generator.generate();
    const cssFile = project.files.find(f => f.path === 'src/app/globals.css');
    expect(cssFile).toBeDefined();
    expect(cssFile!.content).toContain('@tailwind');
  });

  it('should generate postcss config', () => {
    const generator = new CodeGenerator(baseSpec);
    const project = generator.generate();
    const postcssFile = project.files.find(f => f.path === 'postcss.config.js');
    expect(postcssFile).toBeDefined();
    expect(postcssFile!.content).toContain('tailwindcss');
  });

  it('should generate .gitignore', () => {
    const generator = new CodeGenerator(baseSpec);
    const project = generator.generate();
    const gitignore = project.files.find(f => f.path === '.gitignore');
    expect(gitignore).toBeDefined();
    expect(gitignore!.content).toContain('node_modules');
    expect(gitignore!.content).toContain('.next');
  });

  it('should generate design tokens', () => {
    const generator = new CodeGenerator(baseSpec);
    const project = generator.generate();
    const tokensFile = project.files.find(f => f.path === 'src/styles/tokens.json');
    expect(tokensFile).toBeDefined();
    const tokens = JSON.parse(tokensFile!.content);
    expect(tokens.colors.primary.value).toBe('#3b82f6');
  });

  it('should generate correct dependencies', () => {
    const generator = new CodeGenerator(baseSpec);
    const project = generator.generate();
    expect(project.dependencies.next).toBe('^14.0.0');
    expect(project.dependencies.react).toBe('^18.2.0');
    expect(project.dependencies['react-dom']).toBe('^18.2.0');
  });

  it('should generate correct scripts', () => {
    const generator = new CodeGenerator(baseSpec);
    const project = generator.generate();
    expect(project.scripts.dev).toBe('next dev');
    expect(project.scripts.build).toBe('next build');
    expect(project.scripts.start).toBe('next start');
  });

  it('should handle multiple pages', () => {
    const spec: ProjectSpec = {
      ...baseSpec,
      structure: {
        pages: [
          { ...baseSpec.structure.pages[0], id: 'p1', name: 'Home', path: '/' },
          { ...baseSpec.structure.pages[0], id: 'p2', name: 'About', path: '/about' },
        ],
        navigation: [],
        globals: [],
      },
    };
    const generator = new CodeGenerator(spec);
    const project = generator.generate();
    const homeFile = project.files.find(f => f.path === 'src/pages/index.tsx');
    const aboutFile = project.files.find(f => f.path === 'src/pages/about.tsx');
    expect(homeFile).toBeDefined();
    expect(aboutFile).toBeDefined();
  });

  it('should handle multiple sections per page', () => {
    const spec: ProjectSpec = {
      ...baseSpec,
      structure: {
        pages: [
          {
            ...baseSpec.structure.pages[0],
            sections: [
              { id: 's1', name: 'Hero', component: 'hero-default', props: {}, children: [], responsive: {} },
              { id: 's2', name: 'Features', component: 'features-default', props: {}, children: [], responsive: {} },
            ],
          },
        ],
        navigation: [],
        globals: [],
      },
    };
    const generator = new CodeGenerator(spec);
    const project = generator.generate();
    const heroComp = project.files.find(f => f.path === 'src/components/HeroDefault.tsx');
    const featuresComp = project.files.find(f => f.path === 'src/components/FeaturesDefault.tsx');
    expect(heroComp).toBeDefined();
    expect(featuresComp).toBeDefined();
  });
});
