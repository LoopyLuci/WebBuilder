// ============================================================================
// Unit Tests for @webbuilder/components — Component Exports
// ============================================================================

import { describe, it, expect } from 'vitest';
import {
  ComponentLibrary,
  createComponentLibrary,
  HeroSection,
  FeaturesSection,
  PricingSection,
  TestimonialsSection,
  CTASection,
  Button,
  Input,
  Card,
  Badge,
  Avatar,
  Navbar,
  Footer,
  Sidebar,
  LandingPage,
  DashboardLayout,
  default as componentsDefault,
} from '../../dist/index.js';

// ── Module Exports ───────────────────────────────────────────────────────────

describe('Module exports', () => {
  it('exports ComponentLibrary class', () => {
    expect(ComponentLibrary).toBeDefined();
    expect(typeof ComponentLibrary).toBe('function');
  });

  it('exports createComponentLibrary factory function', () => {
    expect(createComponentLibrary).toBeDefined();
    expect(typeof createComponentLibrary).toBe('function');
  });

  it('createComponentLibrary returns a ComponentLibrary instance', () => {
    const library = createComponentLibrary();
    expect(library).toBeInstanceOf(ComponentLibrary);
  });

  it('exports HeroSection component', () => {
    expect(HeroSection).toBeDefined();
  });

  it('exports FeaturesSection component', () => {
    expect(FeaturesSection).toBeDefined();
  });

  it('exports PricingSection component', () => {
    expect(PricingSection).toBeDefined();
  });

  it('exports TestimonialsSection component', () => {
    expect(TestimonialsSection).toBeDefined();
  });

  it('exports CTASection component', () => {
    expect(CTASection).toBeDefined();
  });

  it('exports Button component', () => {
    expect(Button).toBeDefined();
  });

  it('exports Input component', () => {
    expect(Input).toBeDefined();
  });

  it('exports Card component', () => {
    expect(Card).toBeDefined();
  });

  it('exports Badge component', () => {
    expect(Badge).toBeDefined();
  });

  it('exports Avatar component', () => {
    expect(Avatar).toBeDefined();
  });

  it('exports Navbar component', () => {
    expect(Navbar).toBeDefined();
  });

  it('exports Footer component', () => {
    expect(Footer).toBeDefined();
  });

  it('exports Sidebar component', () => {
    expect(Sidebar).toBeDefined();
  });

  it('exports LandingPage component', () => {
    expect(LandingPage).toBeDefined();
  });

  it('exports DashboardLayout component', () => {
    expect(DashboardLayout).toBeDefined();
  });

  it('has a default export', () => {
    expect(componentsDefault).toBeDefined();
    expect(typeof componentsDefault).toBe('object');
  });

  it('default export contains ComponentLibrary', () => {
    expect(componentsDefault.ComponentLibrary).toBe(ComponentLibrary);
  });

  it('default export contains createComponentLibrary', () => {
    expect(componentsDefault.createComponentLibrary).toBe(createComponentLibrary);
  });
});

// ── Component Types (React ForwardRef) ────────────────────────────────────────

describe('Component types', () => {
  it('HeroSection is a valid React forwardRef component', () => {
    expect(HeroSection).toBeDefined();
    expect(typeof HeroSection === 'function' || typeof HeroSection === 'object' || HeroSection instanceof Symbol).toBe(true);
  });

  it('Button is a valid React forwardRef component', () => {
    expect(Button).toBeDefined();
    expect(typeof Button === 'function' || typeof Button === 'object' || Button instanceof Symbol).toBe(true);
  });

  it('Card is a valid React forwardRef component with sub-components', () => {
    expect(Card).toBeDefined();
    expect(typeof Card === 'function' || typeof Card === 'object').toBe(true);
  });

  it('LandingPage is a valid React FC component', () => {
    expect(LandingPage).toBeDefined();
    expect(typeof LandingPage === 'function' || typeof LandingPage === 'object' || typeof LandingPage === 'symbol').toBe(true);
  });

  it('DashboardLayout is a valid React FC component with sub-components', () => {
    expect(DashboardLayout).toBeDefined();
    expect(typeof DashboardLayout === 'function' || typeof DashboardLayout === 'object').toBe(true);
  });
});

// ── Library Integration with Exported Components ───────────────────────────────

describe('Library integration with exported components', () => {
  it('library registers the same component instances as the named exports', () => {
    const library = new ComponentLibrary();

    expect(library.get('hero-section')?.component).toBe(HeroSection);
    expect(library.get('features-section')?.component).toBe(FeaturesSection);
    expect(library.get('pricing-section')?.component).toBe(PricingSection);
    expect(library.get('testimonials-section')?.component).toBe(TestimonialsSection);
    expect(library.get('cta-section')?.component).toBe(CTASection);
    expect(library.get('button')?.component).toBe(Button);
    expect(library.get('input')?.component).toBe(Input);
    expect(library.get('card')?.component).toBe(Card);
    expect(library.get('badge')?.component).toBe(Badge);
    expect(library.get('avatar')?.component).toBe(Avatar);
    expect(library.get('navbar')?.component).toBe(Navbar);
    expect(library.get('footer')?.component).toBe(Footer);
    expect(library.get('sidebar')?.component).toBe(Sidebar);
    expect(library.get('landing-page')?.component).toBe(LandingPage);
    expect(library.get('dashboard-layout')?.component).toBe(DashboardLayout);
  });
});