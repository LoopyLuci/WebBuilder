// ============================================================================
// Gradient Asset Provider - CSS Gradients
// ============================================================================

import type { Asset, GradientStop } from './types.js';

const GRADIENT_PRESETS = [
  { name: 'Sunset Glow', css: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', stops: [{ color: '#f093fb', position: 0 }, { color: '#f5576c', position: 100 }] },
  { name: 'Ocean Breeze', css: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', stops: [{ color: '#667eea', position: 0 }, { color: '#764ba2', position: 100 }] },
  { name: 'Fresh Mint', css: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', stops: [{ color: '#43e97b', position: 0 }, { color: '#38f9d7', position: 100 }] },
  { name: 'Warm Flame', css: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', stops: [{ color: '#ff9a9e', position: 0 }, { color: '#fecfef', position: 100 }] },
  { name: 'Night Sky', css: 'linear-gradient(135deg, #0c3547 0%, #203a43 50%, #2c5364 100%)', stops: [{ color: '#0c3547', position: 0 }, { color: '#203a43', position: 50 }, { color: '#2c5364', position: 100 }] },
  { name: 'Peach', css: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', stops: [{ color: '#ffecd2', position: 0 }, { color: '#fcb69f', position: 100 }] },
  { name: 'Deep Space', css: 'linear-gradient(135deg, #434343 0%, #000000 100%)', stops: [{ color: '#434343', position: 0 }, { color: '#000000', position: 100 }] },
  { name: 'Purple Haze', css: 'linear-gradient(135deg, #7e22ce 0%, #c026d3 50%, #e879f9 100%)', stops: [{ color: '#7e22ce', position: 0 }, { color: '#c026d3', position: 50 }, { color: '#e879f9', position: 100 }] },
  { name: 'Aurora', css: 'linear-gradient(135deg, #00c6fb 0%, #005bea 100%)', stops: [{ color: '#00c6fb', position: 0 }, { color: '#005bea', position: 100 }] },
  { name: 'Coral Reef', css: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)', stops: [{ color: '#ff6b6b', position: 0 }, { color: '#feca57', position: 100 }] },
  { name: 'Emerald City', css: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', stops: [{ color: '#11998e', position: 0 }, { color: '#38ef7d', position: 100 }] },
  { name: 'Rose Gold', css: 'linear-gradient(135deg, #f4c4f3 0%, #fc67fa 100%)', stops: [{ color: '#f4c4f3', position: 0 }, { color: '#fc67fa', position: 100 }] },
  { name: 'Midnight Sun', css: 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)', stops: [{ color: '#f093fb', position: 0 }, { color: '#f5576c', position: 50 }, { color: '#4facfe', position: 100 }] },
  { name: 'Northern Lights', css: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 50%, #667eea 100%)', stops: [{ color: '#43e97b', position: 0 }, { color: '#38f9d7', position: 50 }, { color: '#667eea', position: 100 }] },
  { name: 'Fire', css: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)', stops: [{ color: '#f12711', position: 0 }, { color: '#f5af19', position: 100 }] },
  { name: 'Ice', css: 'linear-gradient(135deg, #83a4d4 0%, #b6fbff 100%)', stops: [{ color: '#83a4d4', position: 0 }, { color: '#b6fbff', position: 100 }] },
];

export function getGradientAssets(): Asset[] {
  return GRADIENT_PRESETS.map((gradient, index) => ({
    id: `gradient-${index}`,
    name: gradient.name,
    category: 'gradients',
    tags: gradient.name.toLowerCase().split(' '),
    thumbnail: generateGradientThumbnail(gradient.stops),
    insertData: {
      type: 'gradient',
      css: gradient.css,
      stops: gradient.stops,
    },
    metadata: {
      stopCount: gradient.stops.length,
    },
  }));
}

function generateGradientThumbnail(stops: GradientStop[]): string {
  const gradientStops = stops
    .map((s) => `<stop offset="${s.position}%" stop-color="${s.color}"/>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="100%">${gradientStops}</linearGradient></defs><rect width="100" height="100" rx="8" fill="url(#pg)"/></svg>`;
}

export function searchGradientAssets(query: string): Asset[] {
  const q = query.toLowerCase();
  return getGradientAssets().filter(
    (a) =>
      a.name.toLowerCase().includes(q) ||
      a.tags.some((t) => t.includes(q))
  );
}

export function getGradientCount(): number {
  return GRADIENT_PRESETS.length;
}