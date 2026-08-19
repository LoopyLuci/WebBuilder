import type { ProjectSpec } from '../types/index.js';
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
    cta?: {
        text: string;
        link: string;
        variant?: string;
    };
    secondaryCta?: {
        text: string;
        link: string;
    };
    features?: FeatureItem[];
    pricing?: PricingTier[];
    testimonials?: TestimonialItem[];
    stats?: StatItem[];
    faq?: FaqItem[];
    form?: FormField[];
    image?: {
        src: string;
        alt: string;
    };
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
    columns: {
        title: string;
        links: {
            label: string;
            href: string;
        }[];
    }[];
    social?: {
        platform: string;
        href: string;
    }[];
    copyright: string;
}
export interface SiteMetadata {
    title: string;
    description: string;
    keywords: string[];
    ogImage?: string;
}
export declare class ContentGenerator {
    private spec;
    private industry;
    constructor(spec: ProjectSpec);
    private detectIndustry;
    generate(): GeneratedContent;
    private generatePageContent;
    private generateSectionContent;
    private generatePricingTiers;
    private generateFaq;
    private generateNavigation;
    private generateFooter;
    private generateMetadata;
    private pickRandom;
}
export declare function generateContent(spec: ProjectSpec): GeneratedContent;
export default ContentGenerator;
//# sourceMappingURL=content.d.ts.map