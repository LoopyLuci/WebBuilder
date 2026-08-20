// ============================================================================
// Image Asset Provider - Unsplash Integration
// ============================================================================

import type { Asset } from './types.js';

const IMAGE_CATEGORIES = [
  'nature', 'architecture', 'technology', 'people', 'animals',
  'food', 'travel', 'business', 'fashion', 'health', 'sports',
  'art', 'interior', 'landscape', 'abstract', 'texture',
];

const IMAGE_TOPICS = [
  'mountain', 'ocean', 'forest', 'city', 'sunset', 'sunrise',
  'flower', 'sky', 'cloud', 'water', 'tree', 'road', 'building',
  'bridge', 'beach', 'desert', 'snow', 'rain', 'light', 'shadow',
  'pattern', 'minimal', 'vintage', 'modern', 'retro', 'neon',
];

export function getImageAssets(): Asset[] {
  const assets: Asset[] = [];
  let id = 0;
  for (const topic of IMAGE_TOPICS) {
    for (const cat of IMAGE_CATEGORIES.slice(0, 5)) {
      const name = `${topic} ${cat}`;
      assets.push({
        id: `img-${id++}`,
        name: name.replace(/\b\w/g, (l) => l.toUpperCase()),
        category: 'images',
        tags: [topic, cat],
        thumbnail: generateImageThumbnail(topic, cat),
        preview: generateImagePreview(topic, cat),
        insertData: {
          type: 'image',
          url: `https://source.unsplash.com/featured/?${topic},${cat}`,
          alt: `${topic} ${cat} photo`,
          credit: 'Unsplash',
        },
        metadata: {
          source: 'unsplash',
          topic,
          category: cat,
        },
      });
    }
  }
  return assets;
}

function generateImageThumbnail(topic: string, category: string): string {
  const hash = simpleHash(`${topic}-${category}`);
  const colors = [
    ['#667eea', '#764ba2'],
    ['#f093fb', '#f5576c'],
    ['#4facfe', '#00f2fe'],
    ['#43e97b', '#38f9d7'],
    ['#fa709a', '#fee140'],
    ['#a18cd1', '#fbc2eb'],
    ['#fccb90', '#d57eeb'],
    ['#e0c3fc', '#8ec5fc'],
  ];
  const [c1, c2] = colors[hash % colors.length];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g${hash}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${c1}"/><stop offset="100%" style="stop-color:${c2}"/></linearGradient></defs><rect width="100" height="100" fill="url(#g${hash})"/><circle cx="${20 + (hash % 60)}" cy="${20 + ((hash >> 8) % 60)}" r="${10 + (hash % 15)}" fill="rgba(255,255,255,0.3)"/></svg>`;
}

function generateImagePreview(topic: string, category: string): string {
  return generateImageThumbnail(topic, category);
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

export function searchImageAssets(query: string): Asset[] {
  const q = query.toLowerCase();
  return getImageAssets().filter(
    (a) =>
      a.name.toLowerCase().includes(q) ||
      a.tags.some((t) => t.includes(q))
  );
}

export function getImageCount(): number {
  return IMAGE_TOPICS.length * 5;
}