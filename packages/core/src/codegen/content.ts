// ============================================================================
// Content Generator — Context-Aware Professional Copy
// Produces realistic, industry-specific content for any project
// ============================================================================

import type { ProjectSpec, Page, Section } from '../types/index.js';

export interface GeneratedContent {
  pages: Record<string, PageContent>;
  navigation: NavItem[];
  footer: FooterContent;
  metadata: SiteMetadata;
}

export interface PageContent {
  title: string;
  sections: SectionContent[];
}

export interface SectionContent {
  id: string;
  title?: string;
  subtitle?: string;
  description?: string;
  items?: ContentItem[];
  cta?: { text: string; link: string; variant?: string };
  secondaryCta?: { text: string; link: string };
  features?: FeatureItem[];
  pricing?: PricingTier[];
  testimonials?: TestimonialItem[];
  stats?: StatItem[];
  faq?: FaqItem[];
  form?: FormField[];
  image?: { src: string; alt: string };
}

export interface ContentItem {
  title: string;
  description: string;
  icon?: string;
}

export interface FeatureItem {
  title: string;
  description: string;
  icon?: string;
  badge?: string;
}

export interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

export interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar?: string;
  rating?: number;
}

export interface StatItem {
  value: string;
  label: string;
  description?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'textarea' | 'select' | 'checkbox' | 'tel' | 'url';
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

export interface NavItem {
  label: string;
  href: string;
}

export interface FooterContent {
  columns: { title: string; links: { label: string; href: string }[] }[];
  social?: { platform: string; href: string }[];
  copyright: string;
}

export interface SiteMetadata {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
}

// ─── Industry Content Databases ────────────────────────────────────────────

const industryContent: Record<string, {
  headlines: string[];
  subtitles: string[];
  features: FeatureItem[];
  testimonials: TestimonialItem[];
  stats: StatItem[];
}> = {
  saas: {
    headlines: [
      'Work smarter, not harder',
      'The platform teams actually enjoy using',
      'Everything you need in one place',
      'Built for teams that move fast',
    ],
    subtitles: [
      'Streamline your workflow, collaborate effortlessly, and ship faster with our all-in-one platform.',
      'Join thousands of teams who have transformed how they work every day.',
      'Replace scattered tools with a single platform your team will love.',
    ],
    features: [
      { title: 'Lightning Fast', description: 'Sub-second load times and instant updates keep your team in flow.', icon: '⚡' },
      { title: 'Enterprise Security', description: 'SOC 2 compliant with end-to-end encryption and SSO.', icon: '🔒' },
      { title: 'Team Collaboration', description: 'Real-time editing, comments, and smart notifications.', icon: '🤝' },
      { title: 'Deep Analytics', description: 'Understand your data with powerful dashboards and reports.', icon: '📊' },
      { title: 'Powerful Automations', description: 'Set up workflows in minutes, not hours. No code required.', icon: '⚙️' },
      { title: '24/7 Support', description: 'Our team is always here to help — average response time under 2 hours.', icon: '💬' },
    ],
    testimonials: [
      { quote: "This replaced 5 different tools for us. Our team's productivity jumped 40% in the first month.", author: 'Sarah Chen', role: 'VP of Engineering', company: 'Streamline' },
      { quote: "The best investment we've made. Customer onboarding time dropped from days to hours.", author: 'Marcus Rodriguez', role: 'Head of Customer Success', company: 'Basecamp' },
      { quote: "I was skeptical at first, but within a week I wondered how we ever worked without it.", author: 'Emily Watson', role: 'Product Manager', company: 'Figma' },
    ],
    stats: [
      { value: '10K+', label: 'Teams', description: 'trust our platform daily' },
      { value: '99.99%', label: 'Uptime', description: 'guaranteed by SLA' },
      { value: '40%', label: 'Productivity', description: 'average improvement' },
      { value: '2min', label: 'Response', description: 'average support time' },
    ],
  },
  ecommerce: {
    headlines: [
      'Shop the latest trends',
      'Quality meets convenience',
      'Your new favorite store',
      'Discover something amazing',
    ],
    subtitles: [
      'Browse thousands of curated products with fast shipping and hassle-free returns.',
      'We believe shopping should be delightful — from discovery to delivery.',
    ],
    features: [
      { title: 'Free Shipping', description: 'On all orders over $50. Fast, reliable delivery to your door.', icon: '📦' },
      { title: 'Easy Returns', description: '30-day hassle-free returns. No questions asked.', icon: '🔄' },
      { title: 'Secure Checkout', description: 'Your payment info is always protected with bank-grade encryption.', icon: '🔒' },
      { title: '24/7 Support', description: 'Real humans ready to help, any time of day.', icon: '💬' },
    ],
    testimonials: [
      { quote: "Fast shipping and beautiful packaging. Every order feels like a gift!", author: 'Jessica Park', role: 'Verified Buyer', company: '' },
      { quote: "Best customer service I've experienced. They really care about their customers.", author: 'David Kim', role: 'Verified Buyer', company: '' },
    ],
    stats: [
      { value: '50K+', label: 'Products', description: 'and counting' },
      { value: '1M+', label: 'Customers', description: 'trust us worldwide' },
      { value: '4.9', label: 'Rating', description: 'average customer review' },
      { value: '2-Day', label: 'Shipping', description: 'on most orders' },
    ],
  },
  portfolio: {
    headlines: [
      'Crafting digital experiences',
      'Design that speaks',
      'Ideas brought to life',
      'Creative work, delivered',
    ],
    subtitles: [
      'I help brands stand out with thoughtful design and meticulous attention to detail.',
      'Specializing in digital products that look stunning and work flawlessly.',
    ],
    features: [
      { title: 'Brand Identity', description: 'Logos, color systems, and visual languages that capture your essence.', icon: '🎨' },
      { title: 'Web Design', description: 'Beautiful, responsive websites that convert visitors into customers.', icon: '💻' },
      { title: 'UI/UX Design', description: 'Intuitive interfaces backed by research and real user testing.', icon: '✨' },
      { title: 'Motion Design', description: 'Animations and micro-interactions that bring your product to life.', icon: '🎬' },
    ],
    testimonials: [
      { quote: "The best designer I've ever worked with. Incredible attention to detail and always delivers on time.", author: 'Alex Thompson', role: 'CEO', company: 'StartupXYZ' },
      { quote: "Transformed our brand completely. The results exceeded all expectations.", author: 'Maria Garcia', role: 'Marketing Director', company: 'TechCorp' },
    ],
    stats: [
      { value: '150+', label: 'Projects', description: 'completed successfully' },
      { value: '50+', label: 'Clients', description: 'across 15 countries' },
      { value: '5+', label: 'Years', description: 'of experience' },
      { value: '100%', label: 'Satisfaction', description: 'client satisfaction rate' },
    ],
  },
  blog: {
    headlines: [
      'Stories that matter',
      'Insights & inspiration',
      'Welcome to the blog',
      'Fresh perspectives',
    ],
    subtitles: [
      'Deep dives into design, technology, and the future of digital creation.',
      'Weekly articles to help you think differently about your work.',
    ],
    features: [
      { title: 'Weekly Articles', description: 'Fresh content every Tuesday and Thursday.', icon: '📝' },
      { title: 'Expert Contributors', description: 'Insights from industry leaders and practitioners.', icon: '✍️' },
      { title: 'Practical Guides', description: 'Actionable tutorials you can apply immediately.', icon: '📚' },
      { title: 'Community', description: 'Join 10,000+ readers in our discussion forums.', icon: '👥' },
    ],
    testimonials: [],
    stats: [
      { value: '500+', label: 'Articles', description: 'published' },
      { value: '10K+', label: 'Readers', description: 'monthly' },
      { value: '50+', label: 'Contributors', description: 'expert writers' },
    ],
  },
  default: {
    headlines: [
      'Welcome to Our Platform',
      'Built for the Modern Era',
      'Your Success, Our Mission',
      'Innovation Starts Here',
    ],
    subtitles: [
      'We provide the tools and solutions you need to succeed in a rapidly evolving world.',
      'Join thousands of satisfied customers who trust our platform.',
    ],
    features: [
      { title: 'Easy to Use', description: 'Intuitive interface designed for productivity.', icon: '✨' },
      { title: 'Secure', description: 'Enterprise-grade security for your peace of mind.', icon: '🔒' },
      { title: 'Fast', description: 'Optimized performance that never slows you down.', icon: '⚡' },
      { title: 'Reliable', description: '99.9% uptime you can count on, day after day.', icon: '🛡️' },
    ],
    testimonials: [
      { quote: "This platform has genuinely changed how we work. Highly recommend!", author: 'Jordan Lee', role: 'Director', company: 'Acme Corp' },
      { quote: "Best in class solution. The support team is incredible.", author: 'Casey Morgan', role: 'CTO', company: 'TechFlow' },
    ],
    stats: [
      { value: '10K+', label: 'Users', description: 'trust our platform' },
      { value: '99.9%', label: 'Uptime', description: 'guaranteed' },
      { value: '24/7', label: 'Support', description: 'always available' },
      { value: '4.9/5', label: 'Rating', description: 'from 2000+ reviews' },
    ],
  },
};

// ─── Content Generator ──────────────────────────────────────────────────────

export class ContentGenerator {
  private spec: ProjectSpec;
  private industry: string;

  constructor(spec: ProjectSpec) {
    this.spec = spec;
    this.industry = this.detectIndustry(spec);
  }

  private detectIndustry(spec: ProjectSpec): string {
    const text = `${spec.name} ${spec.description} ${spec.structure.pages.map(p => p.name).join(' ')}`.toLowerCase();
    if (text.includes('saas') || text.includes('platform') || text.includes('tool') || text.includes('dashboard')) return 'saas';
    if (text.includes('shop') || text.includes('store') || text.includes('ecommerce') || text.includes('e-commerce') || text.includes('sell')) return 'ecommerce';
    if (text.includes('portfolio') || text.includes('design') || text.includes('creative') || text.includes('agency')) return 'portfolio';
    if (text.includes('blog') || text.includes('article') || text.includes('content') || text.includes('news')) return 'blog';
    return 'default';
  }

  generate(): GeneratedContent {
    const content = industryContent[this.industry];
    const pages: Record<string, PageContent> = {};

    for (const page of this.spec.structure.pages) {
      pages[page.path] = this.generatePageContent(page);
    }

    return {
      pages,
      navigation: this.generateNavigation(),
      footer: this.generateFooter(),
      metadata: this.generateMetadata(),
    };
  }

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

  private generateSectionContent(section: Section): SectionContent {
    const componentType = section.component;
    const content = industryContent[this.industry];

    if (componentType.includes('hero')) {
      return {
        id: section.id,
        title: this.pickRandom(content.headlines),
        subtitle: this.pickRandom(content.subtitles),
        cta: { text: 'Get Started', link: '#signup', variant: 'primary' },
        secondaryCta: { text: 'Learn More', link: '#features' },
      };
    }

    if (componentType.includes('features')) {
      return {
        id: section.id,
        title: 'Why Choose Us',
        subtitle: 'Everything you need to succeed',
        features: content.features.slice(0, 6),
      };
    }

    if (componentType.includes('testimonials')) {
      return {
        id: section.id,
        title: 'What People Are Saying',
        subtitle: 'Don\'t just take our word for it',
        testimonials: content.testimonials,
      };
    }

    if (componentType.includes('stats')) {
      return {
        id: section.id,
        stats: content.stats,
      };
    }

    if (componentType.includes('pricing')) {
      return {
        id: section.id,
        title: 'Simple, Transparent Pricing',
        subtitle: 'Choose the plan that fits your needs. Upgrade or downgrade at any time.',
        pricing: this.generatePricingTiers(),
      };
    }

    if (componentType.includes('cta')) {
      return {
        id: section.id,
        title: 'Ready to Get Started?',
        description: 'Join thousands of satisfied customers today.',
        cta: { text: 'Start Free Trial', link: '#signup' },
      };
    }

    if (componentType.includes('faq')) {
      return {
        id: section.id,
        title: 'Frequently Asked Questions',
        faq: this.generateFaq(),
      };
    }

    if (componentType.includes('contact')) {
      return {
        id: section.id,
        title: 'Get in Touch',
        description: 'Have a question or want to work together? Drop us a line.',
        form: [
          { name: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe', required: true },
          { name: 'email', label: 'Email Address', type: 'email', placeholder: 'john@example.com', required: true },
          { name: 'company', label: 'Company', type: 'text', placeholder: 'Acme Inc' },
          { name: 'message', label: 'Message', type: 'textarea', placeholder: 'Tell us about your project...', required: true },
        ],
      };
    }

    return { id: section.id };
  }

  private generatePricingTiers(): PricingTier[] {
    return [
      {
        name: 'Starter',
        price: '$0',
        period: 'forever',
        description: 'Perfect for trying things out',
        features: ['1 project', 'Basic analytics', 'Community support', '1GB storage'],
        cta: 'Get Started Free',
      },
      {
        name: 'Pro',
        price: '$29',
        period: 'month',
        description: 'For growing teams and businesses',
        features: ['Unlimited projects', 'Advanced analytics', 'Priority support', '100GB storage', 'Custom domains', 'Team collaboration', 'API access'],
        highlighted: true,
        cta: 'Start Free Trial',
      },
      {
        name: 'Enterprise',
        price: 'Custom',
        period: 'month',
        description: 'For large organizations with specific needs',
        features: ['Everything in Pro', 'Dedicated support', 'Custom integrations', 'SLA guarantee', 'SSO/SAML', 'Audit logs', 'Custom contracts'],
        cta: 'Contact Sales',
      },
    ];
  }

  private generateFaq(): FaqItem[] {
    return [
      { question: 'Can I try before I buy?', answer: 'Absolutely! Our Starter plan is free forever. No credit card required.' },
      { question: 'Can I change plans later?', answer: 'Yes, you can upgrade or downgrade at any time. Changes take effect immediately.' },
      { question: 'What payment methods do you accept?', answer: 'We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.' },
      { question: 'Is my data secure?', answer: 'Yes. We use bank-grade encryption and are SOC 2 Type II certified. Your data is backed up daily.' },
      { question: 'Do you offer refunds?', answer: 'Yes, we offer a 30-day money-back guarantee on all paid plans. No questions asked.' },
    ];
  }

  private generateNavigation(): NavItem[] {
    const items: NavItem[] = [
      { label: 'Home', href: '/' },
    ];

    for (const page of this.spec.structure.pages) {
      if (page.path !== '/') {
        items.push({ label: page.title, href: page.path });
      }
    }

    items.push({ label: 'Contact', href: '#contact' });
    return items;
  }

  private generateFooter(): FooterContent {
    return {
      columns: [
        {
          title: 'Product',
          links: [
            { label: 'Features', href: '#features' },
            { label: 'Pricing', href: '#pricing' },
            { label: 'Changelog', href: '/changelog' },
            { label: 'Roadmap', href: '/roadmap' },
          ],
        },
        {
          title: 'Company',
          links: [
            { label: 'About', href: '/about' },
            { label: 'Blog', href: '/blog' },
            { label: 'Careers', href: '/careers' },
            { label: 'Press', href: '/press' },
          ],
        },
        {
          title: 'Resources',
          links: [
            { label: 'Documentation', href: '/docs' },
            { label: 'Help Center', href: '/help' },
            { label: 'API Reference', href: '/api-docs' },
            { label: 'Status', href: '/status' },
          ],
        },
        {
          title: 'Legal',
          links: [
            { label: 'Privacy', href: '/privacy' },
            { label: 'Terms', href: '/terms' },
            { label: 'Security', href: '/security' },
            { label: 'Cookies', href: '/cookies' },
          ],
        },
      ],
      social: [
        { platform: 'twitter', href: 'https://twitter.com/webbuilder' },
        { platform: 'github', href: 'https://github.com/webbuilder' },
        { platform: 'linkedin', href: 'https://linkedin.com/company/webbuilder' },
        { platform: 'discord', href: 'https://discord.gg/webbuilder' },
      ],
      copyright: `© ${new Date().getFullYear()} ${this.spec.name}. All rights reserved.`,
    };
  }

  private generateMetadata(): SiteMetadata {
    return {
      title: `${this.spec.name} - ${this.spec.description}`,
      description: this.spec.description,
      keywords: this.spec.structure.pages.map(p => p.name).join(', ').split(' '),
    };
  }

  private pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}

export function generateContent(spec: ProjectSpec): GeneratedContent {
  return new ContentGenerator(spec).generate();
}

export default ContentGenerator;
