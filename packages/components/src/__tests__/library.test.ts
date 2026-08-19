// ============================================================================
// Unit Tests for @webbuilder/components — ComponentLibrary
// ============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentLibrary, type ComponentDefinition } from '../../dist/index.js';

// A minimal stub component for testing registration
const StubComponent = () => null;

describe('ComponentLibrary', () => {
  let library: ComponentLibrary;

  beforeEach(() => {
    library = new ComponentLibrary();
  });

  // ── Construction & Defaults ──────────────────────────────────────────────
  describe('constructor', () => {
    it('creates a new library instance', () => {
      expect(library).toBeInstanceOf(ComponentLibrary);
    });

    it('registers all default components on construction', () => {
      const components = library.list();
      expect(components.length).toBe(15);
    });

    it('registers components across all four categories', () => {
      const categories = library.getCategories();
      expect(categories).toEqual(['atomic', 'composite', 'patterns', 'templates']);
    });
  });

  // ── Registration ──────────────────────────────────────────────────────────
  describe('register()', () => {
    it('adds a new component definition to the library', () => {
      const def: ComponentDefinition = {
        id: 'custom-widget',
        name: 'CustomWidget',
        category: 'atomic',
        component: StubComponent,
        tags: ['custom', 'widget'],
      };

      library.register(def);
      expect(library.get('custom-widget')).toEqual(def);
    });

    it('overwrites an existing component with the same id', () => {
      const def: ComponentDefinition = {
        id: 'button',
        name: 'CustomButton',
        category: 'atomic',
        component: StubComponent,
        tags: ['custom'],
      };

      library.register(def);
      const result = library.get('button');
      expect(result?.name).toBe('CustomButton');
    });

    it('increments the total component count after registering a new component', () => {
      const initialCount = library.list().length;

      const def: ComponentDefinition = {
        id: 'new-thing',
        name: 'NewThing',
        category: 'atomic',
        component: StubComponent,
        tags: [],
      };

      library.register(def);
      expect(library.list().length).toBe(initialCount + 1);
    });
  });

  // ── Unregistration ────────────────────────────────────────────────────────
  describe('unregister()', () => {
    it('removes a component by id and returns true', () => {
      expect(library.unregister('button')).toBe(true);
      expect(library.get('button')).toBeUndefined();
    });

    it('returns false when trying to unregister a non-existent id', () => {
      expect(library.unregister('nonexistent')).toBe(false);
    });

    it('decrements the total component count after unregistering', () => {
      const initialCount = library.list().length;
      library.unregister('hero-section');
      expect(library.list().length).toBe(initialCount - 1);
    });
  });

  // ── Retrieval by id ──────────────────────────────────────────────────────
  describe('get()', () => {
    it('returns the correct component definition by id', () => {
      const result = library.get('button');
      expect(result).toBeDefined();
      expect(result?.id).toBe('button');
      expect(result?.name).toBe('Button');
      expect(result?.category).toBe('atomic');
    });

    it('returns undefined for a non-existent id', () => {
      expect(library.get('does-not-exist')).toBeUndefined();
    });

    it('returns the expected tags for a default component', () => {
      const result = library.get('hero-section');
      expect(result?.tags).toContain('hero');
      expect(result?.tags).toContain('header');
      expect(result?.tags).toContain('landing');
    });
  });

  // ── Retrieval by name ────────────────────────────────────────────────────
  describe('getByName()', () => {
    it('returns the correct component definition by name', () => {
      const result = library.getByName('Button');
      expect(result).toBeDefined();
      expect(result?.id).toBe('button');
      expect(result?.name).toBe('Button');
    });

    it('returns undefined for a non-existent name', () => {
      expect(library.getByName('NonExistent')).toBeUndefined();
    });

    it('is case-sensitive for name lookup', () => {
      expect(library.getByName('button')).toBeUndefined();
      expect(library.getByName('Button')).toBeDefined();
    });
  });

  // ── Listing ──────────────────────────────────────────────────────────────
  describe('list()', () => {
    it('returns an array of all registered components', () => {
      const list = library.list();
      expect(Array.isArray(list)).toBe(true);
      expect(list.length).toBe(15);
    });

    it('returns ComponentDefinition objects with required fields', () => {
      const list = library.list();
      for (const comp of list) {
        expect(comp).toHaveProperty('id');
        expect(comp).toHaveProperty('name');
        expect(comp).toHaveProperty('category');
        expect(comp).toHaveProperty('component');
        expect(comp).toHaveProperty('tags');
        expect(Array.isArray(comp.tags)).toBe(true);
      }
    });

    it('returns a new array on each call (not a frozen reference)', () => {
      const list1 = library.list();
      const list2 = library.list();
      expect(list1).not.toBe(list2);
      expect(list1).toEqual(list2);
    });
  });

  // ── Category filtering ──────────────────────────────────────────────────
  describe('getByCategory()', () => {
    it('returns only atomic components when filtering by "atomic"', () => {
      const atomic = library.getByCategory('atomic');
      expect(atomic.length).toBeGreaterThan(0);
      for (const comp of atomic) {
        expect(comp.category).toBe('atomic');
      }
    });

    it('returns only composite components when filtering by "composite"', () => {
      const composite = library.getByCategory('composite');
      expect(composite.length).toBeGreaterThan(0);
      for (const comp of composite) {
        expect(comp.category).toBe('composite');
      }
    });

    it('returns only patterns components when filtering by "patterns"', () => {
      const patterns = library.getByCategory('patterns');
      expect(patterns.length).toBeGreaterThan(0);
      for (const comp of patterns) {
        expect(comp.category).toBe('patterns');
      }
    });

    it('returns only templates components when filtering by "templates"', () => {
      const templates = library.getByCategory('templates');
      expect(templates.length).toBeGreaterThan(0);
      for (const comp of templates) {
        expect(comp.category).toBe('templates');
      }
    });

    it('returns an empty array for a category with no components', () => {
      expect(library.getByCategory('nonexistent')).toEqual([]);
    });
  });

  // ── Searching ─────────────────────────────────────────────────────────────
  describe('search()', () => {
    it('finds components by name (case-insensitive)', () => {
      const results = library.search('button');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(c => c.id === 'button')).toBe(true);
    });

    it('finds components by partial name match', () => {
      const results = library.search('section');
      expect(results.some(c => c.id === 'hero-section')).toBe(true);
      expect(results.some(c => c.id === 'features-section')).toBe(true);
    });

    it('finds components by tag', () => {
      const results = library.search('navigation');
      expect(results.some(c => c.id === 'navbar')).toBe(true);
      expect(results.some(c => c.id === 'sidebar')).toBe(true);
    });

    it('finds components by partial tag match', () => {
      const results = library.search('nav');
      expect(results.some(c => c.id === 'navbar')).toBe(true);
    });

    it('returns an empty array when no components match', () => {
      const results = library.search('xyznonexistent');
      expect(results).toEqual([]);
    });

    it('returns multiple matches for common terms', () => {
      const results = library.search('landing');
      expect(results.length).toBeGreaterThanOrEqual(2);
      expect(results.some(c => c.id === 'landing-page')).toBe(true);
      expect(results.some(c => c.id === 'hero-section')).toBe(true);
    });

    it('is case-insensitive for tag search', () => {
      const lower = library.search('hero');
      const upper = library.search('HERO');
      expect(lower.length).toBe(upper.length);
      expect(lower).toEqual(upper);
    });
  });

  // ── Categories ───────────────────────────────────────────────────────────
  describe('getCategories()', () => {
    it('returns the four default categories', () => {
      const categories = library.getCategories();
      expect(categories).toContain('atomic');
      expect(categories).toContain('composite');
      expect(categories).toContain('patterns');
      expect(categories).toContain('templates');
    });

    it('returns exactly four categories', () => {
      expect(library.getCategories().length).toBe(4);
    });
  });
});

// ── Default Component Verification ────────────────────────────────────────────

describe('Default Components', () => {
  let library: ComponentLibrary;

  beforeEach(() => {
    library = new ComponentLibrary();
  });

  const expectedComponents = [
    { id: 'hero-section', name: 'HeroSection', category: 'composite' },
    { id: 'features-section', name: 'FeaturesSection', category: 'composite' },
    { id: 'pricing-section', name: 'PricingSection', category: 'composite' },
    { id: 'testimonials-section', name: 'TestimonialsSection', category: 'composite' },
    { id: 'cta-section', name: 'CTASection', category: 'composite' },
    { id: 'button', name: 'Button', category: 'atomic' },
    { id: 'input', name: 'Input', category: 'atomic' },
    { id: 'card', name: 'Card', category: 'atomic' },
    { id: 'badge', name: 'Badge', category: 'atomic' },
    { id: 'avatar', name: 'Avatar', category: 'atomic' },
    { id: 'navbar', name: 'Navbar', category: 'patterns' },
    { id: 'footer', name: 'Footer', category: 'patterns' },
    { id: 'sidebar', name: 'Sidebar', category: 'patterns' },
    { id: 'landing-page', name: 'LandingPage', category: 'templates' },
    { id: 'dashboard-layout', name: 'DashboardLayout', category: 'templates' },
  ];

  it.each(expectedComponents)(
    'registers $id as $name in category $category',
    ({ id, name, category }) => {
      const def = library.get(id);
      expect(def).toBeDefined();
      expect(def?.name).toBe(name);
      expect(def?.category).toBe(category);
    }
  );
});

// ── Component Definition Shape ────────────────────────────────────────────────

describe('ComponentDefinition shape', () => {
  it('exposes all required fields on a registered component', () => {
    const library = new ComponentLibrary();
    const def = library.get('button')!;

    expect(typeof def.id).toBe('string');
    expect(typeof def.name).toBe('string');
    expect(typeof def.category).toBe('string');
    expect(def.component).toBeDefined();
    expect(Array.isArray(def.tags)).toBe(true);
    expect(def.tags.length).toBeGreaterThan(0);
  });

  it('assigns appropriate tags to each default component', () => {
    const library = new ComponentLibrary();
    const button = library.get('button')!;
    expect(button.tags).toContain('button');
    expect(button.tags).toContain('click');
    expect(button.tags).toContain('action');
  });
});