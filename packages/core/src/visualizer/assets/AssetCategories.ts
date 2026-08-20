// ============================================================================
// Asset Category Definitions
// ============================================================================

import type { AssetCategoryInfo } from './types.js';

export const ASSET_CATEGORIES: AssetCategoryInfo[] = [
  {
    id: 'icons',
    name: 'Icons',
    icon: '🎯',
    description: 'Scalable vector icons (10,000+)',
    count: 10000,
  },
  {
    id: 'images',
    name: 'Images',
    icon: '🖼️',
    description: 'High-quality photos via Unsplash',
    count: 50000,
  },
  {
    id: 'fonts',
    name: 'Fonts',
    icon: '🔤',
    description: 'Google Fonts library',
    count: 1500,
  },
  {
    id: 'colors',
    name: 'Colors',
    icon: '🎨',
    description: 'Color palettes and swatches',
    count: 5000,
  },
  {
    id: 'gradients',
    name: 'Gradients',
    icon: '🌈',
    description: 'CSS gradients and color transitions',
    count: 2000,
  },
  {
    id: 'patterns',
    name: 'Patterns',
    icon: '🧩',
    description: 'Seamless background patterns',
    count: 1000,
  },
  {
    id: 'illustrations',
    name: 'Illustrations',
    icon: '✏️',
    description: 'Vector illustrations and drawings',
    count: 3000,
  },
  {
    id: 'animations',
    name: 'Animations',
    icon: '🎬',
    description: 'CSS animations and keyframes',
    count: 500,
  },
];

export function getCategoryInfo(categoryId: string): AssetCategoryInfo | undefined {
  return ASSET_CATEGORIES.find((c) => c.id === categoryId);
}

export function getAllCategories(): AssetCategoryInfo[] {
  return ASSET_CATEGORIES;
}