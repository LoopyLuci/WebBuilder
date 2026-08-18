// ============================================================================
// WebBuilder Components — Main Entry Point
// Universal component library for all frameworks
// ============================================================================

export { ComponentLibrary } from './library.js';

export { default as HeroSection } from './composite/hero.js';
export { default as FeaturesSection } from './composite/features.js';
export { default as PricingSection } from './composite/pricing.js';
export { default as TestimonialsSection } from './composite/testimonials.js';
export { default as CTASection } from './composite/cta.js';

export { default as Button } from './atomic/button.js';
export { default as Input } from './atomic/input.js';
export { default as Card } from './atomic/card.js';
export { default as Badge } from './atomic/badge.js';
export { default as Avatar } from './atomic/avatar.js';

export { default as Navbar } from './patterns/navbar.js';
export { default as Footer } from './patterns/footer.js';
export { default as Sidebar } from './patterns/sidebar.js';

export { default as LandingPage } from './templates/landing.js';
export { default as DashboardLayout } from './templates/dashboard.js';

import { ComponentLibrary } from './library.js';

export function createComponentLibrary(): ComponentLibrary {
  return new ComponentLibrary();
}

export default {
  ComponentLibrary,
  createComponentLibrary,
};
