// ============================================================================
// Typography Scale Generator
// Deterministic typography system generation with modular scales
// ============================================================================

import { PRNG } from './prng.js';

export interface TypeScaleEntry {
  name: string;
  size: string; // rem or px
  lineHeight: number;
  letterSpacing: string;
  fontWeight: number;
}

export interface TypographySystem {
  seed: string;
  fontFamily: {
    heading: string;
    body: string;
    mono: string;
  };
  scale: TypeScaleEntry[];
  sizes: Record<string, string>;
  weights: Record<string, number>;
  lineHeights: Record<string, number>;
  letterSpacings: Record<string, string>;
  textStyles: TextStyle[];
}

export interface TextStyle {
  name: string;
  fontFamily: string;
  fontSize: string;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: string;
  textTransform?: string;
}

export interface TypographyOptions {
  /** Base font size in px (default 16) */
  baseSize?: number;
  /** Scale ratio (default 1.25 - major third) */
  ratio?: number;
  /** Number of scale steps above base (default 5) */
  stepsUp?: number;
  /** Number of scale steps below base (default 2) */
  stepsDown?: number;
  /** Font category preference */
  fontCategory?: 'modern' | 'classic' | 'playful' | 'technical' | 'elegant';
}

// Curated font stacks by category
const FONT_STACKS = {
  modern: {
    heading: ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
    body: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
  },
  classic: {
    heading: ['Georgia', 'Times New Roman', 'serif'],
    body: ['Merriweather', 'Georgia', 'serif'],
    mono: ['Courier New', 'monospace'],
  },
  playful: {
    heading: ['Poppins', 'Comic Sans MS', 'sans-serif'],
    body: ['Nunito', 'system-ui', 'sans-serif'],
    mono: ['Source Code Pro', 'monospace'],
  },
  technical: {
    heading: ['Space Grotesk', 'system-ui', 'sans-serif'],
    body: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
    mono: ['IBM Plex Mono', 'Fira Code', 'monospace'],
  },
  elegant: {
    heading: ['Playfair Display', 'Georgia', 'serif'],
    body: ['Lora', 'Georgia', 'serif'],
    mono: ['IBM Plex Mono', 'monospace'],
  },
};

/**
 * Generate a modular type scale
 */
export function generateTypeScale(seed: string, options: TypographyOptions = {}): TypographySystem {
  const {
    baseSize = 16,
    ratio = 1.25,
    stepsUp = 5,
    stepsDown = 2,
    fontCategory = 'modern',
  } = options;

  const prng = new PRNG(seed);
  const fonts = FONT_STACKS[fontCategory] || FONT_STACKS.modern;

  // Generate scale entries
  const scale: TypeScaleEntry[] = [];
  const sizes: Record<string, string> = {};

  // Steps below base (xs, sm)
  for (let i = stepsDown; i >= 1; i--) {
    const size = baseSize / Math.pow(ratio, i);
    const name = i === 1 ? 'sm' : i === 2 ? 'xs' : `2xs`;
    scale.push({
      name,
      size: `${size}px`,
      lineHeight: 1.5 - i * 0.05,
      letterSpacing: i > 1 ? '0.025em' : '0.01em',
      fontWeight: 400,
    });
    sizes[name] = `${size}px`;
  }

  // Base
  scale.push({
    name: 'base',
    size: `${baseSize}px`,
    lineHeight: 1.5,
    letterSpacing: '0',
    fontWeight: 400,
  });
  sizes['base'] = `${baseSize}px`;

  // Steps above base (lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl)
  const upperNames = ['lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'];
  for (let i = 1; i <= stepsUp + 2; i++) {
    const size = baseSize * Math.pow(ratio, i);
    const name = upperNames[i - 1] || `${i}xl`;
    scale.push({
      name,
      size: `${size}px`,
      lineHeight: Math.max(1.0, 1.5 - i * 0.07),
      letterSpacing: i > 2 ? '-0.025em' : '-0.01em',
      fontWeight: Math.min(900, 400 + i * 50),
    });
    sizes[name] = `${size}px`;
  }

  // Weights
  const weights = {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  };

  // Line heights
  const lineHeights = {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  };

  // Letter spacings
  const letterSpacings = {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  };

  // Text styles (combinations for common use cases)
  const textStyles: TextStyle[] = [
    {
      name: 'display-2xl',
      fontFamily: fonts.heading.join(', '),
      fontSize: sizes['6xl'] || `${baseSize * Math.pow(ratio, 7)}px`,
      fontWeight: 800,
      lineHeight: 1.0,
      letterSpacing: '-0.05em',
    },
    {
      name: 'display-xl',
      fontFamily: fonts.heading.join(', '),
      fontSize: sizes['5xl'] || `${baseSize * Math.pow(ratio, 6)}px`,
      fontWeight: 700,
      lineHeight: 1.1,
      letterSpacing: '-0.025em',
    },
    {
      name: 'display-lg',
      fontFamily: fonts.heading.join(', '),
      fontSize: sizes['4xl'] || `${baseSize * Math.pow(ratio, 5)}px`,
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
    },
    {
      name: 'heading-h1',
      fontFamily: fonts.heading.join(', '),
      fontSize: sizes['3xl'] || `${baseSize * Math.pow(ratio, 4)}px`,
      fontWeight: 700,
      lineHeight: 1.25,
      letterSpacing: '-0.025em',
    },
    {
      name: 'heading-h2',
      fontFamily: fonts.heading.join(', '),
      fontSize: sizes['2xl'] || `${baseSize * Math.pow(ratio, 3)}px`,
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    {
      name: 'heading-h3',
      fontFamily: fonts.heading.join(', '),
      fontSize: sizes['xl'] || `${baseSize * Math.pow(ratio, 2)}px`,
      fontWeight: 600,
      lineHeight: 1.35,
    },
    {
      name: 'heading-h4',
      fontFamily: fonts.heading.join(', '),
      fontSize: sizes['lg'] || `${baseSize * Math.pow(ratio, 1)}px`,
      fontWeight: 600,
      lineHeight: 1.4,
    },
    {
      name: 'body-lg',
      fontFamily: fonts.body.join(', '),
      fontSize: sizes['lg'] || `${baseSize * Math.pow(ratio, 1)}px`,
      fontWeight: 400,
      lineHeight: 1.6,
    },
    {
      name: 'body',
      fontFamily: fonts.body.join(', '),
      fontSize: sizes['base'] || `${baseSize}px`,
      fontWeight: 400,
      lineHeight: 1.5,
    },
    {
      name: 'body-sm',
      fontFamily: fonts.body.join(', '),
      fontSize: sizes['sm'] || `${baseSize / ratio}px`,
      fontWeight: 400,
      lineHeight: 1.5,
    },
    {
      name: 'caption',
      fontFamily: fonts.body.join(', '),
      fontSize: sizes['xs'] || `${baseSize / Math.pow(ratio, 2)}px`,
      fontWeight: 400,
      lineHeight: 1.4,
    },
    {
      name: 'code',
      fontFamily: fonts.mono.join(', '),
      fontSize: sizes['sm'] || `${baseSize / ratio}px`,
      fontWeight: 400,
      lineHeight: 1.6,
    },
  ];

  // Fix heading-h2 which has a typo
  textStyles[4] = {
    ...textStyles[4],
    fontSize: sizes['2xl'] || `${baseSize * Math.pow(ratio, 3)}px`,
  };

  return {
    seed,
    fontFamily: {
      heading: fonts.heading.join(', '),
      body: fonts.body.join(', '),
      mono: fonts.mono.join(', '),
    },
    scale,
    sizes,
    weights,
    lineHeights,
    letterSpacings,
    textStyles,
  };
}

/**
 * Generate a type scale using a specific musical ratio
 */
export function generateMusicalScale(
  seed: string,
  ratio: 'minor-second' | 'major-second' | 'minor-third' | 'major-third' | 'perfect-fourth' | 'perfect-fifth' | 'golden' = 'major-third',
  options: Omit<TypographyOptions, 'ratio'> = {}
): TypographySystem {
  const ratios = {
    'minor-second': 1.067,
    'major-second': 1.125,
    'minor-third': 1.2,
    'major-third': 1.25,
    'perfect-fourth': 1.333,
    'perfect-fifth': 1.5,
    'golden': 1.618,
  };
  return generateTypeScale(seed, { ...options, ratio: ratios[ratio] });
}

/**
 * Generate CSS for the typography system
 */
export function typographyToCSS(system: TypographySystem): string {
  const lines: string[] = [];

  // Font face declarations
  lines.push(`:root {`);
  lines.push(`  --font-heading: ${system.fontFamily.heading};`);
  lines.push(`  --font-body: ${system.fontFamily.body};`);
  lines.push(`  --font-mono: ${system.fontFamily.mono};`);
  lines.push('');

  // Font sizes
  for (const [name, size] of Object.entries(system.sizes)) {
    lines.push(`  --text-${name}: ${size};`);
  }
  lines.push('');

  // Font weights
  for (const [name, weight] of Object.entries(system.weights)) {
    lines.push(`  --font-${name}: ${weight};`);
  }
  lines.push('');

  // Line heights
  for (const [name, height] of Object.entries(system.lineHeights)) {
    lines.push(`  --leading-${name}: ${height};`);
  }
  lines.push('');

  // Letter spacings
  for (const [name, spacing] of Object.entries(system.letterSpacings)) {
    lines.push(`  --tracking-${name}: ${spacing};`);
  }
  lines.push('}');
  lines.push('');

  // Text style classes
  for (const style of system.textStyles) {
    lines.push(`.text-${style.name} {`);
    lines.push(`  font-family: ${style.fontFamily};`);
    lines.push(`  font-size: ${style.fontSize};`);
    lines.push(`  font-weight: ${style.fontWeight};`);
    lines.push(`  line-height: ${style.lineHeight};`);
    lines.push(`  letter-spacing: ${style.letterSpacing};`);
    if (style.textTransform) {
      lines.push(`  text-transform: ${style.textTransform};`);
    }
    lines.push('}');
    lines.push('');
  }

  return lines.join('\n');
}