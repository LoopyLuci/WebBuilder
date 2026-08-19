/**
 * WebBuilder Components - Landing Page Template
 * A complete landing page template combining hero, features, pricing, testimonials, CTA, navbar, and footer.
 */
import React from 'react';
export interface LandingPageProps {
    navbar?: React.ReactNode;
    hero?: React.ReactNode;
    features?: React.ReactNode;
    testimonials?: React.ReactNode;
    pricing?: React.ReactNode;
    cta?: React.ReactNode;
    footer?: React.ReactNode;
    children?: React.ReactNode;
    sections?: {
        type: 'hero' | 'features' | 'testimonials' | 'pricing' | 'cta' | 'custom';
        content: React.ReactNode;
        props?: Record<string, unknown>;
    }[];
}
export declare const LandingPage: React.FC<LandingPageProps>;
export default LandingPage;
//# sourceMappingURL=landing.d.ts.map