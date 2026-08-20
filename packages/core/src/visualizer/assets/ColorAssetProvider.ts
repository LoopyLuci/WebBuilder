// ============================================================================
// Color Asset Provider - Color Palettes & Swatches
// ============================================================================

import type { Asset } from './types.js';

const COLOR_PALETTES = [
  { name: 'Primary Blue', colors: ['#1e3a8a', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'] },
  { name: 'Sunset', colors: ['#7c2d12', '#c2410c', '#ea580c', '#f97316', '#fb923c', '#fdba74'] },
  { name: 'Forest', colors: ['#14532d', '#166534', '#16a34a', '#22c55e', '#4ade80', '#86efac'] },
  { name: 'Ocean', colors: ['#0c4a6e', '#075985', '#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc'] },
  { name: 'Berry', colors: ['#581c87', '#7e22ce', '#9333ea', '#a855f7', '#c084fc', '#d8b4fe'] },
  { name: 'Rose', colors: ['#881337', '#be123c', '#e11d48', '#f43f5e', '#fb7185', '#fda4af'] },
  { name: 'Slate', colors: ['#0f172a', '#1e293b', '#334155', '#475569', '#64748b', '#94a3b8'] },
  { name: 'Warm Gray', colors: ['#1c1917', '#292524', '#44403c', '#57534e', '#78716c', '#a8a29e'] },
  { name: 'Emerald', colors: ['#064e3b', '#065f46', '#047857', '#059669', '#10b981', '#34d399'] },
  { name: 'Amber', colors: ['#78350f', '#92400e', '#b45309', '#d97706', '#f59e0b', '#fbbf24'] },
  { name: 'Teal', colors: ['#134e4a', '#115e59', '#0d9488', '#14b8a6', '#2dd4bf', '#5eead4'] },
  { name: 'Indigo', colors: ['#312e81', '#3730a3', '#4338ca', '#4f46e5', '#6366f1', '#818cf8'] },
  { name: 'Coral', colors: ['#9f1239', '#e11d48', '#f43f5e', '#f97316', '#fbbf24', '#fef3c7'] },
  { name: 'Midnight', colors: ['#020617', '#0f172a', '#1e293b', '#334155', '#475569', '#64748b'] },
  { name: 'Pastel', colors: ['#fce7f3', '#e0e7ff', '#fef3c7', '#d1fae5', '#ffedd5', '#f3e8ff'] },
  { name: 'Neon', colors: ['#ff0080', '#7928ca', '#0070f3', '#00dfd8', '#ff4d4d', '#fcb900'] },
];

export function getColorAssets(): Asset[] {
  const assets: Asset[] = [];
  let id = 0;
  for (const palette of COLOR_PALETTES) {
    for (const color of palette.colors) {
      const rgb = hexToRgb(color);
      assets.push({
        id: `color-${id++}`,
        name: `${palette.name} - ${color}`,
        category: 'colors',
        tags: [palette.name.toLowerCase(), color],
        thumbnail: generateColorThumbnail(color),
        insertData: {
          type: 'color',
          hex: color,
          rgb,
        },
        metadata: {
          palette: palette.name,
        },
      });
    }
  }
  return assets;
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [0, 0, 0];
  return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];
}

function generateColorThumbnail(color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="8" fill="${color}"/></svg>`;
}

export function searchColorAssets(query: string): Asset[] {
  const q = query.toLowerCase();
  return getColorAssets().filter(
    (a) =>
      a.name.toLowerCase().includes(q) ||
      a.tags.some((t) => t.includes(q))
  );
}

export function getColorCount(): number {
  return COLOR_PALETTES.reduce((sum, p) => sum + p.colors.length, 0);
}