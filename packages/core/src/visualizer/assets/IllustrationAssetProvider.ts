// ============================================================================
// Illustration Asset Provider - Vector Illustrations
// ============================================================================

import type { Asset } from './types.js';

const ILLUSTRATION_PRESETS = [
  { name: 'Mountain Landscape', viewBox: '0 0 200 100', elements: '<polygon points="0,100 50,30 100,100" fill="#3b82f6"/><polygon points="40,100 100,20 160,100" fill="#60a5fa"/><polygon points="80,100 150,40 200,100" fill="#93c5fd"/>' },
  { name: 'City Skyline', viewBox: '0 0 200 100', elements: '<rect x="10" y="60" width="20" height="40" fill="#475569"/><rect x="35" y="40" width="25" height="60" fill="#334155"/><rect x="65" y="50" width="20" height="50" fill="#475569"/><rect x="90" y="30" width="30" height="70" fill="#334155"/><rect x="125" y="55" width="25" height="45" fill="#475569"/><rect x="155" y="45" width="20" height="55" fill="#334155"/>' },
  { name: 'Abstract Waves', viewBox: '0 0 200 100', elements: '<path d="M0 50 Q50 20 100 50 T200 50 V100 H0Z" fill="#8b5cf6"/><path d="M0 60 Q50 30 100 60 T200 60 V100 H0Z" fill="#a78bfa" opacity="0.7"/>' },
  { name: 'Sunset Hills', viewBox: '0 0 200 100', elements: '<circle cx="150" cy="40" r="25" fill="#f59e0b"/><path d="M0 100 Q50 60 100 80 Q150 100 200 70 V100 H0Z" fill="#10b981"/><path d="M0 100 Q80 70 150 90 Q200 100 200 100 V100 H0Z" fill="#059669"/>' },
  { name: 'Geometric Pattern', viewBox: '0 0 200 100', elements: '<rect x="10" y="10" width="40" height="40" fill="#ef4444"/><circle cx="80" cy="30" r="20" fill="#3b82f6"/><polygon points="130,10 160,50 100,50" fill="#10b981"/><rect x="150" y="50" width="30" height="30" fill="#f59e0b"/>' },
  { name: 'Cloud Formation', viewBox: '0 0 200 100', elements: '<ellipse cx="60" cy="50" rx="30" ry="20" fill="#e2e8f0"/><ellipse cx="80" cy="45" rx="25" ry="22" fill="#f1f5f9"/><ellipse cx="40" cy="55" rx="20" ry="15" fill="#f8fafc"/><ellipse cx="150" cy="40" rx="25" ry="18" fill="#e2e8f0"/><ellipse cx="170" cy="35" rx="20" ry="15" fill="#f1f5f9"/>' },
  { name: 'Tree Silhouette', viewBox: '0 0 200 100', elements: '<rect x="90" y="60" width="20" height="40" fill="#475569"/><circle cx="100" cy="45" r="30" fill="#10b981"/><circle cx="85" cy="55" r="20" fill="#059669"/><circle cx="115" cy="55" r="20" fill="#059669"/>' },
  { name: 'Ocean Waves', viewBox: '0 0 200 100', elements: '<rect width="200" height="50" fill="#0ea5e9"/><path d="M0 50 Q25 40 50 50 T100 50 T150 50 T200 50 V100 H0Z" fill="#0284c7"/><path d="M0 60 Q25 50 50 60 T100 60 T150 60 T200 60 V100 H0Z" fill="#075985"/>' },
  { name: 'Space Scene', viewBox: '0 0 200 100', elements: '<rect width="200" height="100" fill="#0f172a"/><circle cx="150" cy="35" r="20" fill="#f59e0b"/><circle cx="50" cy="70" r="3" fill="#fff"/><circle cx="80" cy="20" r="2" fill="#fff"/><circle cx="120" cy="80" r="2" fill="#fff"/><circle cx="180" cy="70" r="2" fill="#fff"/><circle cx="30" cy="40" r="1.5" fill="#fff"/>' },
  { name: 'Floral Pattern', viewBox: '0 0 200 100', elements: '<circle cx="40" cy="30" r="10" fill="#ec4899"/><circle cx="30" cy="30" r="6" fill="#f472b6"/><circle cx="50" cy="30" r="6" fill="#f472b6"/><circle cx="40" cy="20" r="6" fill="#f472b6"/><circle cx="40" cy="40" r="6" fill="#f472b6"/><circle cx="140" cy="60" r="12" fill="#ef4444"/><circle cx="128" cy="60" r="7" fill="#f87171"/><circle cx="152" cy="60" r="7" fill="#f87171"/>' },
];

export function getIllustrationAssets(): Asset[] {
  return ILLUSTRATION_PRESETS.map((ill, index) => ({
    id: `illust-${index}`,
    name: ill.name,
    category: 'illustrations',
    tags: ill.name.toLowerCase().split(' '),
    thumbnail: generateIllustrationThumbnail(ill.elements, ill.viewBox),
    insertData: {
      type: 'illustration',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${ill.viewBox}">${ill.elements}</svg>`,
      viewBox: ill.viewBox,
    },
    metadata: {
      elementCount: ill.elements.split('<').length - 1,
    },
  }));
}

function generateIllustrationThumbnail(elements: string, viewBox: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${elements}</svg>`;
}

export function searchIllustrationAssets(query: string): Asset[] {
  const q = query.toLowerCase();
  return getIllustrationAssets().filter(
    (a) =>
      a.name.toLowerCase().includes(q) ||
      a.tags.some((t) => t.includes(q))
  );
}

export function getIllustrationCount(): number {
  return ILLUSTRATION_PRESETS.length;
}