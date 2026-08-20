// ============================================================================
// Font Asset Provider - Google Fonts Integration
// ============================================================================

import type { Asset } from './types.js';

const GOOGLE_FONTS = [
  { family: 'Roboto', weights: [100, 300, 400, 500, 700, 900], category: 'sans-serif' },
  { family: 'Open Sans', weights: [300, 400, 600, 700, 800], category: 'sans-serif' },
  { family: 'Lato', weights: [100, 300, 400, 700, 900], category: 'sans-serif' },
  { family: 'Montserrat', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], category: 'sans-serif' },
  { family: 'Poppins', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], category: 'sans-serif' },
  { family: 'Raleway', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], category: 'sans-serif' },
  { family: 'Inter', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], category: 'sans-serif' },
  { family: 'Playfair Display', weights: [400, 500, 600, 700, 800, 900], category: 'serif' },
  { family: 'Merriweather', weights: [300, 400, 700, 900], category: 'serif' },
  { family: 'PT Serif', weights: [400, 700], category: 'serif' },
  { family: 'Oswald', weights: [200, 300, 400, 500, 600, 700], category: 'sans-serif' },
  { family: 'Nunito', weights: [200, 300, 400, 600, 700, 800, 900], category: 'sans-serif' },
  { family: 'Ubuntu', weights: [300, 400, 500, 700], category: 'sans-serif' },
  { family: 'Rubik', weights: [300, 400, 500, 600, 700, 800, 900], category: 'sans-serif' },
  { family: 'Fira Sans', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], category: 'sans-serif' },
  { family: 'Source Code Pro', weights: [200, 300, 400, 500, 600, 700, 900], category: 'monospace' },
  { family: 'JetBrains Mono', weights: [100, 200, 300, 400, 500, 600, 700, 800], category: 'monospace' },
  { family: 'Fira Code', weights: [300, 400, 500, 600, 700], category: 'monospace' },
  { family: 'Dancing Script', weights: [400, 500, 600, 700], category: 'handwriting' },
  { family: 'Pacifico', weights: [400], category: 'handwriting' },
  { family: 'Caveat', weights: [400, 500, 600, 700], category: 'handwriting' },
  { family: 'Lobster', weights: [400], category: 'display' },
  { family: 'Bebas Neue', weights: [400], category: 'display' },
  { family: 'Anton', weights: [400], category: 'display' },
  { family: 'Righteous', weights: [400], category: 'display' },
];

export function getFontAssets(): Asset[] {
  return GOOGLE_FONTS.map((font, index) => ({
    id: `font-${index}`,
    name: font.family,
    category: 'fonts',
    tags: [font.category, ...String(font.weights[0]).split('')],
    thumbnail: generateFontThumbnail(font.family),
    insertData: {
      type: 'font',
      family: font.family,
      url: `https://fonts.googleapis.com/css2?family=${font.family.replace(/ /g, '+')}:wght@${font.weights.join(';')}&display=swap`,
      weights: font.weights,
    },
    metadata: {
      category: font.category,
      weightCount: font.weights.length,
    },
  }));
}

function generateFontThumbnail(family: string): string {
  const hash = simpleHash(family);
  const sizes = [16, 18, 20, 22, 24];
  const size = sizes[hash % sizes.length];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50"><text x="50" y="35" text-anchor="middle" font-family="system-ui, sans-serif" font-size="${size}" fill="#333">${family.substring(0, 8)}</text></svg>`;
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function searchFontAssets(query: string): Asset[] {
  const q = query.toLowerCase();
  return getFontAssets().filter(
    (a) =>
      a.name.toLowerCase().includes(q) ||
      a.tags.some((t) => t.includes(q))
  );
}

export function getFontCount(): number {
  return GOOGLE_FONTS.length;
}