// ============================================================================
// Component Engine Module
// Universal component system that works across all frameworks
// ============================================================================

import { nanoid } from 'nanoid';
import type {
  Component,
  ComponentSpec,
  Framework,
  FrameworkImplementation,
  PropSchema,
  SlotSchema,
  EventSchema,
  StyleSchema,
  A11ySchema,
  PerformanceMetrics,
  Dependency,
  ExtensionPoint,
  ID,
  ComponentCategory,
  JSONValue,
} from '../types/index.js';

// ─── Component Engine ────────────────────────────────────────────────────────

export class ComponentEngine {
  private components: Map<ID, Component>;
  private categories: Map<ComponentCategory, Component[]>;
  private frameworkAdapters: Map<Framework, FrameworkAdapter>;

  constructor() {
    this.components = new Map();
    this.categories = new Map();
    this.frameworkAdapters = new Map();
    this.registerBuiltInComponents();
    this.registerFrameworkAdapters();
  }

  // ─── Component Registration ───────────────────────────────────────────

  /**
   * Register a new component
   */
  register(component: Component): void {
    this.components.set(component.id, component);

    // Add to category index
    const category = component.spec.category;
    if (!this.categories.has(category)) {
      this.categories.set(category, []);
    }
    this.categories.get(category)!.push(component);
  }

  /**
   * Unregister a component
   */
  unregister(componentId: ID): boolean {
    const component = this.components.get(componentId);
    if (!component) return false;

    this.components.delete(componentId);

    // Remove from category index
    const category = component.spec.category;
    const categoryComponents = this.categories.get(category);
    if (categoryComponents) {
      const index = categoryComponents.findIndex(c => c.id === componentId);
      if (index !== -1) {
        categoryComponents.splice(index, 1);
      }
    }

    return true;
  }

  /**
   * Get a component by ID
   */
  get(componentId: ID): Component | undefined {
    return this.components.get(componentId);
  }

  /**
   * Get a component by name
   */
  getByName(name: string): Component | undefined {
    for (const component of this.components.values()) {
      if (component.name === name) return component;
    }
    return undefined;
  }

  /**
   * List all components
   */
  list(): Component[] {
    return Array.from(this.components.values());
  }

  /**
   * Get components by category
   */
  getByCategory(category: ComponentCategory): Component[] {
    return this.categories.get(category) ?? [];
  }

  /**
   * Search components
   */
  search(query: string): Component[] {
    const lowerQuery = query.toLowerCase();
    return this.list().filter(c =>
      c.name.toLowerCase().includes(lowerQuery) ||
      c.description.toLowerCase().includes(lowerQuery) ||
      c.spec.tags.some(t => t.toLowerCase().includes(lowerQuery))
    );
  }

  // ─── Framework Support ────────────────────────────────────────────────

  /**
   * Get component implementation for a specific framework
   */
  getImplementation(componentId: ID, framework: Framework): FrameworkImplementation | undefined {
    const component = this.components.get(componentId);
    if (!component) return undefined;
    return component.implementations[framework];
  }

  /**
   * Add a framework implementation to an existing component
   */
  addImplementation(componentId: ID, framework: Framework, implementation: FrameworkImplementation): boolean {
    const component = this.components.get(componentId);
    if (!component) return false;
    component.implementations[framework] = implementation;
    return true;
  }

  /**
   * Generate implementation for a framework using AI
   */
  async generateImplementation(componentId: ID, framework: Framework): Promise<FrameworkImplementation | null> {
    const component = this.components.get(componentId);
    if (!component) return null;

    const adapter = this.frameworkAdapters.get(framework);
    if (!adapter) return null;

    return adapter.generate(component);
  }

  /**
   * Get supported frameworks for a component
   */
  getSupportedFrameworks(componentId: ID): Framework[] {
    const component = this.components.get(componentId);
    if (!component) return [];
    return Object.keys(component.implementations) as Framework[];
  }

  // ─── Component Composition ────────────────────────────────────────────

  /**
   * Create a composite component from multiple components
   */
  compose(name: string, componentIds: ID[], layout: 'vertical' | 'horizontal' | 'grid' = 'vertical'): Component {
    const childComponents = componentIds
      .map(id => this.components.get(id))
      .filter((c): c is Component => c !== undefined);

    const composedId = nanoid();
    const composed: Component = {
      id: composedId,
      name,
      description: `Composed component from: ${childComponents.map(c => c.name).join(', ')}`,
      version: '1.0.0',
      spec: {
        atomic: false,
        composite: true,
        pattern: false,
        template: false,
        category: 'composite',
        tags: ['composed', 'custom'],
      },
      implementations: {
        react: {
          code: this.generateComposedReactCode(childComponents, layout),
          styles: this.generateComposedStyles(layout),
          tests: '',
          stories: '',
          dependencies: [],
        },
      },
      props: [],
      slots: [
        {
          name: 'children',
          description: 'Child components',
          required: false,
          allowedComponents: componentIds,
        },
      ],
      events: [],
      styles: {
        base: '',
        variants: [],
        responsive: {},
      },
      accessibility: {
        keyboardNavigation: true,
        ariaProps: {},
        wcagLevel: 'AA',
      },
      performance: {
        renderTime: 0,
        bundleSize: 0,
        memoryUsage: 0,
        reRenderCost: 'low',
      },
      dependencies: childComponents.flatMap(c => c.dependencies),
      extensions: [],
    };

    this.register(composed);
    return composed;
  }

  /**
   * Extend an existing component with new props, styles, or behavior
   */
  extend(componentId: ID, extensions: Partial<Component>): Component | null {
    const original = this.components.get(componentId);
    if (!original) return null;

    const extended: Component = {
      ...original,
      id: nanoid(),
      name: extensions.name ?? `${original.name}-extended`,
      description: extensions.description ?? original.description,
      props: [...original.props, ...(extensions.props ?? [])],
      styles: extensions.styles ?? original.styles,
      implementations: { ...original.implementations, ...(extensions.implementations ?? {}) },
      extensions: [...original.extensions, ...(extensions.extensions ?? [])],
    };

    this.register(extended);
    return extended;
  }

  // ─── Dependency Management ────────────────────────────────────────────

  /**
   * Get all dependencies for a set of components
   */
  resolveDependencies(componentIds: ID[]): Dependency[] {
    const deps = new Map<string, Dependency>();

    for (const id of componentIds) {
      const component = this.components.get(id);
      if (component) {
        for (const dep of component.dependencies) {
          deps.set(dep.name, dep);
        }
      }
    }

    return Array.from(deps.values());
  }

  /**
   * Check for circular dependencies
   */
  detectCircularDependencies(componentIds: ID[]): boolean {
    const visited = new Set<ID>();
    const recursionStack = new Set<ID>();

    const visit = (id: ID): boolean => {
      if (recursionStack.has(id)) return true;
      if (visited.has(id)) return false;

      visited.add(id);
      recursionStack.add(id);

      const component = this.components.get(id);
      if (component) {
        for (const dep of component.dependencies) {
          const depComponent = this.getByName(dep.name);
          if (depComponent && visit(depComponent.id)) {
            return true;
          }
        }
      }

      recursionStack.delete(id);
      return false;
    };

    return componentIds.some(id => visit(id));
  }

  // ─── Built-in Components ──────────────────────────────────────────────

  /**
   * Register built-in components
   */
  private registerBuiltInComponents(): void {
    // Hero Component
    this.register({
      id: 'hero-default',
      name: 'Hero Section',
      description: 'A full-width hero section with title, subtitle, and CTA',
      version: '1.0.0',
      spec: {
        atomic: false,
        composite: true,
        pattern: false,
        template: false,
        category: 'layout',
        tags: ['hero', 'header', 'landing'],
      },
      implementations: {
        react: {
          code: `export interface HeroProps {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundImage?: string;
}

export function Hero({ title, subtitle, ctaText, ctaLink, backgroundImage }: HeroProps) {
  return (
    <section className="relative py-20 px-4 md:px-8 lg:px-16">
      {backgroundImage && (
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: \`url(\${backgroundImage})\` }} />
      )}
      <div className="relative z-10 max-w-6xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">{title}</h1>
        {subtitle && <p className="text-xl text-gray-600 mb-8">{subtitle}</p>}
        {ctaText && (
          <a href={ctaLink} className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            {ctaText}
          </a>
        )}
      </div>
    </section>
  );
}`,
          styles: '',
          tests: '',
          stories: '',
          dependencies: [],
        },
      },
      props: [
        { name: 'title', type: 'string', description: 'Hero title', required: true },
        { name: 'subtitle', type: 'string', description: 'Hero subtitle', required: false },
        { name: 'ctaText', type: 'string', description: 'Call-to-action text', required: false },
        { name: 'ctaLink', type: 'string', description: 'Call-to-action link', required: false },
        { name: 'backgroundImage', type: 'string', description: 'Background image URL', required: false },
      ],
      slots: [],
      events: [],
      styles: {
        base: 'py-20 px-4 md:px-8 lg:px-16',
        variants: [
          { name: 'centered', props: {}, styles: 'text-center' },
          { name: 'split', props: {}, styles: 'flex items-center gap-8' },
        ],
        responsive: {
          mobile: 'py-12',
          tablet: 'py-16',
          desktop: 'py-20',
        },
      },
      accessibility: {
        role: 'banner',
        keyboardNavigation: true,
        ariaProps: { 'aria-label': 'Hero section' },
        wcagLevel: 'AA',
      },
      performance: {
        renderTime: 5,
        bundleSize: 2000,
        memoryUsage: 500,
        reRenderCost: 'low',
      },
      dependencies: [],
      extensions: [],
    });

    // Features Component
    this.register({
      id: 'features-default',
      name: 'Features Section',
      description: 'Display product features in a grid layout',
      version: '1.0.0',
      spec: {
        atomic: false,
        composite: true,
        pattern: false,
        template: false,
        category: 'composite',
        tags: ['features', 'grid', 'showcase'],
      },
      implementations: {
        react: {
          code: `export interface Feature {
  icon?: string;
  title: string;
  description: string;
}

export interface FeaturesProps {
  title?: string;
  subtitle?: string;
  features: Feature[];
  columns?: 2 | 3 | 4;
}

export function Features({ title, subtitle, features, columns = 3 }: FeaturesProps) {
  return (
    <section className="py-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {title && <h2 className="text-3xl font-bold text-center mb-4">{title}</h2>}
        {subtitle && <p className="text-gray-600 text-center mb-12">{subtitle}</p>}
        <div className={\`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-\${columns} gap-8\`}>
          {features.map((feature, i) => (
            <div key={i} className="p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              {feature.icon && <div className="text-3xl mb-4">{feature.icon}</div>}
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`,
          styles: '',
          tests: '',
          stories: '',
          dependencies: [],
        },
      },
      props: [
        { name: 'title', type: 'string', description: 'Section title', required: false },
        { name: 'subtitle', type: 'string', description: 'Section subtitle', required: false },
        { name: 'features', type: 'array', description: 'List of features', required: true },
        { name: 'columns', type: 'number', description: 'Number of columns (2-4)', required: false, defaultValue: 3 },
      ],
      slots: [],
      events: [],
      styles: {
        base: 'py-16',
        variants: [],
        responsive: {
          mobile: 'grid-cols-1',
          tablet: 'grid-cols-2',
          desktop: 'grid-cols-3',
        },
      },
      accessibility: {
        role: 'region',
        keyboardNavigation: true,
        ariaProps: { 'aria-label': 'Features' },
        wcagLevel: 'AA',
      },
      performance: {
        renderTime: 10,
        bundleSize: 3000,
        memoryUsage: 800,
        reRenderCost: 'low',
      },
      dependencies: [],
      extensions: [],
    });

    // Button Component
    this.register({
      id: 'button-default',
      name: 'Button',
      description: 'A versatile button component with multiple variants',
      version: '1.0.0',
      spec: {
        atomic: true,
        composite: false,
        pattern: false,
        template: false,
        category: 'interactive',
        tags: ['button', 'click', 'action', 'cta'],
      },
      implementations: {
        react: {
          code: `import { ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variantStyles = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-gray-600 text-white hover:bg-gray-700',
  outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
  ghost: 'text-gray-600 hover:bg-gray-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export function Button({ variant = 'primary', size = 'md', loading, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={\`inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed \${variantStyles[variant]} \${sizeStyles[size]}\`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="mr-2 animate-spin">⏳</span>}
      {children}
    </button>
  );
}`,
          styles: '',
          tests: '',
          stories: '',
          dependencies: [],
        },
      },
      props: [
        { name: 'variant', type: 'string', description: 'Button style variant', required: false, defaultValue: 'primary', options: ['primary', 'secondary', 'outline', 'ghost', 'danger'] },
        { name: 'size', type: 'string', description: 'Button size', required: false, defaultValue: 'md', options: ['sm', 'md', 'lg'] },
        { name: 'loading', type: 'boolean', description: 'Show loading state', required: false, defaultValue: false },
        { name: 'disabled', type: 'boolean', description: 'Disable the button', required: false, defaultValue: false },
      ],
      slots: [{ name: 'children', description: 'Button content', required: true }],
      events: [{ name: 'onClick', description: 'Click event', payload: 'MouseEvent', bubbles: true, cancelable: true }],
      styles: {
        base: 'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
        variants: [
          { name: 'primary', props: { variant: 'primary' }, styles: 'bg-blue-600 text-white hover:bg-blue-700' },
          { name: 'secondary', props: { variant: 'secondary' }, styles: 'bg-gray-600 text-white hover:bg-gray-700' },
          { name: 'outline', props: { variant: 'outline' }, styles: 'border-2 border-blue-600 text-blue-600' },
          { name: 'ghost', props: { variant: 'ghost' }, styles: 'text-gray-600 hover:bg-gray-100' },
          { name: 'danger', props: { variant: 'danger' }, styles: 'bg-red-600 text-white hover:bg-red-700' },
        ],
        responsive: {},
      },
      accessibility: {
        role: 'button',
        keyboardNavigation: true,
        ariaProps: { 'aria-disabled': 'disabled' },
        wcagLevel: 'AA',
      },
      performance: {
        renderTime: 1,
        bundleSize: 1000,
        memoryUsage: 200,
        reRenderCost: 'low',
      },
      dependencies: [],
      extensions: [],
    });

    // Card Component
    this.register({
      id: 'card-default',
      name: 'Card',
      description: 'A flexible card component for displaying content',
      version: '1.0.0',
      spec: {
        atomic: false,
        composite: true,
        pattern: false,
        template: false,
        category: 'display',
        tags: ['card', 'container', 'content'],
      },
      implementations: {
        react: {
          code: `export interface CardProps {
  title?: string;
  description?: string;
  image?: string;
  alt?: string;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  hoverable?: boolean;
}

export function Card({ title, description, image, alt, footer, children, hoverable = false }: CardProps) {
  return (
    <div className={\`rounded-xl border border-gray-200 bg-white overflow-hidden \${hoverable ? 'hover:shadow-lg transition-shadow cursor-pointer' : ''}\`}>
      {image && <img src={image} alt={alt ?? title ?? ''} className="w-full h-48 object-cover" />}
      <div className="p-6">
        {title && <h3 className="text-xl font-semibold mb-2">{title}</h3>}
        {description && <p className="text-gray-600">{description}</p>}
        {children}
      </div>
      {footer && <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">{footer}</div>}
    </div>
  );
}`,
          styles: '',
          tests: '',
          stories: '',
          dependencies: [],
        },
      },
      props: [
        { name: 'title', type: 'string', description: 'Card title', required: false },
        { name: 'description', type: 'string', description: 'Card description', required: false },
        { name: 'image', type: 'string', description: 'Card image URL', required: false },
        { name: 'hoverable', type: 'boolean', description: 'Enable hover effect', required: false, defaultValue: false },
      ],
      slots: [
        { name: 'children', description: 'Card body content', required: false },
        { name: 'footer', description: 'Card footer content', required: false },
      ],
      events: [],
      styles: {
        base: 'rounded-xl border border-gray-200 bg-white overflow-hidden',
        variants: [
          { name: 'elevated', props: {}, styles: 'shadow-lg' },
          { name: 'interactive', props: {}, styles: 'hover:shadow-lg transition-shadow cursor-pointer' },
        ],
        responsive: {},
      },
      accessibility: {
        role: 'article',
        keyboardNavigation: true,
        ariaProps: {},
        wcagLevel: 'AA',
      },
      performance: {
        renderTime: 3,
        bundleSize: 2000,
        memoryUsage: 400,
        reRenderCost: 'low',
      },
      dependencies: [],
      extensions: [],
    });

    // Navbar Component
    this.register({
      id: 'navbar-default',
      name: 'Navbar',
      description: 'A responsive navigation bar',
      version: '1.0.0',
      spec: {
        atomic: false,
        composite: true,
        pattern: false,
        template: false,
        category: 'navigation',
        tags: ['navbar', 'navigation', 'header', 'menu'],
      },
      implementations: {
        react: {
          code: `import { useState } from 'react';

export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
}

export interface NavbarProps {
  logo?: string;
  logoText?: string;
  items: NavItem[];
  ctaText?: string;
  ctaLink?: string;
}

export function Navbar({ logo, logoText, items, ctaText, ctaLink }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          {logo && <img src={logo} alt="Logo" className="h-8" />}
          {logoText && <span className="text-xl font-bold">{logoText}</span>}
        </a>
        <div className="hidden md:flex items-center gap-6">
          {items.map((item, i) => (
            <a key={i} href={item.href} className="text-gray-600 hover:text-gray-900 font-medium">
              {item.label}
            </a>
          ))}
        </div>
        {ctaText && (
          <a href={ctaLink} className="hidden md:inline-block px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">
            {ctaText}
          </a>
        )}
        <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
          ☰
        </button>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden px-4 py-3 border-t border-gray-200">
          {items.map((item, i) => (
            <a key={i} href={item.href} className="block py-2 text-gray-600">
              {item.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}`,
          styles: '',
          tests: '',
          stories: '',
          dependencies: [],
        },
      },
      props: [
        { name: 'logo', type: 'string', description: 'Logo image URL', required: false },
        { name: 'logoText', type: 'string', description: 'Logo text', required: false },
        { name: 'items', type: 'array', description: 'Navigation items', required: true },
        { name: 'ctaText', type: 'string', description: 'CTA button text', required: false },
        { name: 'ctaLink', type: 'string', description: 'CTA button link', required: false },
      ],
      slots: [],
      events: [],
      styles: {
        base: 'bg-white border-b border-gray-200 sticky top-0 z-50',
        variants: [
          { name: 'transparent', props: {}, styles: 'bg-transparent border-none' },
          { name: 'dark', props: {}, styles: 'bg-gray-900 border-gray-800' },
        ],
        responsive: {},
      },
      accessibility: {
        role: 'navigation',
        keyboardNavigation: true,
        ariaProps: { 'aria-label': 'Main navigation' },
        wcagLevel: 'AA',
      },
      performance: {
        renderTime: 4,
        bundleSize: 2500,
        memoryUsage: 600,
        reRenderCost: 'low',
      },
      dependencies: [],
      extensions: [],
    });

    // Footer Component
    this.register({
      id: 'footer-default',
      name: 'Footer',
      description: 'A responsive footer component',
      version: '1.0.0',
      spec: {
        atomic: false,
        composite: true,
        pattern: false,
        template: false,
        category: 'layout',
        tags: ['footer', 'bottom', 'links'],
      },
      implementations: {
        react: {
          code: `export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface FooterProps {
  columns: FooterColumn[];
  copyright?: string;
  socialLinks?: FooterLink[];
}

export function Footer({ columns, copyright, socialLinks }: FooterProps) {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {columns.map((column, i) => (
          <div key={i}>
            <h4 className="font-semibold mb-4">{column.title}</h4>
            <ul className="space-y-2">
              {column.links.map((link, j) => (
                <li key={j}>
                  <a href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-gray-400">{copyright ?? \`© \${new Date().getFullYear()} All rights reserved.\`}</p>
        {socialLinks && (
          <div className="flex gap-4">
            {socialLinks.map((link, i) => (
              <a key={i} href={link.href} className="text-gray-400 hover:text-white">
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
}`,
          styles: '',
          tests: '',
          stories: '',
          dependencies: [],
        },
      },
      props: [
        { name: 'columns', type: 'array', description: 'Footer link columns', required: true },
        { name: 'copyright', type: 'string', description: 'Copyright text', required: false },
        { name: 'socialLinks', type: 'array', description: 'Social media links', required: false },
      ],
      slots: [],
      events: [],
      styles: {
        base: 'bg-gray-900 text-white py-12',
        variants: [],
        responsive: {},
      },
      accessibility: {
        role: 'contentinfo',
        keyboardNavigation: true,
        ariaProps: {},
        wcagLevel: 'AA',
      },
      performance: {
        renderTime: 3,
        bundleSize: 2000,
        memoryUsage: 400,
        reRenderCost: 'low',
      },
      dependencies: [],
      extensions: [],
    });

    // Pricing Component
    this.register({
      id: 'pricing-default',
      name: 'Pricing Section',
      description: 'Display pricing plans in a comparison layout',
      version: '1.0.0',
      spec: {
        atomic: false,
        composite: true,
        pattern: false,
        template: false,
        category: 'composite',
        tags: ['pricing', 'plans', 'subscription'],
      },
      implementations: {
        react: {
          code: `export interface PricingTier {
  name: string;
  price: string;
  period?: string;
  description?: string;
  features: string[];
  ctaText: string;
  ctaLink: string;
  highlighted?: boolean;
}

export interface PricingProps {
  title?: string;
  subtitle?: string;
  tiers: PricingTier[];
}

export function Pricing({ title, subtitle, tiers }: PricingProps) {
  return (
    <section className="py-16 px-4 md:px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {title && <h2 className="text-3xl font-bold text-center mb-4">{title}</h2>}
        {subtitle && <p className="text-gray-600 text-center mb-12">{subtitle}</p>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier, i) => (
            <div key={i} className={\`rounded-xl p-8 \${tier.highlighted ? 'bg-blue-600 text-white ring-4 ring-blue-600 ring-offset-2 scale-105' : 'bg-white border border-gray-200'}\`}>
              <h3 className="text-xl font-semibold mb-2">{tier.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">{tier.price}</span>
                {tier.period && <span className={tier.highlighted ? 'text-blue-100' : 'text-gray-500'}>/{tier.period}</span>}
              </div>
              {tier.description && <p className={tier.highlighted ? 'text-blue-100' : 'text-gray-600'}>{tier.description}</p>}
              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-2">
                    <span className={tier.highlighted ? 'text-blue-100' : 'text-green-500'}>✓</span>
                    <span className={tier.highlighted ? 'text-blue-50' : 'text-gray-600'}>{feature}</span>
                  </li>
                ))}
              </ul>
              <a href={tier.ctaLink} className={\`block text-center py-3 rounded-lg font-semibold transition-colors \${tier.highlighted ? 'bg-white text-blue-600 hover:bg-blue-50' : 'bg-blue-600 text-white hover:bg-blue-700'}\`}>
                {tier.ctaText}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`,
          styles: '',
          tests: '',
          stories: '',
          dependencies: [],
        },
      },
      props: [
        { name: 'title', type: 'string', description: 'Section title', required: false },
        { name: 'subtitle', type: 'string', description: 'Section subtitle', required: false },
        { name: 'tiers', type: 'array', description: 'Pricing tiers', required: true },
      ],
      slots: [],
      events: [],
      styles: {
        base: 'py-16 bg-gray-50',
        variants: [],
        responsive: {},
      },
      accessibility: {
        role: 'region',
        keyboardNavigation: true,
        ariaProps: { 'aria-label': 'Pricing plans' },
        wcagLevel: 'AA',
      },
      performance: {
        renderTime: 8,
        bundleSize: 3500,
        memoryUsage: 700,
        reRenderCost: 'low',
      },
      dependencies: [],
      extensions: [],
    });

    // Add more built-in components...
    this.registerTextInput();
    this.registerModal();
    this.registerCTA();
  }

  /**
   * Register Text Input component
   */
  private registerTextInput(): void {
    this.register({
      id: 'input-default',
      name: 'Text Input',
      description: 'A form text input component',
      version: '1.0.0',
      spec: {
        atomic: true,
        composite: false,
        pattern: false,
        template: false,
        category: 'form',
        tags: ['input', 'form', 'text', 'field'],
      },
      implementations: {
        react: {
          code: `export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({ label, error, helperText, id, ...props }: InputProps) {
  const inputId = id ?? \`input-\${Math.random().toString(36).substr(2, 9)}\`;
  return (
    <div className="space-y-1">
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">{label}</label>}
      <input
        id={inputId}
        className={\`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors \${error ? 'border-red-500' : 'border-gray-300'}\`}
        aria-invalid={!!error}
        aria-describedBy={error ? \`\${inputId}-error\` : undefined}
        {...props}
      />
      {error && <p id={\`\${inputId}-error\`} className="text-sm text-red-500">{error}</p>}
      {helperText && !error && <p className="text-sm text-gray-500">{helperText}</p>}
    </div>
  );
}`,
          styles: '',
          tests: '',
          stories: '',
          dependencies: [],
        },
      },
      props: [
        { name: 'label', type: 'string', description: 'Input label', required: false },
        { name: 'error', type: 'string', description: 'Error message', required: false },
        { name: 'helperText', type: 'string', description: 'Helper text', required: false },
        { name: 'placeholder', type: 'string', description: 'Placeholder text', required: false },
        { name: 'type', type: 'string', description: 'Input type', required: false, defaultValue: 'text' },
      ],
      slots: [],
      events: [{ name: 'onChange', description: 'Change event', payload: 'ChangeEvent', bubbles: true, cancelable: false }],
      styles: {
        base: 'w-full px-3 py-2 border rounded-lg',
        variants: [],
        responsive: {},
      },
      accessibility: {
        role: 'textbox',
        keyboardNavigation: true,
        ariaProps: { 'aria-invalid': 'false' },
        wcagLevel: 'AA',
      },
      performance: {
        renderTime: 1,
        bundleSize: 800,
        memoryUsage: 150,
        reRenderCost: 'low',
      },
      dependencies: [],
      extensions: [],
    });
  }

  /**
   * Register Modal component
   */
  private registerModal(): void {
    this.register({
      id: 'modal-default',
      name: 'Modal',
      description: 'A modal dialog component',
      version: '1.0.0',
      spec: {
        atomic: false,
        composite: true,
        pattern: false,
        template: false,
        category: 'feedback',
        tags: ['modal', 'dialog', 'overlay', 'popup'],
      },
      implementations: {
        react: {
          code: `import { useEffect } from 'react';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeStyles = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl' };

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby={title ? 'modal-title' : undefined}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={\`relative bg-white rounded-xl shadow-xl p-6 mx-4 w-full \${sizeStyles[size]}\`}>
        {title && <h2 id="modal-title" className="text-xl font-semibold mb-4">{title}</h2>}
        {children}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" aria-label="Close">✕</button>
      </div>
    </div>
  );
}`,
          styles: '',
          tests: '',
          stories: '',
          dependencies: [],
        },
      },
      props: [
        { name: 'open', type: 'boolean', description: 'Whether modal is open', required: true },
        { name: 'onClose', type: 'function', description: 'Close handler', required: true },
        { name: 'title', type: 'string', description: 'Modal title', required: false },
        { name: 'size', type: 'string', description: 'Modal size', required: false, defaultValue: 'md' },
      ],
      slots: [{ name: 'children', description: 'Modal content', required: true }],
      events: [{ name: 'onClose', description: 'Close event', payload: 'void', bubbles: false, cancelable: false }],
      styles: {
        base: 'fixed inset-0 z-50',
        variants: [],
        responsive: {},
      },
      accessibility: {
        role: 'dialog',
        keyboardNavigation: true,
        ariaProps: { 'aria-modal': 'true' },
        wcagLevel: 'AA',
      },
      performance: {
        renderTime: 2,
        bundleSize: 1500,
        memoryUsage: 300,
        reRenderCost: 'low',
      },
      dependencies: [],
      extensions: [],
    });
  }

  /**
   * Register CTA component
   */
  private registerCTA(): void {
    this.register({
      id: 'cta-default',
      name: 'CTA Section',
      description: 'A call-to-action section',
      version: '1.0.0',
      spec: {
        atomic: false,
        composite: true,
        pattern: false,
        template: false,
        category: 'composite',
        tags: ['cta', 'call-to-action', 'conversion'],
      },
      implementations: {
        react: {
          code: `export interface CTAProps {
  title: string;
  subtitle?: string;
  buttonText: string;
  buttonLink: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
}

export function CTA({ title, subtitle, buttonText, buttonLink, secondaryButtonText, secondaryButtonLink }: CTAProps) {
  return (
    <section className="py-20 px-4 md:px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
        {subtitle && <p className="text-xl text-blue-100 mb-8">{subtitle}</p>}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href={buttonLink} className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            {buttonText}
          </a>
          {secondaryButtonText && (
            <a href={secondaryButtonLink} className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors">
              {secondaryButtonText}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}`,
          styles: '',
          tests: '',
          stories: '',
          dependencies: [],
        },
      },
      props: [
        { name: 'title', type: 'string', description: 'CTA title', required: true },
        { name: 'subtitle', type: 'string', description: 'CTA subtitle', required: false },
        { name: 'buttonText', type: 'string', description: 'Primary button text', required: true },
        { name: 'buttonLink', type: 'string', description: 'Primary button link', required: true },
        { name: 'secondaryButtonText', type: 'string', description: 'Secondary button text', required: false },
      ],
      slots: [],
      events: [],
      styles: {
        base: 'py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white',
        variants: [],
        responsive: {},
      },
      accessibility: {
        role: 'region',
        keyboardNavigation: true,
        ariaProps: { 'aria-label': 'Call to action' },
        wcagLevel: 'AA',
      },
      performance: {
        renderTime: 4,
        bundleSize: 2000,
        memoryUsage: 400,
        reRenderCost: 'low',
      },
      dependencies: [],
      extensions: [],
    });
  }

  // ─── Framework Adapters ───────────────────────────────────────────────

  /**
   * Register framework adapters
   */
  private registerFrameworkAdapters(): void {
    this.frameworkAdapters.set('react', new ReactAdapter());
    this.frameworkAdapters.set('vue', new VueAdapter());
    this.frameworkAdapters.set('svelte', new SvelteAdapter());
    this.frameworkAdapters.set('angular', new AngularAdapter());
    this.frameworkAdapters.set('vanilla', new VanillaAdapter());
  }

  // ─── Code Generation ──────────────────────────────────────────────────

  /**
   * Generate composed React code
   */
  private generateComposedReactCode(components: Component[], layout: string): string {
    const childCode = components.map(c => {
      const impl = c.implementations.react;
      return impl ? impl.code : '';
    }).join('\n\n');

    return `export function Composed${layout.charAt(0).toUpperCase() + layout.slice(1)}(props: any) {
  return (
    <div className="composed-${layout}">
      {/* Composed from: ${components.map(c => c.name).join(', ')} */}
      ${components.map(c => `<${c.name} {...props.${c.name}} />`).join('\n      ')}
    </div>
  );
}`;
  }

  /**
   * Generate composed styles
   */
  private generateComposedStyles(layout: string): string {
    if (layout === 'horizontal') return 'display: flex; flex-direction: row;';
    if (layout === 'grid') return 'display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));';
    return 'display: flex; flex-direction: column;';
  }
}

// ─── Framework Adapters ─────────────────────────────────────────────────────

interface FrameworkAdapter {
  generate(component: Component): FrameworkImplementation;
}

class ReactAdapter implements FrameworkAdapter {
  generate(component: Component): FrameworkImplementation {
    return {
      code: `export function ${component.name.replace(/[^a-zA-Z0-9]/g, '')}(props: any) {
  return <div>{/* ${component.name} */}</div>;
}`,
      styles: '',
      tests: '',
      stories: '',
      dependencies: [],
    };
  }
}

class VueAdapter implements FrameworkAdapter {
  generate(component: Component): FrameworkImplementation {
    return {
      code: `<template>
  <div>${component.name}</div>
</template>

<script setup lang="ts">
defineProps<{
  // Props here
}>();
</script>`,
      styles: '',
      tests: '',
      stories: '',
      dependencies: [],
    };
  }
}

class SvelteAdapter implements FrameworkAdapter {
  generate(component: Component): FrameworkImplementation {
    return {
      code: `<script lang="ts">
  // Props here
</script>

<div>${component.name}</div>`,
      styles: '',
      tests: '',
      stories: '',
      dependencies: [],
    };
  }
}

class AngularAdapter implements FrameworkAdapter {
  generate(component: Component): FrameworkImplementation {
    return {
      code: `import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-${component.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}',
  template: \`<div>${component.name}</div>\`,
})
export class ${component.name.replace(/[^a-zA-Z0-9]/g, '')}Component {}`,
      styles: '',
      tests: '',
      stories: '',
      dependencies: [],
    };
  }
}

class VanillaAdapter implements FrameworkAdapter {
  generate(component: Component): FrameworkImplementation {
    return {
      code: `class ${component.name.replace(/[^a-zA-Z0-9]/g, '')} extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  connectedCallback() {
    this.shadowRoot.innerHTML = \`<div>${component.name}</div>\`;
  }
}
customElements.define('${component.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}', ${component.name.replace(/[^a-zA-Z0-9]/g, '')});`,
      styles: '',
      tests: '',
      stories: '',
      dependencies: [],
    };
  }
}

// ─── Utility Functions ──────────────────────────────────────────────────────

export function createComponentEngine(): ComponentEngine {
  return new ComponentEngine();
}

export default ComponentEngine;
