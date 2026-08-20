// ============================================================================
// Color Palette Generator
// Procedural color palette generation with deterministic algorithms
// ============================================================================

import { PRNG } from './prng.js';

export interface GeneratedColor {
  hex: string;
  hsl: { h: number; s: number; l: number };
  rgb: { r: number; g: number; b: number };
  name: string;
}

export interface ColorPalette {
  seed: string;
  colors: GeneratedColor[];
  primary: GeneratedColor;
  secondary: GeneratedColor;
  accent: GeneratedColor;
  neutral: GeneratedColor[];
  semantic: {
    success: GeneratedColor;
    warning: GeneratedColor;
    error: GeneratedColor;
    info: GeneratedColor;
  };
}

export interface PaletteOptions {
  /** Number of main colors to generate (default 5) */
  count?: number;
  /** Saturation range [0-100] */
  saturationRange?: [number, number];
  /** Lightness range [0-100] */
  lightnessRange?: [number, number];
  /** Color harmony rule */
  harmony?: 'complementary' | 'triadic' | 'analogous' | 'split-complementary' | 'tetradic' | 'monochromatic';
  /** Generate full shades (50-950) */
  fullShades?: boolean;
}

// Named color approximations for display
const COLOR_NAMES: Array<{ name: string; hue: number }> = [
  { name: 'Red', hue: 0 },
  { name: 'Orange', hue: 30 },
  { name: 'Amber', hue: 45 },
  { name: 'Yellow', hue: 60 },
  { name: 'Lime', hue: 90 },
  { name: 'Green', hue: 120 },
  { name: 'Emerald', hue: 150 },
  { name: 'Teal', hue: 180 },
  { name: 'Cyan', hue: 195 },
  { name: 'Sky', hue: 210 },
  { name: 'Blue', hue: 240 },
  { name: 'Indigo', hue: 270 },
  { name: 'Violet', hue: 285 },
  { name: 'Purple', hue: 300 },
  { name: 'Fuchsia', hue: 315 },
  { name: 'Pink', hue: 330 },
  { name: 'Rose', hue: 345 },
];

/**
 * Convert HSL to RGB
 */
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return {
    r: Math.round(f(0) * 255),
    g: Math.round(f(8) * 255),
    b: Math.round(f(4) * 255),
  };
}

/**
 * Convert RGB to hex
 */
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

/**
 * Convert hex to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : { r: 0, g: 0, b: 0 };
}

/**
 * Convert RGB to HSL
 */
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Get closest color name for a hue
 */
function getColorName(hue: number): string {
  let closest = COLOR_NAMES[0];
  let minDiff = 360;
  for (const c of COLOR_NAMES) {
    const diff = Math.abs(hue - c.hue);
    const wrapped = Math.min(diff, 360 - diff);
    if (wrapped < minDiff) {
      minDiff = wrapped;
      closest = c;
    }
  }
  return closest.name;
}

/**
 * Generate a color from HSL values
 */
function makeColor(h: number, s: number, l: number): GeneratedColor {
  const rgb = hslToRgb(h, s, l);
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
  return {
    hex,
    hsl: { h, s, l },
    rgb,
    name: getColorName(h),
  };
}

/**
 * Generate shade variations (50-950) for a base color
 */
function generateShades(baseHsl: { h: number; s: number; l: number }): GeneratedColor[] {
  const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  const lightnesses = [97, 94, 86, 74, 60, 48, 38, 28, 18, 10, 5];
  return shades.map((level, i) => {
    const l = lightnesses[i];
    const s = Math.max(0, baseHsl.s - (100 - l) * 0.2);
    return makeColor(baseHsl.h, s, l);
  });
}

/**
 * Generate a complete color palette with harmony rules
 */
export function generatePalette(seed: string, options: PaletteOptions = {}): ColorPalette {
  const {
    count = 5,
    saturationRange = [40, 90],
    lightnessRange = [30, 70],
    harmony = 'triadic',
    fullShades = false,
  } = options;

  const prng = new PRNG(seed);

  // Base hue from seed
  const baseHue = prng.range(0, 360);

  // Generate hues based on harmony rule
  const hues: number[] = [];
  switch (harmony) {
    case 'complementary':
      hues.push(baseHue, (baseHue + 180) % 360);
      break;
    case 'triadic':
      hues.push(baseHue, (baseHue + 120) % 360, (baseHue + 240) % 360);
      break;
    case 'analogous':
      hues.push(
        (baseHue - 30 + 360) % 360,
        baseHue,
        (baseHue + 30) % 360,
        (baseHue + 60) % 360
      );
      break;
    case 'split-complementary':
      hues.push(baseHue, (baseHue + 150) % 360, (baseHue + 210) % 360);
      break;
    case 'tetradic':
      hues.push(baseHue, (baseHue + 90) % 360, (baseHue + 180) % 360, (baseHue + 270) % 360);
      break;
    case 'monochromatic':
      hues.push(baseHue);
      break;
  }

  // Generate main colors
  const colors: GeneratedColor[] = [];
  for (let i = 0; i < count; i++) {
    const hue = hues[i % hues.length];
    const sat = prng.range(saturationRange[0], saturationRange[1]);
    const light = prng.range(lightnessRange[0], lightnessRange[1]);
    colors.push(makeColor(hue, sat, light));
  }

  // Ensure we have at least primary, secondary, accent
  const primary = colors[0] || makeColor(baseHue, 70, 50);
  const secondary = colors[1] || makeColor((baseHue + 120) % 360, 60, 45);
  const accent = colors[2] || makeColor((baseHue + 240) % 360, 80, 55);

  // Generate neutral grays with slight hue tint
  const neutral = [
    makeColor(baseHue, 5, 97),
    makeColor(baseHue, 5, 92),
    makeColor(baseHue, 8, 82),
    makeColor(baseHue, 10, 65),
    makeColor(baseHue, 10, 45),
    makeColor(baseHue, 12, 25),
    makeColor(baseHue, 15, 12),
  ];

  // Semantic colors
  const semantic = {
    success: makeColor(prng.range(120, 160), prng.range(50, 75), prng.range(35, 50)),
    warning: makeColor(prng.range(35, 50), prng.range(70, 95), prng.range(45, 60)),
    error: makeColor(prng.range(0, 15), prng.range(60, 85), prng.range(45, 60)),
    info: makeColor(prng.range(200, 230), prng.range(60, 85), prng.range(45, 60)),
  };

  // Build shades if requested
  if (fullShades) {
    const allShades: GeneratedColor[] = [];
    for (const color of [primary, secondary, accent]) {
      allShades.push(...generateShades(color.hsl));
    }
    // Replace or augment colors with shades
    for (let i = 0; i < colors.length && i < allShades.length; i++) {
      colors[i] = allShades[i * 3 + 1]; // Take mid-range shades
    }
  }

  return {
    seed,
    colors,
    primary,
    secondary,
    accent,
    neutral,
    semantic,
  };
}

/**
 * Generate a monochromatic palette
 */
export function generateMonochromatic(seed: string, baseHue?: number): ColorPalette {
  return generatePalette(seed, {
    harmony: 'monochromatic',
    count: 5,
    ...(baseHue !== undefined ? { lightnessRange: [20, 80] } : {}),
  });
}

/**
 * Generate a complementary palette
 */
export function generateComplementary(seed: string): ColorPalette {
  return generatePalette(seed, { harmony: 'complementary', count: 4 });
}

/**
 * Calculate contrast ratio between two colors (WCAG)
 */
export function contrastRatio(color1: GeneratedColor, color2: GeneratedColor): number {
  const lum1 = relativeLuminance(color1.rgb);
  const lum2 = relativeLuminance(color2.rgb);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Calculate relative luminance (WCAG definition)
 */
function relativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const toLinear = (v: number) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(rgb.r) + 0.7152 * toLinear(rgb.g) + 0.0722 * toLinear(rgb.b);
}

/**
 * Find best text color (black or white) for a background
 */
export function bestTextColor(bgColor: GeneratedColor): GeneratedColor {
  const black = makeColor(0, 0, 0);
  const white = makeColor(0, 0, 100);
  const contrastBlack = contrastRatio(bgColor, black);
  const contrastWhite = contrastRatio(bgColor, white);
  return contrastBlack >= contrastWhite ? black : white;
}

/**
 * Blend two colors together
 */
export function blendColors(
  color1: GeneratedColor,
  color2: GeneratedColor,
  ratio = 0.5
): GeneratedColor {
  const rgb = {
    r: Math.round(color1.rgb.r * (1 - ratio) + color2.rgb.r * ratio),
    g: Math.round(color1.rgb.g * (1 - ratio) + color2.rgb.g * ratio),
    b: Math.round(color1.rgb.b * (1 - ratio) + color2.rgb.b * ratio),
  };
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return {
    hex: rgbToHex(rgb.r, rgb.g, rgb.b),
    rgb,
    hsl,
    name: getColorName(hsl.h),
  };
}