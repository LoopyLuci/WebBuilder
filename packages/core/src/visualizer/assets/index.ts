// ============================================================================
// Asset Library Browser - Entry Point
// Complete asset library with search, categories, preview, and one-click insert
// ============================================================================

// Core browser
export { AssetLibraryBrowser, createAssetLibraryBrowser, searchAllAssets, getAssetsByCategory } from './AssetLibraryBrowser.js';

// UI components and templates
export { renderAssetGrid, renderCategoryTabs, renderSearchBar, renderPreviewPane, renderAssetLibraryUI, ASSET_LIBRARY_CSS } from './AssetLibraryUI.js';

// Category definitions
export { ASSET_CATEGORIES, getCategoryInfo, getAllCategories } from './AssetCategories.js';

// Type exports
export type {
  Asset,
  AssetCategory,
  AssetInsertData,
  AssetCategoryInfo,
  AssetLibraryState,
  AssetInsertEvent,
  GradientStop,
} from './types.js';

// Individual providers (for direct access)
export { getIconAssets, searchIconAssets, getIconCount } from './IconAssetProvider.js';
export { getImageAssets, searchImageAssets, getImageCount } from './ImageAssetProvider.js';
export { getFontAssets, searchFontAssets, getFontCount } from './FontAssetProvider.js';
export { getColorAssets, searchColorAssets, getColorCount } from './ColorAssetProvider.js';
export { getGradientAssets, searchGradientAssets, getGradientCount } from './GradientAssetProvider.js';
export { getPatternAssets, searchPatternAssets, getPatternCount } from './PatternAssetProvider.js';
export { getIllustrationAssets, searchIllustrationAssets, getIllustrationCount } from './IllustrationAssetProvider.js';
export { getAnimationAssets, searchAnimationAssets, getAnimationCount } from './AnimationAssetProvider.js';

// ============================================================================
// Asset Type Count
// ============================================================================

import type { AssetCategory } from './types.js';

/**
 * Returns the total number of distinct asset categories supported.
 * Categories: icons, images, fonts, colors, gradients, patterns, illustrations, animations
 */
export function getAssetTypeCount(): number {
  return 8; // icons, images, fonts, colors, gradients, patterns, illustrations, animations
}

/**
 * List all asset categories
 */
export function listAssetCategories(): AssetCategory[] {
  return ['icons', 'images', 'fonts', 'colors', 'gradients', 'patterns', 'illustrations', 'animations'];
}