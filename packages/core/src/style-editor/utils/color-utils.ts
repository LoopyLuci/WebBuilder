// ============================================================================
// Color Conversion Utilities
// HSL, RGB, and Hex color conversion with validation
// ============================================================================

import type { ColorHSL, ColorRGB } from '../types.js';

/**
 * Convert HSL to RGB
 */
export function hslToRgb(hsl: ColorHSL): ColorRGB {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
    a: hsl.a,
  };
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(rgb: ColorRGB): ColorHSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
    a: rgb.a,
  };
}

/**
 * Convert RGB to Hex string
 */
export function rgbToHex(rgb: ColorRGB): string {
  const toHex = (n: number): string => {
    const hex = Math.max(0, Math.min(255, n)).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  let hex = `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
  if (rgb.a < 1) {
    hex += toHex(Math.round(rgb.a * 255));
  }
  return hex;
}

/**
 * Convert Hex string to RGB
 */
export function hexToRgb(hex: string): ColorRGB {
  let cleanHex = hex.replace('#', '').trim();

  // Handle shorthand (#RGB)
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((c) => c + c)
      .join('');
  }

  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  const a = cleanHex.length === 8 ? parseInt(cleanHex.substring(6, 8), 16) / 255 : 1;

  return { r, g, b, a: Math.round(a * 100) / 100 };
}

/**
 * Convert HSL to Hex string
 */
export function hslToHex(hsl: ColorHSL): string {
  return rgbToHex(hslToRgb(hsl));
}

/**
 * Convert Hex to HSL
 */
export function hexToHsl(hex: string): ColorHSL {
  return rgbToHsl(hexToRgb(hex));
}

/**
 * Validate hex color string
 */
export function isValidHex(hex: string): boolean {
  return /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/.test(hex);
}

/**
 * Normalize hex to 6 or 8 character format
 */
export function normalizeHex(hex: string): string {
  let cleanHex = hex.replace('#', '').trim();

  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((c) => c + c)
      .join('');
  }

  return `#${cleanHex.toLowerCase()}`;
}

/**
 * Get luminance of a color (for contrast calculations)
 */
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors (WCAG)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Get accessible text color (black or white) for a given background
 */
export function getAccessibleTextColor(bgHex: string): string {
  const whiteContrast = getContrastRatio(bgHex, '#ffffff');
  const blackContrast = getContrastRatio(bgHex, '#000000');
  return whiteContrast >= blackContrast ? '#ffffff' : '#000000';
}

/**
 * Generate a complementary color
 */
export function getComplementary(hex: string): string {
  const hsl = hexToHsl(hex);
  hsl.h = (hsl.h + 180) % 360;
  return hslToHex(hsl);
}

/**
 * Generate an analogous color scheme
 */
export function getAnalogous(hex: string): string[] {
  const hsl = hexToHsl(hex);
  return [
    hslToHex({ ...hsl, h: (hsl.h - 30 + 360) % 360 }),
    hex,
    hslToHex({ ...hsl, h: (hsl.h + 30) % 360 }),
  ];
}

/**
 * Generate a triadic color scheme
 */
export function getTriadic(hex: string): string[] {
  const hsl = hexToHsl(hex);
  return [
    hex,
    hslToHex({ ...hsl, h: (hsl.h + 120) % 360 }),
    hslToHex({ ...hsl, h: (hsl.h + 240) % 360 }),
  ];
}

/**
 * Generate a split-complementary color scheme
 */
export function getSplitComplementary(hex: string): string[] {
  const hsl = hexToHsl(hex);
  return [
    hex,
    hslToHex({ ...hsl, h: (hsl.h + 150) % 360 }),
    hslToHex({ ...hsl, h: (hsl.h + 210) % 360 }),
  ];
}

/**
 * Generate monochromatic shades
 */
export function getMonochromatic(hex: string, count: number = 5): string[] {
  const hsl = hexToHsl(hex);
  const shades: string[] = [];
  const step = 80 / (count - 1);

  for (let i = 0; i < count; i++) {
    const l = 10 + step * i;
    shades.push(hslToHex({ ...hsl, l: Math.min(95, Math.max(5, l)) }));
  }

  return shades;
}

/**
 * Parse any color input to normalized formats
 */
export function parseColorInput(input: string): { rgb: ColorRGB; hsl: ColorHSL; hex: string } | null {
  const trimmed = input.trim();

  // Try hex
  if (isValidHex(trimmed)) {
    const rgb = hexToRgb(trimmed);
    return { rgb, hsl: rgbToHsl(rgb), hex: normalizeHex(trimmed) };
  }

  // Try rgb() format
  const rgbMatch = trimmed.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/);
  if (rgbMatch) {
    const rgb: ColorRGB = {
      r: parseInt(rgbMatch[1]!),
      g: parseInt(rgbMatch[2]!),
      b: parseInt(rgbMatch[3]!),
      a: rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1,
    };
    return { rgb, hsl: rgbToHsl(rgb), hex: rgbToHex(rgb) };
  }

  // Try hsl() format
  const hslMatch = trimmed.match(/hsla?\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*(?:,\s*([\d.]+))?\s*\)/);
  if (hslMatch) {
    const hsl: ColorHSL = {
      h: parseInt(hslMatch[1]!),
      s: parseInt(hslMatch[2]!),
      l: parseInt(hslMatch[3]!),
      a: hslMatch[4] ? parseFloat(hslMatch[4]) : 1,
    };
    return { rgb: hslToRgb(hsl), hsl, hex: hslToHex(hsl) };
  }

  return null;
}

/**
 * Format color for CSS output
 */
export function formatColorForCSS(hex: string, alpha: number = 1): string {
  if (alpha < 1) {
    const rgb = hexToRgb(hex);
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  }
  return hex;
}