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

export const LandingPage: React.FC<LandingPageProps> = ({
  navbar,
  hero,
  features,
  testimonials,
  pricing,
  cta,
  footer,
  children,
  sections,
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      {navbar && <>{navbar}</>}
      <main className="flex-1">
        {sections ? (
          sections.map((section, index) => (
            <section key={index}>{section.content}</section>
          ))
        ) : (
          <>
            {hero}
            {features}
            {testimonials}
            {pricing}
            {cta}
          </>
        )}
        {children}
      </main>
      {footer && <>{footer}</>}
    </div>
  );
};

LandingPage.displayName = 'LandingPage';

export default LandingPage;