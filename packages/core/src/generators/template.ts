// ============================================================================
// Template Generator
// Procedural generation of complete page/site templates
// ============================================================================

import { PRNG } from './prng.js';
import { generatePalette, ColorPalette } from './color.js';
import { generateTypeScale, TypographySystem } from './typography.js';
import { generateLayout, GeneratedLayout } from './layout.js';
import { generateComponent, GeneratedComponent } from './component.js';

export interface GeneratedTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  seed: string;
  color: ColorPalette;
  typography: TypographySystem;
  layout: GeneratedLayout;
  components: GeneratedComponent[];
  pages: TemplatePage[];
  metadata: TemplateMetadata;
}

export type TemplateCategory =
  | 'landing-page'
  | 'portfolio'
  | 'blog'
  | 'ecommerce'
  | 'saas'
  | 'documentation'
  | 'dashboard'
  | 'personal'
  | 'agency'
  | 'restaurant';

export interface TemplatePage {
  id: string;
  name: string;
  path: string;
  sections: TemplateSection[];
}

export interface TemplateSection {
  id: string;
  type: string;
  component: string;
  props: Record<string, unknown>;
}

export interface TemplateMetadata {
  industry: string;
  style: string;
  features: string[];
  createdAt: string;
}

export interface TemplateOptions {
  category?: TemplateCategory;
  style?: 'modern' | 'classic' | 'minimal' | 'bold' | 'playful';
  pages?: string[];
  includeAuth?: boolean;
  includePricing?: boolean;
  includeBlog?: boolean;
  includeTestimonials?: boolean;
}

// Template presets for different categories
const TEMPLATE_PRESETS: Record<TemplateCategory, {
  sections: string[];
  pages: string[];
  style: string;
  features: string[];
}> = {
  'landing-page': {
    sections: ['hero', 'features', 'stats', 'testimonials', 'pricing', 'faq', 'cta', 'footer'],
    pages: ['Home'],
    style: 'modern',
    features: ['Hero section', 'Feature showcase', 'Pricing table', 'FAQ', 'CTA'],
  },
  'portfolio': {
    sections: ['hero', 'gallery', 'content', 'form', 'footer'],
    pages: ['Home', 'Work', 'About', 'Contact'],
    style: 'minimal',
    features: ['Gallery', 'Project showcase', 'Contact form'],
  },
  'blog': {
    sections: ['header', 'content', 'sidebar', 'footer'],
    pages: ['Home', 'Blog', 'About', 'Contact'],
    style: 'classic',
    features: ['Article layout', 'Sidebar', 'Categories', 'Search'],
  },
  'ecommerce': {
    sections: ['header', 'hero', 'features', 'gallery', 'testimonials', 'cta', 'footer'],
    pages: ['Home', 'Products', 'Cart', 'Checkout', 'Account'],
    style: 'modern',
    features: ['Product grid', 'Shopping cart', 'Checkout', 'Account'],
  },
  'saas': {
    sections: ['hero', 'features', 'stats', 'testimonials', 'pricing', 'faq', 'cta', 'footer'],
    pages: ['Home', 'Features', 'Pricing', 'Docs', 'Blog'],
    style: 'modern',
    features: ['Feature showcase', 'Pricing', 'Documentation', 'Blog'],
  },
  'documentation': {
    sections: ['header', 'sidebar', 'content', 'footer'],
    pages: ['Home', 'Docs', 'API', 'Guides'],
    style: 'minimal',
    features: ['Sidebar navigation', 'Code blocks', 'Search', 'Versioning'],
  },
  'dashboard': {
    sections: ['header', 'sidebar', 'content', 'footer'],
    pages: ['Dashboard', 'Analytics', 'Settings'],
    style: 'modern',
    features: ['Sidebar', 'Data tables', 'Charts', 'Filters'],
  },
  'personal': {
    sections: ['hero', 'content', 'gallery', 'form', 'footer'],
    pages: ['Home', 'About', 'Work', 'Blog', 'Contact'],
    style: 'playful',
    features: ['About section', 'Blog', 'Portfolio', 'Contact'],
  },
  'agency': {
    sections: ['hero', 'features', 'gallery', 'stats', 'testimonials', 'cta', 'footer'],
    pages: ['Home', 'Services', 'Work', 'Team', 'Contact'],
    style: 'bold',
    features: ['Services', 'Portfolio', 'Team', 'Testimonials'],
  },
  'restaurant': {
    sections: ['hero', 'content', 'gallery', 'form', 'footer'],
    pages: ['Home', 'Menu', 'Reservations', 'About'],
    style: 'classic',
    features: ['Menu', 'Reservations', 'Gallery', 'Location'],
  },
};

/**
 * Generate a complete template with all systems
 */
export function generateTemplate(seed: string, options: TemplateOptions = {}): GeneratedTemplate {
  const {
    category = 'landing-page',
    style = 'modern',
    pages,
    includeAuth = false,
    includePricing = true,
    includeBlog = false,
    includeTestimonials = true,
  } = options;

  const prng = new PRNG(seed);
  const preset = TEMPLATE_PRESETS[category] || TEMPLATE_PRESETS['landing-page'];
  const templatePages = pages || preset.pages;

  // Generate color palette
  const color = generatePalette(seed, {
    harmony: getHarmonyForCategory(category),
    count: 5,
    fullShades: true,
  });

  // Generate typography
  const typography = generateTypeScale(seed, {
    fontCategory: getFontCategoryForStyle(style),
    ratio: getRatioForStyle(style),
    baseSize: 16,
  });

  // Generate layout
  const layout = generateLayout(seed, {
    style: category === 'dashboard' ? 'dashboard' : 'centered',
    algorithm: 'rule-based',
    sectionCount: preset.sections.length,
    includeHeader: true,
    includeFooter: true,
    density: 'normal',
  });

  // Generate components
  const componentTypes = ['button', 'card', 'input', 'badge', 'alert'];
  const components = componentTypes.map((type, i) => {
    const compSeed = prng.fork(`component-${i}`);
    return generateComponent(compSeed.getState().toString(), {
      componentType: type as any,
      variantCount: 4,
      complexity: 'standard',
    });
  });

  // Generate pages
  const templatePagesData: TemplatePage[] = templatePages.map((pageName, pageIndex) => {
    const pageSections = preset.sections.map((sectionType, sectionIndex) => ({
      id: `${pageName.toLowerCase()}-${sectionIndex}`,
      type: sectionType,
      component: sectionType,
      props: generateSectionProps(sectionType, prng),
    }));

    return {
      id: `page-${pageIndex}`,
      name: pageName,
      path: pageName === 'Home' ? '/' : `/${pageName.toLowerCase()}`,
      sections: pageSections,
    };
  });

  return {
    id: `${category}-${prng.int(1000, 9999)}`,
    name: generateTemplateName(category, style, seed),
    description: `A ${style} ${category} template with ${preset.features.length} key features`,
    category,
    seed,
    color,
    typography,
    layout,
    components,
    pages: templatePagesData,
    metadata: {
      industry: category,
      style,
      features: preset.features,
      createdAt: new Date().toISOString(),
    },
  };
}

/**
 * Generate section-specific props
 */
function generateSectionProps(sectionType: string, prng: PRNG): Record<string, unknown> {
  switch (sectionType) {
    case 'hero':
      return {
        title: 'Your Amazing Headline',
        subtitle: 'A compelling description of your product or service.',
        ctaText: 'Get Started',
        ctaLink: '#',
      };
    case 'features':
      return {
        title: 'Why Choose Us',
        subtitle: 'Everything you need to succeed',
        columns: 3,
        features: Array.from({ length: 6 }, (_, i) => ({
          title: `Feature ${i + 1}`,
          description: `Description for feature ${i + 1}`,
          icon: ['⚡', '🔒', '🤝', '📊', '⚙️', '💬'][i],
        })),
      };
    case 'stats':
      return {
        stats: [
          { value: '10K+', label: 'Users' },
          { value: '99.9%', label: 'Uptime' },
          { value: '40%', label: 'Growth' },
        ],
      };
    case 'cta':
      return {
        title: 'Ready to Get Started?',
        description: 'Join thousands of satisfied customers.',
        buttonText: 'Start Now',
      };
    case 'testimonials':
      return {
        title: 'What People Say',
        testimonials: Array.from({ length: 3 }, (_, i) => ({
          quote: `Testimonial ${i + 1} quote goes here.`,
          author: `Author ${i + 1}`,
          company: `Company ${i + 1}`,
        })),
      };
    case 'pricing':
      return {
        title: 'Simple Pricing',
        tiers: [
          { name: 'Starter', price: '$0', period: 'forever' },
          { name: 'Pro', price: '$29', period: 'month', highlighted: true },
          { name: 'Enterprise', price: 'Custom', period: 'month' },
        ],
      };
    case 'faq':
      return {
        title: 'Frequently Asked Questions',
        items: Array.from({ length: 5 }, (_, i) => ({
          question: `Question ${i + 1}?`,
          answer: `Answer to question ${i + 1}.`,
        })),
      };
    default:
      return {};
  }
}

/**
 * Get harmony rule based on category
 */
function getHarmonyForCategory(category: TemplateCategory): 'triadic' | 'complementary' | 'analogous' | 'split-complementary' | 'tetradic' | 'monochromatic' {
  switch (category) {
    case 'landing-page': return 'triadic';
    case 'portfolio': return 'analogous';
    case 'blog': return 'monochromatic';
    case 'ecommerce': return 'complementary';
    case 'saas': return 'triadic';
    case 'documentation': return 'monochromatic';
    case 'dashboard': return 'analogous';
    case 'personal': return 'split-complementary';
    case 'agency': return 'tetradic';
    case 'restaurant': return 'analogous';
    default: return 'triadic';
  }
}

/**
 * Get font category for style
 */
function getFontCategoryForStyle(style: string): 'modern' | 'classic' | 'playful' | 'technical' | 'elegant' {
  switch (style) {
    case 'modern': return 'modern';
    case 'classic': return 'classic';
    case 'minimal': return 'modern';
    case 'bold': return 'technical';
    case 'playful': return 'playful';
    default: return 'modern';
  }
}

/**
 * Get ratio for style
 */
function getRatioForStyle(style: string): number {
  switch (style) {
    case 'minimal': return 1.2;
    case 'bold': return 1.5;
    case 'playful': return 1.333;
    default: return 1.25;
  }
}

/**
 * Generate a unique template name
 */
function generateTemplateName(category: string, style: string, seed: string): string {
  const adjectives = ['Modern', 'Clean', 'Bold', 'Elegant', 'Dynamic', 'Fresh', 'Sleek', 'Vibrant'];
  const prng = new PRNG(seed + '-name');
  const adj = prng.pick(adjectives);
  const categoryName = category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return `${adj} ${categoryName}`;
}

/**
 * Generate multiple template variations
 */
export function generateTemplateVariations(
  baseSeed: string,
  category: TemplateCategory,
  count = 3
): GeneratedTemplate[] {
  const prng = new PRNG(baseSeed);
  const variations: GeneratedTemplate[] = [];

  for (let i = 0; i < count; i++) {
    const seed = prng.fork(`variation-${i}`).getState().toString();
    variations.push(generateTemplate(seed, { category }));
  }

  return variations;
}

/**
 * Generate a specific page template
 */
export function generatePageTemplate(
  seed: string,
  pageType: 'home' | 'about' | 'contact' | 'blog' | 'pricing' | 'features'
): TemplatePage {
  const prng = new PRNG(seed);

  const pageConfigs: Record<string, { name: string; sections: string[] }> = {
    home: { name: 'Home', sections: ['hero', 'features', 'stats', 'testimonials', 'cta'] },
    about: { name: 'About', sections: ['hero', 'content', 'gallery', 'stats'] },
    contact: { name: 'Contact', sections: ['hero', 'form', 'content'] },
    blog: { name: 'Blog', sections: ['header', 'content', 'sidebar', 'footer'] },
    pricing: { name: 'Pricing', sections: ['hero', 'pricing', 'faq', 'cta'] },
    features: { name: 'Features', sections: ['hero', 'features', 'stats', 'cta'] },
  };

  const config = pageConfigs[pageType] || pageConfigs.home;

  return {
    id: `page-${pageType}`,
    name: config.name,
    path: pageType === 'home' ? '/' : `/${pageType}`,
    sections: config.sections.map((sectionType, index) => ({
      id: `${pageType}-${index}`,
      type: sectionType,
      component: sectionType,
      props: generateSectionProps(sectionType, prng),
    })),
  };
}