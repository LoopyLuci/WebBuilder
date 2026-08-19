// ============================================================================
// Component Library Manager
// ============================================================================
import { default as HeroSection } from './composite/hero.js';
import { default as FeaturesSection } from './composite/features.js';
import { default as PricingSection } from './composite/pricing.js';
import { default as TestimonialsSection } from './composite/testimonials.js';
import { default as CTASection } from './composite/cta.js';
import { default as Button } from './atomic/button.js';
import { default as Input } from './atomic/input.js';
import { default as Card } from './atomic/card.js';
import { default as Badge } from './atomic/badge.js';
import { default as Avatar } from './atomic/avatar.js';
import { default as Navbar } from './patterns/navbar.js';
import { default as Footer } from './patterns/footer.js';
import { default as Sidebar } from './patterns/sidebar.js';
import { default as LandingPage } from './templates/landing.js';
import { default as DashboardLayout } from './templates/dashboard.js';
export class ComponentLibrary {
    components;
    constructor() {
        this.components = new Map();
        this.registerDefaults();
    }
    registerDefaults() {
        this.register({ id: 'hero-section', name: 'HeroSection', category: 'composite', component: HeroSection, tags: ['hero', 'header', 'landing'] });
        this.register({ id: 'features-section', name: 'FeaturesSection', category: 'composite', component: FeaturesSection, tags: ['features', 'grid', 'showcase'] });
        this.register({ id: 'pricing-section', name: 'PricingSection', category: 'composite', component: PricingSection, tags: ['pricing', 'plans', 'subscription'] });
        this.register({ id: 'testimonials-section', name: 'TestimonialsSection', category: 'composite', component: TestimonialsSection, tags: ['testimonials', 'reviews', 'social-proof'] });
        this.register({ id: 'cta-section', name: 'CTASection', category: 'composite', component: CTASection, tags: ['cta', 'call-to-action', 'conversion'] });
        this.register({ id: 'button', name: 'Button', category: 'atomic', component: Button, tags: ['button', 'click', 'action'] });
        this.register({ id: 'input', name: 'Input', category: 'atomic', component: Input, tags: ['input', 'form', 'field'] });
        this.register({ id: 'card', name: 'Card', category: 'atomic', component: Card, tags: ['card', 'container', 'content'] });
        this.register({ id: 'badge', name: 'Badge', category: 'atomic', component: Badge, tags: ['badge', 'tag', 'label'] });
        this.register({ id: 'avatar', name: 'Avatar', category: 'atomic', component: Avatar, tags: ['avatar', 'image', 'user'] });
        this.register({ id: 'navbar', name: 'Navbar', category: 'patterns', component: Navbar, tags: ['navbar', 'navigation', 'header'] });
        this.register({ id: 'footer', name: 'Footer', category: 'patterns', component: Footer, tags: ['footer', 'bottom', 'links'] });
        this.register({ id: 'sidebar', name: 'Sidebar', category: 'patterns', component: Sidebar, tags: ['sidebar', 'navigation', 'side'] });
        this.register({ id: 'landing-page', name: 'LandingPage', category: 'templates', component: LandingPage, tags: ['landing', 'page', 'full'] });
        this.register({ id: 'dashboard-layout', name: 'DashboardLayout', category: 'templates', component: DashboardLayout, tags: ['dashboard', 'admin', 'app'] });
    }
    register(definition) {
        this.components.set(definition.id, definition);
    }
    unregister(id) {
        return this.components.delete(id);
    }
    get(id) {
        return this.components.get(id);
    }
    getByName(name) {
        for (const comp of this.components.values()) {
            if (comp.name === name)
                return comp;
        }
        return undefined;
    }
    list() {
        return Array.from(this.components.values());
    }
    getByCategory(category) {
        return this.list().filter(c => c.category === category);
    }
    search(query) {
        const lowerQuery = query.toLowerCase();
        return this.list().filter(c => c.name.toLowerCase().includes(lowerQuery) ||
            c.tags.some(t => t.includes(lowerQuery)));
    }
    getCategories() {
        return ['atomic', 'composite', 'patterns', 'templates'];
    }
}
export default ComponentLibrary;
//# sourceMappingURL=library.js.map