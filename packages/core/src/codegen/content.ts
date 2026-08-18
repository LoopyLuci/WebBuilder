// ============================================================================
// Content Generator
// Produces realistic content from templates and spec
// ============================================================================

import type { ProjectSpec, Page, Section } from '../types/index.js';

export interface GeneratedContent {
  pages: Record<string, PageContent>;
  navigation: NavItem[];
  footer: FooterContent;
}

export interface PageContent {
  title: string;
  sections: SectionContent[];
}

export interface SectionContent {
  id: string;
  title?: string;
  subtitle?: string;
  items?: ContentItem[];
  cta?: { text: string; link: string };
}

export interface ContentItem {
  title: string;
  description: string;
  icon?: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface FooterContent {
  columns: { title: string; links: { label: string; href: string }[] }[];
  copyright: string;
}

export class ContentGenerator {
  private spec: ProjectSpec;

  constructor(spec: ProjectSpec) {
    this.spec = spec;
  }

  /**
   * Generate all content for the project
   */
  generate(): GeneratedContent {
    const pages: Record<string, PageContent> = {};

    for (const page of this.spec.structure.pages) {
      pages[page.path] = this.generatePageContent(page);
    }

    return {
      pages,
      navigation: this.generateNavigation(),
      footer: this.generateFooter(),
    };
  }

  /**
   * Generate content for a single page
   */
  private generatePageContent(page: Page): PageContent {
    const sections: SectionContent[] = [];

    for (const section of page.sections) {
      sections.push(this.generateSectionContent(section));
    }

    return {
      title: page.title,
      sections,
    };
  }

  /**
   * Generate content for a section
   */
  private generateSectionContent(section: Section): SectionContent {
    const componentType = section.component;
    const getStr = (key: string): string | undefined => {
      const val = section.props[key];
      return typeof val === 'string' ? val : undefined;
    };
    const getNum = (key: string): number => {
      const val = section.props[key];
      return typeof val === 'number' ? val : parseInt(String(val)) || 0;
    };

    if (componentType.includes('hero')) {
      return {
        id: section.id,
        title: getStr('title') || this.getDefaultTitle('hero'),
        subtitle: getStr('subtitle') || this.getDefaultSubtitle('hero'),
        cta: {
          text: getStr('ctaText') || 'Get Started',
          link: getStr('ctaLink') || '#',
        },
      };
    }

    if (componentType.includes('features')) {
      return {
        id: section.id,
        title: getStr('title') || 'Features',
        subtitle: getStr('subtitle') || 'Everything you need to succeed',
        items: this.getFeaturesList(getNum('count') || 6),
      };
    }

    if (componentType.includes('pricing')) {
      return {
        id: section.id,
        title: getStr('title') || 'Pricing',
        subtitle: getStr('subtitle') || 'Choose the plan that works for you',
        items: this.getPricingTiers(getNum('tiers') || 3),
      };
    }

    return {
      id: section.id,
      title: getStr('title'),
      subtitle: getStr('subtitle'),
    };
  }

  /**
   * Generate navigation items
   */
  private generateNavigation(): NavItem[] {
    return this.spec.structure.navigation.map(n => ({
      label: n.label,
      href: n.path,
    }));
  }

  /**
   * Generate footer content
   */
  private generateFooter(): FooterContent {
    return {
      columns: [
        {
          title: 'Product',
          links: [
            { label: 'Features', href: '#features' },
            { label: 'Pricing', href: '#pricing' },
            { label: 'Changelog', href: '#' },
            { label: 'Roadmap', href: '#' },
          ],
        },
        {
          title: 'Company',
          links: [
            { label: 'About', href: '#' },
            { label: 'Blog', href: '#' },
            { label: 'Careers', href: '#' },
            { label: 'Contact', href: '#' },
          ],
        },
        {
          title: 'Resources',
          links: [
            { label: 'Documentation', href: '#' },
            { label: 'Help Center', href: '#' },
            { label: 'API', href: '#' },
            { label: 'Status', href: '#' },
          ],
        },
        {
          title: 'Legal',
          links: [
            { label: 'Privacy', href: '#' },
            { label: 'Terms', href: '#' },
            { label: 'Security', href: '#' },
            { label: 'Cookies', href: '#' },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} ${this.spec.name}. All rights reserved.`,
    };
  }

  /**
   * Get default title for a section type
   */
  private getDefaultTitle(type: string): string {
    const titles: Record<string, string> = {
      hero: 'Welcome to ' + this.spec.name,
      features: 'Features',
      pricing: 'Pricing',
      cta: 'Ready to get started?',
      testimonials: 'What Our Users Say',
      stats: 'Our Impact',
    };
    return titles[type] || '';
  }

  /**
   * Get default subtitle for a section type
   */
  private getDefaultSubtitle(type: string): string {
    const subtitles: Record<string, string> = {
      hero: this.spec.description,
      features: 'Everything you need to succeed',
      pricing: 'Choose the plan that works for you',
      cta: 'Join thousands of users already using our platform',
      testimonials: 'Trusted by teams worldwide',
      stats: 'Numbers that speak for themselves',
    };
    return subtitles[type] || '';
  }

  /**
   * Get features list
   */
  private getFeaturesList(count: number): ContentItem[] {
    const allFeatures: ContentItem[] = [
      { icon: '⚡', title: 'Lightning Fast', description: 'Optimized for speed with sub-second load times' },
      { icon: '🔒', title: 'Enterprise Security', description: 'Bank-grade encryption and security controls' },
      { icon: '📱', title: 'Mobile First', description: 'Perfect experience on every device' },
      { icon: '🔄', title: 'Auto Updates', description: 'Always stay current with zero downtime' },
      { icon: '📊', title: 'Deep Analytics', description: 'Comprehensive insights into your data' },
      { icon: '🤝', title: 'Team Collaboration', description: 'Work together seamlessly in real-time' },
      { icon: '🎨', title: 'Customizable', description: 'Tailor everything to match your brand' },
      { icon: '🔌', title: 'Integrations', description: 'Connect with your favorite tools' },
    ];
    return allFeatures.slice(0, count);
  }

  /**
   * Get pricing tiers
   */
  private getPricingTiers(count: number): ContentItem[] {
    const allTiers: ContentItem[] = [
      { title: 'Starter - $9/mo', description: 'Perfect for individuals and small projects. Includes 1 project, 1GB storage, basic support.' },
      { title: 'Pro - $29/mo', description: 'For growing teams. Unlimited projects, 100GB storage, priority support, team collaboration.' },
      { title: 'Enterprise - $99/mo', description: 'For large organizations. Unlimited everything, dedicated support, custom integrations, SSO.' },
    ];
    return allTiers.slice(0, count);
  }
}

export function generateContent(spec: ProjectSpec): GeneratedContent {
  const generator = new ContentGenerator(spec);
  return generator.generate();
}

export default ContentGenerator;
