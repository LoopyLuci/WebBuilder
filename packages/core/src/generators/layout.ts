// ============================================================================
// Layout Generator
// Procedural layout generation with rule-based systems
// ============================================================================

import { PRNG } from './prng.js';
import { PerlinNoise, SimplexNoise } from './noise.js';

export interface LayoutGrid {
  columns: number;
  rows: number;
  gutter: string;
  margin: string;
  maxWidth: string;
}

export interface LayoutSection {
  id: string;
  name: string;
  type: 'hero' | 'features' | 'cta' | 'testimonials' | 'pricing' | 'stats' | 'faq' | 'content' | 'gallery' | 'form' | 'footer' | 'header' | 'sidebar';
  gridColumn: string;
  gridRow: string;
  minHeight: string;
  styles: Record<string, string>;
  children?: LayoutSection[];
}

export interface GeneratedLayout {
  seed: string;
  name: string;
  grid: LayoutGrid;
  sections: LayoutSection[];
  responsive: {
    mobile: LayoutBreakpoint;
    tablet: LayoutBreakpoint;
    desktop: LayoutBreakpoint;
  };
  css: string;
}

export interface LayoutBreakpoint {
  minWidth?: number;
  maxWidth?: number;
  columns: number;
  gutter: string;
  sections: string[]; // section IDs that are visible
}

export interface LayoutOptions {
  /** Layout style */
  style?: 'centered' | 'full-width' | 'sidebar' | 'grid' | 'masonry' | 'dashboard';
  /** Number of sections */
  sectionCount?: number;
  /** Grid columns (default 12) */
  columns?: number;
  /** Include header/footer */
  includeHeader?: boolean;
  includeFooter?: boolean;
  /** Content density */
  density?: 'sparse' | 'normal' | 'dense';
  /** Layout algorithm */
  algorithm?: 'rule-based' | 'noise-based' | 'golden-ratio' | 'fibonacci';
}

// Layout rules for section types
const SECTION_RULES: Record<string, {
  minHeight: string;
  preferredWidth: string;
  spacing: string;
  canRepeat: boolean;
  maxWidth?: string;
}> = {
  hero: { minHeight: '80vh', preferredWidth: '1 / -1', spacing: '0', canRepeat: false },
  features: { minHeight: '40vh', preferredWidth: '1 / -1', spacing: '2rem', canRepeat: true },
  cta: { minHeight: '30vh', preferredWidth: '1 / -1', spacing: '0', canRepeat: true },
  testimonials: { minHeight: '35vh', preferredWidth: '1 / -1', spacing: '1rem', canRepeat: false },
  pricing: { minHeight: '50vh', preferredWidth: '1 / -1', spacing: '2rem', canRepeat: false },
  stats: { minHeight: '20vh', preferredWidth: '1 / -1', spacing: '1rem', canRepeat: true },
  faq: { minHeight: '40vh', preferredWidth: '1 / -1', spacing: '0.5rem', canRepeat: false },
  content: { minHeight: '50vh', preferredWidth: '1 / -1', spacing: '1rem', canRepeat: true },
  gallery: { minHeight: '40vh', preferredWidth: '1 / -1', spacing: '0.5rem', canRepeat: true },
  form: { minHeight: '45vh', preferredWidth: '1 / -1', spacing: '1rem', canRepeat: false },
  footer: { minHeight: '25vh', preferredWidth: '1 / -1', spacing: '2rem', canRepeat: false },
  header: { minHeight: '8vh', preferredWidth: '1 / -1', spacing: '0', canRepeat: false },
  sidebar: { minHeight: '100vh', preferredWidth: '250px', spacing: '1rem', canRepeat: false },
};

/**
 * Generate a complete layout using rule-based algorithms
 */
export function generateLayout(seed: string, options: LayoutOptions = {}): GeneratedLayout {
  const {
    style = 'centered',
    sectionCount = 6,
    columns = 12,
    includeHeader = true,
    includeFooter = true,
    density = 'normal',
    algorithm = 'rule-based',
  } = options;

  const prng = new PRNG(seed);
  const sections: LayoutSection[] = [];

  // Always add header if requested
  if (includeHeader) {
    sections.push(createSection('header', 'header', prng, columns));
  }

  // Generate main sections
  const mainSectionTypes: LayoutSection['type'][] = [
    'hero', 'features', 'stats', 'testimonials', 'pricing', 'faq', 'cta', 'gallery', 'content', 'form'
  ];

  const shuffledTypes = prng.shuffle([...mainSectionTypes]);
  const numSections = Math.min(sectionCount, shuffledTypes.length);

  for (let i = 0; i < numSections; i++) {
    const type = shuffledTypes[i];
    if (type) {
      sections.push(createSection(`section-${i}`, type, prng, columns));
    }
  }

  // Add footer if requested
  if (includeFooter) {
    sections.push(createSection('footer', 'footer', prng, columns));
  }

  // Apply layout algorithm
  if (algorithm === 'noise-based') {
    applyNoiseLayout(sections, seed, columns);
  } else if (algorithm === 'golden-ratio') {
    applyGoldenRatioLayout(sections, columns);
  } else if (algorithm === 'fibonacci') {
    applyFibonacciLayout(sections, columns);
  }

  // Generate responsive breakpoints
  const responsive = {
    mobile: {
      maxWidth: 639,
      columns: 4,
      gutter: '1rem',
      sections: sections.map(s => s.id),
    },
    tablet: {
      minWidth: 640,
      maxWidth: 1023,
      columns: 8,
      gutter: '1.5rem',
      sections: sections.map(s => s.id),
    },
    desktop: {
      minWidth: 1024,
      columns,
      gutter: '2rem',
      sections: sections.map(s => s.id),
    },
  };

  // Generate CSS
  const css = generateLayoutCSS(sections, {
    columns,
    gutter: density === 'dense' ? '1rem' : density === 'sparse' ? '3rem' : '2rem',
    margin: density === 'dense' ? '1rem' : density === 'sparse' ? '3rem' : '2rem',
    maxWidth: style === 'centered' ? '1280px' : '100%',
  }, style);

  return {
    seed,
    name: `${style}-${algorithm}`,
    grid: {
      columns,
      rows: sections.length,
      gutter: density === 'dense' ? '1rem' : density === 'sparse' ? '3rem' : '2rem',
      margin: density === 'dense' ? '1rem' : density === 'sparse' ? '3rem' : '2rem',
      maxWidth: style === 'centered' ? '1280px' : '100%',
    },
    sections,
    responsive,
    css,
  };
}

/**
 * Create a section with appropriate defaults
 */
function createSection(id: string, type: LayoutSection['type'], prng: PRNG, columns: number): LayoutSection {
  const rules = SECTION_RULES[type] || SECTION_RULES.content;

  return {
    id,
    name: type.charAt(0).toUpperCase() + type.slice(1),
    type,
    gridColumn: rules.preferredWidth,
    gridRow: `auto`,
    minHeight: rules.minHeight,
    styles: {
      padding: prng.range(2, 4) + 'rem',
      display: 'flex',
      flexDirection: type === 'features' || type === 'stats' ? 'row' : 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: rules.spacing,
      backgroundColor: prng.bool(0.3) ? `var(--color-neutral-${prng.int(1, 3)}00)` : 'transparent',
    },
  };
}

/**
 * Apply noise-based positioning
 */
function applyNoiseLayout(sections: LayoutSection[], seed: string, columns: number): void {
  const noise = new SimplexNoise(seed);
  let yOffset = 0;

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const noiseVal = noise.noise2d(i * 0.5, 0);
    const normalized = (noiseVal + 1) / 2; // 0 to 1

    // Vary grid span based on noise
    const span = Math.max(2, Math.round(normalized * columns));
    const start = Math.max(1, Math.round((columns - span) / 2));
    section.gridColumn = `${start} / ${start + span}`;

    // Vary height slightly
    const heightMultiplier = 0.8 + normalized * 0.4;
    const baseHeight = parseInt(section.minHeight);
    section.minHeight = `${baseHeight * heightMultiplier}px`;

    // Add subtle offset
    yOffset += normalized * 0.5;
    section.gridRow = `${Math.round(yOffset + i + 1)}`;
  }
}

/**
 * Apply golden ratio layout
 */
function applyGoldenRatioLayout(sections: LayoutSection[], columns: number): void {
  const PHI = 1.618033988749895;

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const ratio = i % 2 === 0 ? 1 / PHI : 1 - 1 / PHI;
    const span = Math.max(2, Math.round(ratio * columns));
    const start = Math.round((columns - span) / 2) + 1;
    section.gridColumn = `${start} / ${start + span}`;
  }
}

/**
 * Apply fibonacci layout
 */
function applyFibonacciLayout(sections: LayoutSection[], columns: number): void {
  const fib = [1, 1, 2, 3, 5, 8, 13];

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const fibVal = fib[i % fib.length];
    const span = Math.min(columns, Math.max(2, fibVal));
    const start = Math.round((columns - span) / 2) + 1;
    section.gridColumn = `${start} / ${start + span}`;
  }
}

/**
 * Generate CSS for the layout
 */
function generateLayoutCSS(sections: LayoutSection[], grid: LayoutGrid, style: string): string {
  const lines: string[] = [];

  // Container
  lines.push(`.layout-container {`);
  lines.push(`  display: grid;`);
  lines.push(`  grid-template-columns: repeat(${grid.columns}, 1fr);`);
  lines.push(`  gap: ${grid.gutter};`);
  lines.push(`  max-width: ${grid.maxWidth};`);
  lines.push(`  margin: 0 auto;`);
  lines.push(`  padding: 0 ${grid.margin};`);
  lines.push(`}`);
  lines.push('');

  // Section styles
  for (const section of sections) {
    lines.push(`.layout-section--${section.id} {`);
    lines.push(`  grid-column: ${section.gridColumn};`);
    lines.push(`  grid-row: ${section.gridRow};`);
    lines.push(`  min-height: ${section.minHeight};`);
    for (const [key, value] of Object.entries(section.styles)) {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      lines.push(`  ${cssKey}: ${value};`);
    }
    lines.push(`}`);
    lines.push('');
  }

  // Responsive
  lines.push(`@media (max-width: 639px) {`);
  lines.push(`  .layout-container {`);
  lines.push(`    grid-template-columns: repeat(4, 1fr);`);
  lines.push(`  }`);
  lines.push(`}`);
  lines.push('');

  lines.push(`@media (min-width: 640px) and (max-width: 1023px) {`);
  lines.push(`  .layout-container {`);
  lines.push(`    grid-template-columns: repeat(8, 1fr);`);
  lines.push(`  }`);
  lines.push(`}`);

  return lines.join('\n');
}

/**
 * Generate a CSS Grid template
 */
export function generateGridTemplate(seed: string, columns = 12, rows = 4): string[][] {
  const prng = new PRNG(seed);
  const grid: string[][] = [];

  for (let r = 0; r < rows; r++) {
    const row: string[] = [];
    for (let c = 0; c < columns; c++) {
      row.push(prng.bool(0.3) ? 'filled' : 'empty');
    }
    grid.push(row);
  }

  return grid;
}

/**
 * Generate a masonry-style layout
 */
export function generateMasonryLayout(seed: string, itemCount = 12, columns = 4): LayoutSection[] {
  const prng = new PRNG(seed);
  const items: LayoutSection[] = [];

  for (let i = 0; i < itemCount; i++) {
    const col = i % columns;
    const span = prng.bool(0.2) ? 2 : 1;

    items.push({
      id: `masonry-${i}`,
      name: `Item ${i + 1}`,
      type: 'content',
      gridColumn: `${col + 1} / span ${span}`,
      gridRow: 'auto',
      minHeight: `${prng.range(150, 400)}px`,
      styles: {
        backgroundColor: `var(--color-neutral-${prng.int(1, 4)}00)`,
        borderRadius: '0.5rem',
        overflow: 'hidden',
      },
    });
  }

  return items;
}

/**
 * Generate a dashboard layout with sidebar
 */
export function generateDashboardLayout(seed: string): GeneratedLayout {
  return generateLayout(seed, {
    style: 'dashboard',
    algorithm: 'rule-based',
    includeHeader: true,
    includeFooter: false,
    sectionCount: 4,
  });
}