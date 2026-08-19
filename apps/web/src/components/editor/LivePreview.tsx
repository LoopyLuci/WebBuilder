'use client';

import React, { useMemo } from 'react';
import { useEditorContext } from '@/editor';

// ─── Live Preview Component ─────────────────────────────────────────────────

export function LivePreview() {
  const { state } = useEditorContext();

  const generatedCode = useMemo(() => {
    return generateReactCode(state.sections);
  }, [state.sections]);

  const html = useMemo(() => {
    return generatePreviewHTML(generatedCode);
  }, [generatedCode]);

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="h-10 border-b border-border flex items-center px-3 gap-2 shrink-0">
        <span className="text-xs font-medium text-muted-foreground">Live Preview</span>
        <div className="flex-1" />
        <span className="text-xs text-muted-foreground">{state.sections.length} sections</span>
      </div>
      <div className="flex-1 bg-muted/30 overflow-auto p-4">
        <iframe
          srcDoc={html}
          className="w-full h-full bg-background rounded-lg border border-border"
          title="Live Preview"
          sandbox="allow-scripts"
        />
      </div>
    </div>
  );
}

// ─── Code Generation ────────────────────────────────────────────────────────

function generateReactCode(sections: any[]): string {
  const imports = new Set<string>();
  const componentCode: string[] = [];

  for (const section of sections) {
    const { component, props } = section;
    
    if (component === 'hero') {
      imports.add('Hero');
      componentCode.push(`      <HeroSection
        title="${props.title || 'Welcome'}"
        subtitle="${props.subtitle || ''}"
        ctaText="${props.ctaText || ''}"
        ctaLink="${props.ctaLink || '#'}"
      />`);
    } else if (component === 'features') {
      imports.add('Features');
      componentCode.push(`      <FeaturesSection features={[
        { icon: '⚡', title: 'Fast', description: 'Lightning-fast performance' },
        { icon: '🔒', title: 'Secure', description: 'Enterprise-grade security' },
        { icon: '📱', title: 'Mobile', description: 'Optimized for all devices' },
      ]} />`);
    } else if (component === 'pricing') {
      imports.add('Pricing');
      componentCode.push(`      <PricingSection tiers={[
        { name: 'Starter', price: '$0', period: 'forever', features: ['1 project', 'Basic support'] },
        { name: 'Pro', price: '$29', period: 'month', features: ['Unlimited projects', 'Priority support'], highlighted: true },
      ]} />`);
    } else if (component === 'cta') {
      imports.add('CTA');
      componentCode.push(`      <CTASection
        title="${props.title || 'Ready to Get Started?'}"
        description="${props.description || ''}"
        buttonText="${props.buttonText || 'Get Started'}"
      />`);
    } else if (component === 'stats') {
      imports.add('Stats');
      componentCode.push(`      <StatsSection stats={[
        { value: '10K+', label: 'Users' },
        { value: '99.9%', label: 'Uptime' },
        { value: '24/7', label: 'Support' },
      ]} />`);
    } else if (component === 'testimonials') {
      imports.add('Testimonials');
      componentCode.push(`      <TestimonialsSection testimonials={[
        { quote: 'Amazing product!', author: 'Jane Doe', role: 'CEO', company: 'Acme' },
        { quote: 'Changed our workflow.', author: 'John Smith', role: 'CTO', company: 'TechCorp' },
      ]} />`);
    } else if (component === 'footer') {
      imports.add('Footer');
      componentCode.push(`      <FooterSection />`);
    } else if (component === 'navbar') {
      imports.add('Navbar');
      componentCode.push(`      <NavbarSection links={[
        { label: 'Home', href: '/' },
        { label: 'Features', href: '#features' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Contact', href: '#contact' },
      ]} />`);
    }
  }

  if (componentCode.length === 0) {
    return `<div style="padding: 40px; text-align: center; color: #666;">
  <h2>Empty Page</h2>
  <p>Add components to see your page come to life!</p>
</div>`;
  }

  return `<div style="font-family: system-ui, -apple-system, sans-serif;">
${componentCode.join('\n')}
</div>`;
}

function generatePreviewHTML(code: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; }
    .section { padding: 60px 20px; }
    .container { max-width: 1200px; margin: 0 auto; }
    .text-center { text-align: center; }
    .gradient { background: linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%); }
    h1 { font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem; }
    h2 { font-size: 1.8rem; font-weight: 600; margin-bottom: 1rem; }
    p { color: #6b7280; margin-bottom: 1.5rem; }
    .btn { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; border-radius: 8px; text-decoration: none; font-weight: 600; }
    .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; margin-top: 32px; }
    .feature-card { padding: 24px; border-radius: 12px; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-top: 32px; }
    .pricing-card { padding: 32px; border-radius: 12px; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .pricing-card.highlighted { border: 2px solid #2563eb; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 24px; }
    .stat { text-align: center; }
    .stat-value { font-size: 2rem; font-weight: 700; color: #2563eb; }
    .stat-label { color: #6b7280; }
  </style>
</head>
<body>
  ${code}
</body>
</html>`;
}

export default LivePreview;
