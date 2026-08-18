// ============================================================================
// Intent Parser Module
// Converts natural language descriptions into structured project specifications
// ============================================================================

import { nanoid } from 'nanoid';
import type {
  Intent,
  ParsedIntent,
  ProjectSpec,
  Constraint,
  Reference,
  ClarificationQuestion,
  PageMap,
  DesignSystem,
  FeatureSet,
  DeploymentConfig,
  ProjectMetadata,
  Page,
  Section,
  NavigationItem,
  DesignTokens,
  Theme,
  ResponsiveConfig,
  TypographySystem,
  ColorSystem,
  SpacingSystem,
  ComponentCategory,
  Framework,
  DeploymentTarget,
  DeploymentEnvironment,
} from '../types/index.js';

// ─── Intent Parser ──────────────────────────────────────────────────────────

export class IntentParser {
  private vocabulary: Map<string, string[]>;
  private componentLibrary: Map<string, ComponentCategory>;
  private frameworkKeywords: Map<string, Framework>;

  constructor() {
    this.vocabulary = this.initializeVocabulary();
    this.componentLibrary = this.initializeComponentLibrary();
    this.frameworkKeywords = this.initializeFrameworkKeywords();
  }

  /**
   * Parse a natural language description into a structured project specification
   */
  parse(description: string): ParsedIntent {
    const intent = this.extractIntent(description);
    const spec = this.generateSpec(intent);
    const clarificationsNeeded = this.identifyClarifications(intent, spec);

    return {
      intent,
      spec,
      clarificationsNeeded,
      confidence: this.calculateConfidence(intent, spec, clarificationsNeeded),
    };
  }

  /**
   * Extract intent from natural language description
   */
  private extractIntent(description: string): Intent {
    const now = new Date().toISOString();
    const goals = this.extractGoals(description);
    const constraints = this.extractConstraints(description);
    const references = this.extractReferences(description);
    const audience = this.extractAudience(description);
    const purpose = this.extractPurpose(description);

    return {
      id: nanoid(),
      description,
      goals,
      constraints,
      references,
      audience,
      purpose,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Extract goals from description
   */
  private extractGoals(description: string): string[] {
    const goals: string[] = [];
    const lowerDesc = description.toLowerCase();

    const goalPatterns: Record<string, string[]> = {
      'Build a landing page': ['landing', 'landing page', 'single page', 'promotional page'],
      'Create a web application': ['web app', 'web application', 'application', 'saas', 'platform'],
      'Build an e-commerce site': ['e-commerce', 'ecommerce', 'shop', 'store', 'sell products', 'online store'],
      'Create a portfolio': ['portfolio', 'showcase', 'my work', 'projects showcase'],
      'Build a blog': ['blog', 'articles', 'content', 'writing', 'posts'],
      'Create a dashboard': ['dashboard', 'admin', 'analytics', 'control panel'],
      'Build a documentation site': ['documentation', 'docs', 'knowledge base', 'help center'],
      'Create a social platform': ['social', 'community', 'forum', 'network'],
      'Build a booking system': ['booking', 'reservation', 'scheduling', 'appointments'],
      'Create a learning platform': ['learning', 'course', 'education', 'training'],
    };

    for (const [goal, keywords] of Object.entries(goalPatterns)) {
      if (keywords.some(keyword => lowerDesc.includes(keyword))) {
        goals.push(goal);
      }
    }

    // Add default goal if none found
    if (goals.length === 0) {
      goals.push('Build a web page');
    }

    return goals;
  }

  /**
   * Extract constraints from description
   */
  private extractConstraints(description: string): Constraint[] {
    const constraints: Constraint[] = [];
    const lowerDesc = description.toLowerCase();

    // Tech stack constraints
    const techConstraints: Record<string, string[]> = {
      'React': ['react', 'react.js', 'reactjs'],
      'Vue': ['vue', 'vue.js', 'vuejs'],
      'Svelte': ['svelte', 'sveltekit'],
      'Tailwind CSS': ['tailwind', 'tailwindcss'],
      'TypeScript': ['typescript', 'ts'],
      'Next.js': ['next', 'nextjs', 'next.js'],
    };

    for (const [tech, keywords] of Object.entries(techConstraints)) {
      if (keywords.some(keyword => lowerDesc.includes(keyword))) {
        constraints.push({
          id: nanoid(),
          type: 'tech-stack',
          name: `${tech} Required`,
          description: `Project must use ${tech}`,
          value: tech,
          priority: 'high',
          enabled: true,
        });
      }
    }

    // Accessibility constraints
    if (lowerDesc.includes('accessible') || lowerDesc.includes('a11y') || lowerDesc.includes('wcag')) {
      constraints.push({
        id: nanoid(),
        type: 'accessibility',
        name: 'Accessibility Required',
        description: 'Project must meet WCAG 2.1 AA standards',
        value: 'AA',
        priority: 'high',
        enabled: true,
      });
    }

    // Performance constraints
    if (lowerDesc.includes('fast') || lowerDesc.includes('performance') || lowerDesc.includes('optimized')) {
      constraints.push({
        id: nanoid(),
        type: 'performance',
        name: 'Performance Optimized',
        description: 'Project must achieve 90+ Lighthouse score',
        value: 90,
        priority: 'high',
        enabled: true,
      });
    }

    // SEO constraints
    if (lowerDesc.includes('seo') || lowerDesc.includes('search engine')) {
      constraints.push({
        id: nanoid(),
        type: 'seo',
        name: 'SEO Optimized',
        description: 'Project must be optimized for search engines',
        value: true,
        priority: 'medium',
        enabled: true,
      });
    }

    // Dark mode constraint
    if (lowerDesc.includes('dark mode') || lowerDesc.includes('dark theme') || lowerDesc.includes('light/dark')) {
      constraints.push({
        id: nanoid(),
        type: 'custom',
        name: 'Dark Mode Support',
        description: 'Project must support both light and dark modes',
        value: true,
        priority: 'medium',
        enabled: true,
      });
    }

    return constraints;
  }

  /**
   * Extract references from description
   */
  private extractReferences(description: string): Reference[] {
    const references: Reference[] = [];
    const lowerDesc = description.toLowerCase();

    // Extract URLs
    const urlRegex = /https?:\/\/[^\s]+/g;
    const urls = description.match(urlRegex);
    if (urls) {
      for (const url of urls) {
        references.push({
          id: nanoid(),
          type: 'url',
          url,
          description: `Reference: ${url}`,
          tags: ['url-reference'],
        });
      }
    }

    // Extract named references (like "Stripe" or "Linear")
    const namedReferences: Record<string, string[]> = {
      'Stripe': ['stripe', 'stripe.com'],
      'Linear': ['linear', 'linear.app'],
      'Vercel': ['vercel', 'vercel.com'],
      'Notion': ['notion', 'notion.so'],
      'Figma': ['figma', 'figma.com'],
      'GitHub': ['github', 'github.com'],
    };

    for (const [name, keywords] of Object.entries(namedReferences)) {
      if (keywords.some(keyword => lowerDesc.includes(keyword))) {
        references.push({
          id: nanoid(),
          type: 'design',
          description: `Design reference: ${name}`,
          tags: ['design-reference', name.toLowerCase()],
        });
      }
    }

    return references;
  }

  /**
   * Extract target audience from description
   */
  private extractAudience(description: string): string {
    const lowerDesc = description.toLowerCase();

    const audiencePatterns: Record<string, string[]> = {
      'Developers': ['developers', 'devs', 'coders', 'engineers', 'programmers'],
      'Designers': ['designers', 'creatives', 'artists', 'UX'],
      'Business owners': ['business', 'companies', 'enterprises', 'startups'],
      'Students': ['students', 'learners', 'education', 'academic'],
      'General public': ['everyone', 'general', 'public', 'users'],
    };

    for (const [audience, keywords] of Object.entries(audiencePatterns)) {
      if (keywords.some(keyword => lowerDesc.includes(keyword))) {
        return audience;
      }
    }

    return 'General users';
  }

  /**
   * Extract purpose from description
   */
  private extractPurpose(description: string): string {
    const lowerDesc = description.toLowerCase();

    const purposePatterns: Record<string, string[]> = {
      'Inform and convert visitors': ['marketing', 'promote', 'sell', 'convert', 'landing'],
      'Provide a service or tool': ['tool', 'app', 'service', 'platform', 'saas'],
      'Showcase work or content': ['portfolio', 'showcase', 'blog', 'content'],
      'Sell products online': ['shop', 'store', 'e-commerce', 'sell', 'products'],
      'Educate and inform': ['learn', 'teach', 'course', 'documentation', 'docs'],
      'Entertain and engage': ['game', 'fun', 'entertainment', 'social'],
    };

    for (const [purpose, keywords] of Object.entries(purposePatterns)) {
      if (keywords.some(keyword => lowerDesc.includes(keyword))) {
        return purpose;
      }
    }

    return 'Provide information';
  }

  /**
   * Generate a project specification from intent
   */
  private generateSpec(intent: Intent): Partial<ProjectSpec> {
    return {
      id: nanoid(),
      version: '1.0.0',
      name: this.generateProjectName(intent),
      description: intent.description,
      intent,
      structure: this.generatePageMap(intent),
      design: this.generateDesignSystem(intent),
      functionality: this.generateFeatureSet(intent),
      deployment: this.generateDeploymentConfig(intent),
      metadata: this.generateMetadata(intent),
    };
  }

  /**
   * Generate a project name from intent
   */
  private generateProjectName(intent: Intent): string {
    const purpose = intent.purpose.toLowerCase();
    if (purpose.includes('shop') || purpose.includes('sell')) return 'E-Commerce Store';
    if (purpose.includes('portfolio')) return 'Portfolio Site';
    if (purpose.includes('blog')) return 'Blog Platform';
    if (purpose.includes('dashboard')) return 'Admin Dashboard';
    if (purpose.includes('tool') || purpose.includes('service')) return 'Web Application';
    if (purpose.includes('inform')) return 'Landing Page';
    return 'My Project';
  }

  /**
   * Generate page map from intent
   */
  private generatePageMap(intent: Intent): PageMap {
    const pages: Page[] = [];
    const navigation: NavigationItem[] = [];

    // Generate pages based on goals
    if (intent.goals.some(g => g.includes('landing') || g.includes('Landing Page'))) {
      pages.push({
        id: nanoid(),
        name: 'Home',
        path: '/',
        title: this.generateProjectName(intent),
        description: intent.description,
        sections: this.generateLandingSections(),
        meta: {
          title: this.generateProjectName(intent),
          description: intent.description,
          keywords: [],
          noIndex: false,
        },
      });

      navigation.push({
        id: nanoid(),
        label: 'Home',
        path: '/',
        children: [],
        external: false,
      });
    }

    if (intent.goals.some(g => g.includes('web application') || g.includes('Web Application'))) {
      pages.push({
        id: nanoid(),
        name: 'Dashboard',
        path: '/dashboard',
        title: 'Dashboard',
        description: 'Main application dashboard',
        sections: this.generateDashboardSections(),
        meta: {
          title: 'Dashboard',
          description: 'Application dashboard',
          keywords: [],
          noIndex: true,
        },
      });

      navigation.push({
        id: nanoid(),
        label: 'Dashboard',
        path: '/dashboard',
        children: [],
        external: false,
      });
    }

    // Add common pages
    if (intent.goals.some(g => g.includes('blog') || g.includes('content'))) {
      pages.push({
        id: nanoid(),
        name: 'Blog',
        path: '/blog',
        title: 'Blog',
        description: 'Latest articles and updates',
        sections: this.generateBlogSections(),
        meta: {
          title: 'Blog',
          description: 'Read our latest articles',
          keywords: ['blog', 'articles'],
          noIndex: false,
        },
      });

      navigation.push({
        id: nanoid(),
        label: 'Blog',
        path: '/blog',
        children: [],
        external: false,
      });
    }

    return {
      pages,
      navigation,
      globals: [
        {
          id: nanoid(),
          name: 'Header',
          component: 'navbar-default',
          position: 'header',
          pages: 'all',
        },
        {
          id: nanoid(),
          name: 'Footer',
          component: 'footer-default',
          position: 'footer',
          pages: 'all',
        },
      ],
    };
  }

  /**
   * Generate landing page sections
   */
  private generateLandingSections(): Section[] {
    return [
      {
        id: nanoid(),
        name: 'Hero',
        component: 'hero-default',
        props: {
          title: 'Welcome to Our Platform',
          subtitle: 'The best solution for your needs',
          ctaText: 'Get Started',
          ctaLink: '#',
        },
        children: [],
        responsive: { mobile: 'stack', tablet: 'stack', desktop: 'split' },
      },
      {
        id: nanoid(),
        name: 'Features',
        component: 'features-default',
        props: {
          title: 'Features',
          subtitle: 'Everything you need',
          columns: 3,
        },
        children: [],
        responsive: { mobile: 'single', tablet: 'double', desktop: 'triple' },
      },
      {
        id: nanoid(),
        name: 'Pricing',
        component: 'pricing-default',
        props: {
          title: 'Pricing',
          subtitle: 'Choose your plan',
          tiers: 3,
        },
        children: [],
        responsive: { mobile: 'stack', tablet: 'stack', desktop: 'row' },
      },
      {
        id: nanoid(),
        name: 'CTA',
        component: 'cta-default',
        props: {
          title: 'Ready to get started?',
          buttonText: 'Sign Up Now',
          buttonLink: '#',
        },
        children: [],
        responsive: { mobile: 'stack', tablet: 'stack', desktop: 'center' },
      },
    ];
  }

  /**
   * Generate dashboard sections
   */
  private generateDashboardSections(): Section[] {
    return [
      {
        id: nanoid(),
        name: 'Stats',
        component: 'stats-grid',
        props: {
          title: 'Overview',
          columns: 4,
        },
        children: [],
        responsive: { mobile: 'single', tablet: 'double', desktop: 'quad' },
      },
      {
        id: nanoid(),
        name: 'Chart',
        component: 'chart-default',
        props: {
          title: 'Analytics',
          type: 'line',
        },
        children: [],
        responsive: { mobile: 'full', tablet: 'full', desktop: 'full' },
      },
      {
        id: nanoid(),
        name: 'Recent Activity',
        component: 'activity-feed',
        props: {
          title: 'Recent Activity',
          limit: 10,
        },
        children: [],
        responsive: { mobile: 'full', tablet: 'full', desktop: 'full' },
      },
    ];
  }

  /**
   * Generate blog sections
   */
  private generateBlogSections(): Section[] {
    return [
      {
        id: nanoid(),
        name: 'Blog Header',
        component: 'page-header',
        props: {
          title: 'Our Blog',
          subtitle: 'Latest articles and updates',
        },
        children: [],
        responsive: { mobile: 'stack', tablet: 'stack', desktop: 'center' },
      },
      {
        id: nanoid(),
        name: 'Post List',
        component: 'post-list',
        props: {
          columns: 2,
          limit: 10,
        },
        children: [],
        responsive: { mobile: 'single', tablet: 'double', desktop: 'double' },
      },
    ];
  }

  /**
   * Generate design system from intent
   */
  private generateDesignSystem(intent: Intent): DesignSystem {
    const hasDarkMode = intent.constraints.some(c => c.name.includes('Dark Mode'));
    const hasAccessibility = intent.constraints.some(c => c.type === 'accessibility');

    return {
      id: nanoid(),
      name: 'Default Design System',
      tokens: this.generateDesignTokens(),
      themes: hasDarkMode ? this.generateThemes() : [this.generateDefaultTheme()],
      responsive: this.generateResponsiveConfig(),
      animations: { presets: [], transitions: [], keyframes: [] },
      typography: this.generateTypographySystem(),
      color: this.generateColorSystem(),
      spacing: this.generateSpacingSystem(),
      elevation: { levels: this.generateElevationLevels() },
      motion: {
        duration: { fast: '150ms', normal: '300ms', slow: '500ms' },
        easing: { ease: 'cubic-bezier(0.4, 0, 0.2, 1)', spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
        spring: { default: { stiffness: 300, damping: 30, mass: 1 } },
      },
    };
  }

  /**
   * Generate design tokens
   */
  private generateDesignTokens(): DesignTokens {
    return {
      colors: {
        primary: { value: '#3b82f6', type: 'color', description: 'Primary brand color' },
        secondary: { value: '#8b5cf6', type: 'color', description: 'Secondary brand color' },
        accent: { value: '#f59e0b', type: 'color', description: 'Accent color' },
        success: { value: '#10b981', type: 'color', description: 'Success color' },
        warning: { value: '#f59e0b', type: 'color', description: 'Warning color' },
        error: { value: '#ef4444', type: 'color', description: 'Error color' },
      },
      fonts: {
        sans: { value: 'Inter, system-ui, sans-serif', type: 'font', description: 'Primary font' },
        mono: { value: 'JetBrains Mono, monospace', type: 'font', description: 'Monospace font' },
        display: { value: 'Cal Sans, Inter, sans-serif', type: 'font', description: 'Display font' },
      },
      spacing: {
        xs: { value: '4px', type: 'dimension', description: 'Extra small spacing' },
        sm: { value: '8px', type: 'dimension', description: 'Small spacing' },
        md: { value: '16px', type: 'dimension', description: 'Medium spacing' },
        lg: { value: '24px', type: 'dimension', description: 'Large spacing' },
        xl: { value: '32px', type: 'dimension', description: 'Extra large spacing' },
        '2xl': { value: '48px', type: 'dimension', description: '2XL spacing' },
        '3xl': { value: '64px', type: 'dimension', description: '3XL spacing' },
      },
      sizing: {
        sm: { value: '0.875rem', type: 'dimension', description: 'Small size' },
        base: { value: '1rem', type: 'dimension', description: 'Base size' },
        lg: { value: '1.125rem', type: 'dimension', description: 'Large size' },
        xl: { value: '1.25rem', type: 'dimension', description: 'XL size' },
      },
      borders: {
        thin: { value: '1px solid', type: 'string', description: 'Thin border' },
        medium: { value: '2px solid', type: 'string', description: 'Medium border' },
        thick: { value: '4px solid', type: 'string', description: 'Thick border' },
      },
      shadows: {
        sm: { value: '0 1px 2px rgba(0,0,0,0.05)', type: 'string', description: 'Small shadow' },
        md: { value: '0 4px 6px rgba(0,0,0,0.1)', type: 'string', description: 'Medium shadow' },
        lg: { value: '0 10px 15px rgba(0,0,0,0.1)', type: 'string', description: 'Large shadow' },
        xl: { value: '0 20px 25px rgba(0,0,0,0.15)', type: 'string', description: 'XL shadow' },
      },
      radii: {
        sm: { value: '4px', type: 'dimension', description: 'Small radius' },
        md: { value: '8px', type: 'dimension', description: 'Medium radius' },
        lg: { value: '12px', type: 'dimension', description: 'Large radius' },
        xl: { value: '16px', type: 'dimension', description: 'XL radius' },
        full: { value: '9999px', type: 'dimension', description: 'Full radius' },
      },
      opacity: {
        disabled: { value: '0.5', type: 'number', description: 'Disabled opacity' },
        hover: { value: '0.8', type: 'number', description: 'Hover opacity' },
        overlay: { value: '0.9', type: 'number', description: 'Overlay opacity' },
      },
      semantic: {
        primary: { value: '$colors.primary', description: 'Primary semantic color' },
        secondary: { value: '$colors.secondary', description: 'Secondary semantic color' },
        success: { value: '$colors.success', description: 'Success semantic color' },
        warning: { value: '$colors.warning', description: 'Warning semantic color' },
        error: { value: '$colors.error', description: 'Error semantic color' },
        info: { value: '$colors.primary', description: 'Info semantic color' },
        surface: { value: '#ffffff', description: 'Surface color' },
        text: { value: '#1f2937', description: 'Text color' },
        background: { value: '#f9fafb', description: 'Background color' },
      },
      components: {},
    };
  }

  /**
   * Generate themes
   */
  private generateThemes(): Theme[] {
    return [
      {
        id: nanoid(),
        name: 'Light',
        mode: 'light',
        tokens: {},
        default: true,
      },
      {
        id: nanoid(),
        name: 'Dark',
        mode: 'dark',
        tokens: {
          colors: {
            primary: { value: '#60a5fa', type: 'color', description: 'Primary color (dark)' },
            secondary: { value: '#a78bfa', type: 'color', description: 'Secondary color (dark)' },
          },
          semantic: {
            primary: { value: '#60a5fa', description: 'Primary semantic (dark)' },
            secondary: { value: '#a78bfa', description: 'Secondary semantic (dark)' },
            surface: { value: '#1f2937', description: 'Surface color (dark)' },
            text: { value: '#f9fafb', description: 'Text color (dark)' },
            background: { value: '#111827', description: 'Background color (dark)' },
            success: { value: '#10b981', description: 'Success (dark)' },
            warning: { value: '#f59e0b', description: 'Warning (dark)' },
            error: { value: '#ef4444', description: 'Error (dark)' },
            info: { value: '#60a5fa', description: 'Info (dark)' },
          },
        },
        default: false,
      },
    ];
  }

  /**
   * Generate default theme
   */
  private generateDefaultTheme(): Theme {
    return {
      id: nanoid(),
      name: 'Default',
      mode: 'light',
      tokens: {},
      default: true,
    };
  }

  /**
   * Generate responsive config
   */
  private generateResponsiveConfig(): ResponsiveConfig {
    return {
      breakpoints: [
        { name: 'mobile', maxWidth: 639, baseFontSize: 14 },
        { name: 'tablet', minWidth: 640, maxWidth: 1023, baseFontSize: 15 },
        { name: 'desktop', minWidth: 1024, baseFontSize: 16 },
      ],
      defaultBreakpoint: 'mobile',
      strategy: 'mobile-first',
    };
  }

  /**
   * Generate typography system
   */
  private generateTypographySystem(): TypographySystem {
    return {
      fontFamilies: [
        { name: 'Inter', family: 'Inter, system-ui, sans-serif', fallback: ['system-ui', 'sans-serif'], category: 'sans-serif' },
        { name: 'JetBrains Mono', family: 'JetBrains Mono, monospace', fallback: ['monospace'], category: 'monospace' },
        { name: 'Cal Sans', family: 'Cal Sans, Inter, sans-serif', fallback: ['Inter', 'sans-serif'], category: 'display' },
      ],
      fontSizes: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
      },
      fontWeights: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      lineHeights: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
      },
      letterSpacings: {
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
      },
      textStyles: [
        { id: nanoid(), name: 'heading-1', fontFamily: 'Cal Sans', fontSize: '3rem', fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.025em' },
        { id: nanoid(), name: 'heading-2', fontFamily: 'Cal Sans', fontSize: '2.25rem', fontWeight: 700, lineHeight: 1.3, letterSpacing: '-0.025em' },
        { id: nanoid(), name: 'body', fontFamily: 'Inter', fontSize: '1rem', fontWeight: 400, lineHeight: 1.5, letterSpacing: '0' },
        { id: nanoid(), name: 'caption', fontFamily: 'Inter', fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.5, letterSpacing: '0' },
      ],
    };
  }

  /**
   * Generate color system
   */
  private generateColorSystem(): ColorSystem {
    return {
      palette: {
        blue: {
          50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa',
          500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a', 950: '#172554',
        },
        purple: {
          50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff', 300: '#d8b4fe', 400: '#c084fc',
          500: '#a855f7', 600: '#9333ea', 700: '#7e22ce', 800: '#6b21a8', 900: '#581c87', 950: '#3b0764',
        },
        green: {
          50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac', 400: '#4ade80',
          500: '#22c55e', 600: '#16a34a', 700: '#15803d', 800: '#166534', 900: '#14532d', 950: '#052e16',
        },
      },
      gradients: [],
    };
  }

  /**
   * Generate spacing system
   */
  private generateSpacingSystem(): SpacingSystem {
    return {
      scale: {
        '0': '0',
        '1': '0.25rem',
        '2': '0.5rem',
        '4': '1rem',
        '6': '1.5rem',
        '8': '2rem',
        '12': '3rem',
        '16': '4rem',
        '24': '6rem',
        '32': '8rem',
      },
      grid: {
        columns: 12,
        gutter: '1rem',
        margin: '1.5rem',
        maxWidth: '1280px',
      },
    };
  }

  /**
   * Generate elevation levels
   */
  private generateElevationLevels() {
    return [
      { name: 'none', shadow: 'none', zIndex: 0 },
      { name: 'sm', shadow: '0 1px 2px rgba(0,0,0,0.05)', zIndex: 1 },
      { name: 'md', shadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 2 },
      { name: 'lg', shadow: '0 10px 15px rgba(0,0,0,0.1)', zIndex: 3 },
      { name: 'xl', shadow: '0 20px 25px rgba(0,0,0,0.15)', zIndex: 4 },
      { name: '2xl', shadow: '0 25px 50px rgba(0,0,0,0.25)', zIndex: 5 },
    ];
  }

  /**
   * Generate feature set from intent
   */
  private generateFeatureSet(intent: Intent): FeatureSet {
    const features: FeatureSet['features'] = [];
    const integrations: FeatureSet['integrations'] = [];
    const workflows: FeatureSet['workflows'] = [];
    const dataModels: FeatureSet['dataModels'] = [];

    // Add features based on goals
    if (intent.goals.some(g => g.includes('landing'))) {
      features.push({
        id: nanoid(),
        name: 'Hero Section',
        description: 'Main hero section with CTA',
        type: 'ui',
        props: {},
        enabled: true,
        dependencies: [],
      });
      features.push({
        id: nanoid(),
        name: 'Feature Showcase',
        description: 'Display product features',
        type: 'ui',
        props: {},
        enabled: true,
        dependencies: [],
      });
    }

    if (intent.goals.some(g => g.includes('e-commerce'))) {
      features.push({
        id: nanoid(),
        name: 'Product Catalog',
        description: 'Product listing and filtering',
        type: 'data',
        props: {},
        enabled: true,
        dependencies: [],
      });
      features.push({
        id: nanoid(),
        name: 'Shopping Cart',
        description: 'Cart management',
        type: 'data',
        props: {},
        enabled: true,
        dependencies: [],
      });
      integrations.push({
        id: nanoid(),
        name: 'Stripe',
        type: 'payment',
        provider: 'stripe',
        config: {},
        enabled: true,
      });
    }

    if (intent.goals.some(g => g.includes('blog'))) {
      dataModels.push({
        id: nanoid(),
        name: 'Post',
        fields: [
          { name: 'title', type: 'string', required: true, unique: false },
          { name: 'slug', type: 'string', required: true, unique: true },
          { name: 'content', type: 'string', required: true, unique: false },
          { name: 'excerpt', type: 'string', required: false, unique: false },
          { name: 'published', type: 'boolean', required: true, unique: false, defaultValue: false },
          { name: 'publishedAt', type: 'date', required: false, unique: false },
        ],
        relationships: [],
      });
    }

    return { features, integrations, workflows, dataModels };
  }

  /**
   * Generate deployment config from intent
   */
  private generateDeploymentConfig(intent: Intent): DeploymentConfig {
    const techStack = intent.constraints.find(c => c.type === 'tech-stack');
    const isSSG = techStack?.value === 'Next.js' || techStack?.value === 'SvelteKit';

    return {
      target: isSSG ? 'vercel' : 'netlify',
      environment: 'development',
      scaling: {
        minInstances: 1,
        maxInstances: 10,
        autoScale: true,
        targetCPU: 70,
        targetMemory: 80,
      },
      cdn: {
        enabled: true,
        caching: {
          staticAssets: '1y',
          html: '0s',
          api: '0s',
        },
      },
      ssl: {
        enabled: true,
        provider: 'lets-encrypt',
      },
      monitoring: {
        enabled: true,
        uptimeChecks: true,
        alerting: [],
      },
      rollback: {
        enabled: true,
        automaticOnFailure: true,
        maxVersions: 10,
      },
      preview: {
        enabled: true,
        autoDeleteDays: 7,
        requireAuth: false,
      },
      envVars: [],
      buildCommand: 'npm run build',
      outputDir: isSSG ? '.next' : 'dist',
    };
  }

  /**
   * Generate project metadata
   */
  private generateMetadata(intent: Intent): ProjectMetadata {
    const now = new Date().toISOString();
    return {
      createdAt: now,
      updatedAt: now,
      createdBy: intent.id,
      agents: [],
      version: '1.0.0',
      tags: intent.goals.map(g => g.toLowerCase().replace(/\s+/g, '-')),
    };
  }

  /**
   * Identify clarifications needed before full spec generation
   */
  private identifyClarifications(intent: Intent, spec: Partial<ProjectSpec>): ClarificationQuestion[] {
    const questions: ClarificationQuestion[] = [];

    // Ask about pages
    if (spec.structure && spec.structure.pages.length === 0) {
      questions.push({
        id: nanoid(),
        question: 'What pages do you need? (e.g., Home, About, Contact, Blog)',
        category: 'structure',
        required: true,
      });
    }

    // Ask about features
    if (intent.goals.some(g => g.includes('web application')) && spec.functionality?.features.length === 0) {
      questions.push({
        id: nanoid(),
        question: 'What core features does your app need? (e.g., User auth, Dashboard, Notifications)',
        category: 'functionality',
        required: false,
      });
    }

    // Ask about deployment
    questions.push({
      id: nanoid(),
      question: 'Where would you like to deploy?',
      options: ['Vercel', 'Netlify', 'AWS', 'Cloudflare', 'Self-hosted'],
      category: 'deployment',
      required: false,
    });

    return questions;
  }

  /**
   * Calculate confidence score for the parsed intent
   */
  private calculateConfidence(intent: Intent, spec: Partial<ProjectSpec>, clarifications: ClarificationQuestion[]): number {
    let score = 0.5; // Base score

    // Boost for each extracted element
    if (intent.goals.length > 0) score += 0.1;
    if (intent.constraints.length > 0) score += 0.1;
    if (intent.references.length > 0) score += 0.1;
    if (intent.audience !== 'General users') score += 0.05;
    if (spec.structure && spec.structure.pages.length > 0) score += 0.1;

    // Reduce for clarifications needed
    score -= clarifications.length * 0.05;

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Initialize vocabulary for intent recognition
   */
  private initializeVocabulary(): Map<string, string[]> {
    return new Map([
      ['build', ['build', 'create', 'make', 'develop', 'design', 'construct']],
      ['page', ['page', 'site', 'website', 'web', 'app', 'application']],
      ['style', ['modern', 'minimal', 'clean', 'elegant', 'professional', 'creative']],
      ['color', ['blue', 'red', 'green', 'purple', 'dark', 'light', 'colorful']],
      ['feature', ['responsive', 'fast', 'accessible', 'animated', 'interactive']],
    ]);
  }

  /**
   * Initialize component library mapping
   */
  private initializeComponentLibrary(): Map<string, ComponentCategory> {
    return new Map([
      ['hero', 'layout'],
      ['navbar', 'navigation'],
      ['footer', 'layout'],
      ['form', 'form'],
      ['card', 'display'],
      ['button', 'interactive'],
      ['modal', 'feedback'],
      ['table', 'data'],
      ['chart', 'data'],
      ['pricing', 'composite'],
      ['testimonials', 'composite'],
      ['features', 'composite'],
    ]);
  }

  /**
   * Initialize framework keywords
   */
  private initializeFrameworkKeywords(): Map<string, Framework> {
    return new Map([
      ['react', 'react'],
      ['vue', 'vue'],
      ['svelte', 'svelte'],
      ['angular', 'angular'],
      ['next', 'react'],
      ['nuxt', 'vue'],
      ['sveltekit', 'svelte'],
    ]);
  }
}

// ─── Utility Functions ──────────────────────────────────────────────────────

/**
 * Quick parse function
 */
export function parseIntent(description: string): ParsedIntent {
  const parser = new IntentParser();
  return parser.parse(description);
}

/**
 * Validate a project spec
 */
export function validateSpec(spec: Partial<ProjectSpec>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!spec.name) errors.push('Project name is required');
  if (!spec.description) errors.push('Project description is required');
  if (!spec.intent) errors.push('Project intent is required');
  if (!spec.structure || spec.structure.pages.length === 0) errors.push('At least one page is required');
  if (!spec.design) errors.push('Design system is required');
  if (!spec.functionality) errors.push('Feature set is required');
  if (!spec.deployment) errors.push('Deployment config is required');

  return {
    valid: errors.length === 0,
    errors,
  };
}

export default IntentParser;
