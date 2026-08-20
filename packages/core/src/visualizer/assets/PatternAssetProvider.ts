// ============================================================================
// Pattern Asset Provider - Seamless Background Patterns
// ============================================================================

import type { Asset } from './types.js';

const PATTERN_PRESETS = [
  { name: 'Dots', svg: '<circle cx="10" cy="10" r="2" fill="currentColor"/>', css: 'background-image: radial-gradient(currentColor 1px, transparent 1px); background-size: 10px 10px;' },
  { name: 'Grid', svg: '<path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" stroke-width="0.5"/>', css: 'background-image: linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px); background-size: 20px 20px;' },
  { name: 'Diagonal Lines', svg: '<path d="M0 20 L20 0" stroke="currentColor" stroke-width="1"/>', css: 'background-image: repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%); background-size: 10px 10px;' },
  { name: 'Zigzag', svg: '<path d="M0 10 L5 0 L10 10 L15 0 L20 10" fill="none" stroke="currentColor" stroke-width="1"/>', css: 'background-image: linear-gradient(135deg, currentColor 25%, transparent 25%), linear-gradient(225deg, currentColor 25%, transparent 25%), linear-gradient(315deg, currentColor 25%, transparent 25%), linear-gradient(45deg, currentColor 25%, transparent 25%); background-size: 20px 20px; background-position: 0 0, 10px 0, 10px -10px, 0 10px;' },
  { name: 'Checkerboard', svg: '<rect x="0" y="0" width="10" height="10" fill="currentColor"/><rect x="10" y="10" width="10" height="10" fill="currentColor"/>', css: 'background-image: linear-gradient(45deg, currentColor 25%, transparent 25%, transparent 75%, currentColor 75%), linear-gradient(45deg, currentColor 25%, transparent 25%, transparent 75%, currentColor 75%); background-size: 20px 20px; background-position: 0 0, 10px 10px;' },
  { name: 'Waves', svg: '<path d="M0 10 Q5 0 10 10 T20 10" fill="none" stroke="currentColor" stroke-width="1"/>', css: 'background-image: radial-gradient(circle at 100% 150%, currentColor 24%, transparent 25%), radial-gradient(circle at 0 -50%, currentColor 24%, transparent 25%); background-size: 40px 20px;' },
  { name: 'Triangles', svg: '<polygon points="10,0 20,20 0,20" fill="currentColor"/>', css: 'background-image: linear-gradient(45deg, currentColor 50%, transparent 50%); background-size: 20px 20px;' },
  { name: 'Hexagons', svg: '<polygon points="10,0 20,5 20,15 10,20 0,15 0,5" fill="none" stroke="currentColor" stroke-width="0.5"/>', css: 'background-image: radial-gradient(circle, currentColor 1px, transparent 1px); background-size: 17px 20px;' },
  { name: 'Cross', svg: '<path d="M9 0 L11 0 L11 9 L21 9 L21 11 L11 11 L11 21 L9 21 L9 11 L0 11 L0 9 L9 9 Z" fill="currentColor"/>', css: 'background-image: radial-gradient(currentColor 2px, transparent 2px); background-size: 20px 20px;' },
  { name: 'Brick', svg: '<rect x="0" y="0" width="20" height="10" fill="none" stroke="currentColor" stroke-width="0.5"/><rect x="10" y="10" width="20" height="10" fill="none" stroke="currentColor" stroke-width="0.5"/>', css: 'background-image: linear-gradient(335deg, currentColor 23%, transparent 23%), linear-gradient(155deg, currentColor 23%, transparent 23%), linear-gradient(335deg, currentColor 34%, transparent 34%), linear-gradient(155deg, currentColor 34%, transparent 34%); background-size: 40px 20px; background-position: 0 0, 20px 10px, 20px 10px, 0 0;' },
  { name: 'Stars', svg: '<polygon points="10,2 12,8 18,8 13,12 15,18 10,14 5,18 7,12 2,8 8,8" fill="currentColor"/>', css: 'background-image: radial-gradient(currentColor 1px, transparent 1px); background-size: 20px 20px;' },
  { name: 'Carbon', svg: '<rect width="20" height="20" fill="currentColor" opacity="0.1"/><path d="M0 0 L20 20 M20 0 L0 20" stroke="currentColor" stroke-width="0.3"/>', css: 'background-image: linear-gradient(45deg, currentColor 25%, transparent 25%, transparent 75%, currentColor 75%), linear-gradient(45deg, currentColor 25%, transparent 25%, transparent 75%, currentColor 75%); background-size: 4px 4px; background-position: 0 0, 2px 2px;' },
];

export function getPatternAssets(): Asset[] {
  return PATTERN_PRESETS.map((pattern, index) => ({
    id: `pattern-${index}`,
    name: pattern.name,
    category: 'patterns',
    tags: pattern.name.toLowerCase().split(' '),
    thumbnail: generatePatternThumbnail(pattern.svg),
    insertData: {
      type: 'pattern',
      css: pattern.css,
      svg: pattern.svg,
    },
    metadata: {
      repeatable: true,
    },
  }));
}

function generatePatternThumbnail(svg: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#f8fafc"/><g color="#94a3b8">${svg}</g></svg>`;
}

export function searchPatternAssets(query: string): Asset[] {
  const q = query.toLowerCase();
  return getPatternAssets().filter(
    (a) =>
      a.name.toLowerCase().includes(q) ||
      a.tags.some((t) => t.includes(q))
  );
}

export function getPatternCount(): number {
  return PATTERN_PRESETS.length;
}