// ============================================================================
// Component Code Generator
// Produces real, working React components from spec definitions
// ============================================================================

import type { Section, ProjectSpec } from '../types/index.js';

export interface GeneratedComponent {
  path: string;
  content: string;
  name: string;
}

export class ComponentCodeGenerator {
  private spec: ProjectSpec;

  constructor(spec: ProjectSpec) {
    this.spec = spec;
  }

  /**
   * Generate all components used in the spec
   */
  generateAll(): GeneratedComponent[] {
    const components = new Map<string, GeneratedComponent>();
    const scanSection = (section: Section) => {
      if (!components.has(section.component)) {
        components.set(section.component, this.generate(section));
      }
      for (const child of section.children) {
        scanSection(child);
      }
    };
    for (const page of this.spec.structure.pages) {
      for (const section of page.sections) {
        scanSection(section);
      }
    }
    return Array.from(components.values());
  }

  /**
   * Generate a single component file
   */
  generate(section: Section): GeneratedComponent {
    const name = this.toPascalCase(section.component);
    const content = this.getComponentTemplate(name, section);
    return {
      path: `src/components/${name}.tsx`,
      content,
      name,
    };
  }

  /**
   * Get the appropriate template based on component type
   */
  private getComponentTemplate(name: string, section: Section): string {
    const props = section.props;
    const componentType = section.component;

    if (componentType.includes('hero')) {
      return this.generateHero(name, props);
    }
    if (componentType.includes('features')) {
      return this.generateFeatures(name, props);
    }
    if (componentType.includes('pricing')) {
      return this.generatePricing(name, props);
    }
    if (componentType.includes('cta')) {
      return this.generateCTA(name, props);
    }
    if (componentType.includes('stats')) {
      return this.generateStats(name, props);
    }
    if (componentType.includes('chart')) {
      return this.generateChart(name, props);
    }
    if (componentType.includes('activity')) {
      return this.generateActivityFeed(name, props);
    }
    if (componentType.includes('testimonials')) {
      return this.generateTestimonials(name, props);
    }
    if (componentType.includes('footer')) {
      return this.generateFooter(name, props);
    }
    if (componentType.includes('navbar') || componentType.includes('header')) {
      return this.generateNavbar(name, props);
    }

    // Default component
    return this.generateDefault(name, props);
  }

  /**
   * Generate a Hero section component
   */
  private generateHero(name: string, props: Record<string, any>): string {
    const title = props.title || 'Welcome to Our Platform';
    const subtitle = props.subtitle || 'The best solution for your needs';
    const ctaText = props.ctaText || 'Get Started';
    const ctaLink = props.ctaLink || '#';

    return `'use client';

import React from 'react';

export interface ${name}Props {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundImage?: string;
}

export function ${name}({
  title = "${title}",
  subtitle = "${subtitle}",
  ctaText = "${ctaText}",
  ctaLink = "${ctaLink}",
  backgroundImage,
}: ${name}Props) {
  return (
    <section className="relative py-20 px-4 md:px-8 lg:px-16 bg-gradient-to-br from-blue-50 to-indigo-50">
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: \`url(\${backgroundImage})\` }}
        />
      )}
      <div className="relative z-10 max-w-6xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
        {ctaText && (
          <a
            href={ctaLink}
            className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            {ctaText}
          </a>
        )}
      </div>
    </section>
  );
}
`;
  }

  /**
   * Generate a Features section component
   */
  private generateFeatures(name: string, props: Record<string, any>): string {
    const title = props.title || 'Features';
    const subtitle = props.subtitle || 'Everything you need';

    return `'use client';

import React from 'react';

export interface ${name}Props {
  title?: string;
  subtitle?: string;
  columns?: 2 | 3 | 4;
}

const features = [
  { icon: '⚡', title: 'Fast Performance', description: 'Lightning-fast load times and smooth interactions' },
  { icon: '🔒', title: 'Secure by Default', description: 'Enterprise-grade security built into every layer' },
  { icon: '📱', title: 'Mobile First', description: 'Optimized for all devices and screen sizes' },
  { icon: '🔄', title: 'Auto Updates', description: 'Always stay current with automatic updates' },
  { icon: '📊', title: 'Analytics', description: 'Deep insights into your application performance' },
  { icon: '🤝', title: 'Team Collaboration', description: 'Work together seamlessly with your team' },
];

export function ${name}({
  title = "${title}",
  subtitle = "${subtitle}",
  columns = 3,
}: ${name}Props) {
  const gridCols = columns === 2 ? 'md:grid-cols-2' : columns === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-3';

  return (
    <section className="py-20 px-4 md:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        {title && <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">{title}</h2>}
        {subtitle && <p className="text-gray-600 text-center mb-12 text-lg">{subtitle}</p>}
        <div className={\`grid grid-cols-1 \${gridCols} gap-8\`}>
          {features.map((feature, i) => (
            <div key={i} className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
  }

  /**
   * Generate a Pricing section component
   */
  private generatePricing(name: string, props: Record<string, any>): string {
    const title = props.title || 'Pricing';
    const subtitle = props.subtitle || 'Choose your plan';

    return `'use client';

import React from 'react';

export interface ${name}Props {
  title?: string;
  subtitle?: string;
  tiers?: 2 | 3;
}

const pricingTiers = [
  { name: 'Starter', price: '$9', period: 'month', features: ['1 Project', '1 GB Storage', 'Basic Support', 'API Access'], highlighted: false },
  { name: 'Pro', price: '$29', period: 'month', features: ['Unlimited Projects', '100 GB Storage', 'Priority Support', 'Advanced API', 'Team Collaboration'], highlighted: true },
  { name: 'Enterprise', price: '$99', period: 'month', features: ['Everything in Pro', 'Unlimited Storage', 'Dedicated Support', 'Custom Integrations', 'SLA', 'SSO'], highlighted: false },
];

export function ${name}({
  title = "${title}",
  subtitle = "${subtitle}",
  tiers = 3,
}: ${name}Props) {
  const displayTiers = pricingTiers.slice(0, tiers);

  return (
    <section className="py-20 px-4 md:px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {title && <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">{title}</h2>}
        {subtitle && <p className="text-gray-600 text-center mb-12 text-lg">{subtitle}</p>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {displayTiers.map((tier, i) => (
            <div
              key={i}
              className={\`rounded-xl p-8 \${
                tier.highlighted
                  ? 'bg-blue-600 text-white ring-4 ring-blue-600 ring-offset-2 scale-105 shadow-xl'
                  : 'bg-white border border-gray-200 shadow-sm'
              }\`}
            >
              <h3 className="text-xl font-semibold mb-2">{tier.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">{tier.price}</span>
                <span className={tier.highlighted ? 'text-blue-100' : 'text-gray-500'}>/{tier.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-2">
                    <span className={tier.highlighted ? 'text-blue-100' : 'text-green-500'}>✓</span>
                    <span className={tier.highlighted ? 'text-blue-50' : 'text-gray-600'}>{feature}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#"
                className={\`block text-center py-3 rounded-lg font-semibold transition-colors \${
                  tier.highlighted
                    ? 'bg-white text-blue-600 hover:bg-blue-50'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }\`}
              >
                Get Started
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
  }

  /**
   * Generate a CTA section component
   */
  private generateCTA(name: string, props: Record<string, any>): string {
    const title = props.title || 'Ready to get started?';
    const buttonText = props.buttonText || 'Sign Up Now';
    const buttonLink = props.buttonLink || '#';

    return `'use client';

import React from 'react';

export interface ${name}Props {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
}

export function ${name}({
  title = "${title}",
  subtitle = "Join thousands of users already using our platform",
  buttonText = "${buttonText}",
  buttonLink = "${buttonLink}",
  secondaryButtonText,
  secondaryButtonLink,
}: ${name}Props) {
  return (
    <section className="py-20 px-4 md:px-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
        {subtitle && <p className="text-xl text-blue-100 mb-8">{subtitle}</p>}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={buttonLink}
            className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors shadow-lg"
          >
            {buttonText}
          </a>
          {secondaryButtonText && (
            <a
              href={secondaryButtonLink}
              className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white/10 transition-colors"
            >
              {secondaryButtonText}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
`;
  }

  /**
   * Generate a Stats section component
   */
  private generateStats(name: string, props: Record<string, any>): string {
    return `'use client';

import React from 'react';

export interface ${name}Props {
  title?: string;
  columns?: 2 | 3 | 4;
}

const stats = [
  { label: 'Active Users', value: '10K+' },
  { label: 'Projects Created', value: '50K+' },
  { label: 'Uptime', value: '99.9%' },
  { label: 'Countries', value: '150+' },
];

export function ${name}({
  title = "Overview",
  columns = 4,
}: ${name}Props) {
  const gridCols = columns === 2 ? 'md:grid-cols-2' : columns === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4';

  return (
    <section className="py-16 px-4 md:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        {title && <h2 className="text-2xl font-bold mb-8">{title}</h2>}
        <div className={\`grid grid-cols-1 \${gridCols} gap-6\`}>
          {stats.map((stat, i) => (
            <div key={i} className="p-6 rounded-lg border border-gray-200 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
  }

  /**
   * Generate a Chart section component
   */
  private generateChart(name: string, props: Record<string, any>): string {
    return `'use client';

import React from 'react';

export interface ${name}Props {
  title?: string;
  type?: 'line' | 'bar' | 'area';
}

export function ${name}({
  title = "Analytics",
  type = "line",
}: ${name}Props) {
  return (
    <section className="py-16 px-4 md:px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {title && <h2 className="text-2xl font-bold mb-8">{title}</h2>}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="h-64 flex items-end justify-between gap-2">
            {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                style={{ height: \`\${h}%\` }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-4 text-sm text-gray-500">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span>
            <span>May</span><span>Jun</span><span>Jul</span><span>Aug</span>
            <span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
          </div>
        </div>
      </div>
    </section>
  );
}
`;
  }

  /**
   * Generate an Activity Feed component
   */
  private generateActivityFeed(name: string, props: Record<string, any>): string {
    return `'use client';

import React from 'react';

export interface ${name}Props {
  title?: string;
  limit?: number;
}

const activities = [
  { user: 'Alice', action: 'created a new project', time: '2 min ago' },
  { user: 'Bob', action: 'deployed to production', time: '15 min ago' },
  { user: 'Charlie', action: 'added a new feature', time: '1 hour ago' },
  { user: 'Diana', action: 'updated the design', time: '3 hours ago' },
  { user: 'Eve', action: 'invited a team member', time: '5 hours ago' },
];

export function ${name}({
  title = "Recent Activity",
  limit = 5,
}: ${name}Props) {
  return (
    <section className="py-16 px-4 md:px-8 bg-white">
      <div className="max-w-4xl mx-auto">
        {title && <h2 className="text-2xl font-bold mb-8">{title}</h2>}
        <div className="space-y-4">
          {activities.slice(0, limit).map((activity, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-gray-200">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                {activity.user[0]}
              </div>
              <div className="flex-1">
                <span className="font-medium">{activity.user}</span>
                <span className="text-gray-600"> {activity.action}</span>
              </div>
              <span className="text-sm text-gray-400">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
  }

  /**
   * Generate a Testimonials component
   */
  private generateTestimonials(name: string, props: Record<string, any>): string {
    return `'use client';

import React from 'react';

export interface ${name}Props {
  title?: string;
  subtitle?: string;
}

const testimonials = [
  { name: 'Sarah Johnson', role: 'CEO at TechCorp', quote: 'This platform has transformed how we work. Our productivity increased by 300%.', avatar: 'SJ' },
  { name: 'Mike Chen', role: 'Developer at StartupXYZ', quote: 'The best tool I\'ve used in years. Simple, fast, and reliable.', avatar: 'MC' },
  { name: 'Emily Davis', role: 'Designer at CreativeStudio', quote: 'Beautiful design and excellent user experience. Highly recommended!', avatar: 'ED' },
];

export function ${name}({
  title = "What Our Users Say",
  subtitle = "Trusted by thousands of teams worldwide",
}: ${name}Props) {
  return (
    <section className="py-20 px-4 md:px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {title && <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">{title}</h2>}
        {subtitle && <p className="text-gray-600 text-center mb-12 text-lg">{subtitle}</p>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
              <p className="text-gray-600 italic">"{testimonial.quote}"</p>
              <div className="mt-4 flex gap-1 text-yellow-400">★★★★★</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
  }

  /**
   * Generate a Footer component
   */
  private generateFooter(name: string, props: Record<string, any>): string {
    return `'use client';

import React from 'react';

export interface ${name}Props {
  columns?: Array<{ title: string; links: Array<{ label: string; href: string }> }>;
  copyright?: string;
}

const defaultColumns = [
  { title: 'Product', links: [{ label: 'Features', href: '#' }, { label: 'Pricing', href: '#' }, { label: 'Changelog', href: '#' }, { label: 'Roadmap', href: '#' }] },
  { title: 'Company', links: [{ label: 'About', href: '#' }, { label: 'Blog', href: '#' }, { label: 'Careers', href: '#' }, { label: 'Contact', href: '#' }] },
  { title: 'Resources', links: [{ label: 'Documentation', href: '#' }, { label: 'Help Center', href: '#' }, { label: 'API Reference', href: '#' }, { label: 'Status', href: '#' }] },
  { title: 'Legal', links: [{ label: 'Privacy', href: '#' }, { label: 'Terms', href: '#' }, { label: 'Security', href: '#' }, { label: 'Cookies', href: '#' }] },
];

export function ${name}({
  columns = defaultColumns,
  copyright = \`© \${new Date().getFullYear()} All rights reserved.\`,
}: ${name}Props) {
  return (
    <footer className="bg-gray-900 text-white py-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
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
        <div className="pt-8 border-t border-gray-800 text-center text-gray-400">
          {copyright}
        </div>
      </div>
    </footer>
  );
}
`;
  }

  /**
   * Generate a Navbar component
   */
  private generateNavbar(name: string, props: Record<string, any>): string {
    return `'use client';

import React, { useState } from 'react';

export interface ${name}Props {
  logo?: string;
  logoText?: string;
  items?: Array<{ label: string; href: string; external?: boolean }>;
  ctaText?: string;
  ctaLink?: string;
}

const defaultItems = [
  { label: 'Product', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

export function ${name}({
  logo,
  logoText = "WebBuilder",
  items = defaultItems,
  ctaText = "Get Started",
  ctaLink = "#",
}: ${name}Props) {
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
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
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
}
`;
  }

  /**
   * Generate a default component
   */
  private generateDefault(name: string, props: Record<string, any>): string {
    const propsInterface = Object.keys(props).length > 0
      ? Object.entries(props).map(([k, v]) => `  ${k}?: ${typeof v === 'string' ? 'string' : 'any'};`).join('\n')
      : '  // Add props here';

    return `'use client';

import React from 'react';

export interface ${name}Props {
${propsInterface}
}

export function ${name}(props: ${name}Props) {
  return (
    <section className="py-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* ${name} component */}
      </div>
    </section>
  );
}
`;
  }

  /**
   * Convert kebab-case to PascalCase
   */
  private toPascalCase(str: string): string {
    return str.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
  }
}

export function generateComponents(spec: ProjectSpec): GeneratedComponent[] {
  const generator = new ComponentCodeGenerator(spec);
  return generator.generateAll();
}

export default ComponentCodeGenerator;
