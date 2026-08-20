// ============================================================================
// Asset Library Browser - Main Component
// Visual grid with categories, search, preview, and one-click insert
// ============================================================================

import type { Asset, AssetCategory, AssetLibraryState, AssetInsertEvent } from './types.js';
import { ASSET_CATEGORIES } from './AssetCategories.js';
import { getIconAssets, searchIconAssets } from './IconAssetProvider.js';
import { getImageAssets, searchImageAssets } from './ImageAssetProvider.js';
import { getFontAssets, searchFontAssets } from './FontAssetProvider.js';
import { getColorAssets, searchColorAssets } from './ColorAssetProvider.js';
import { getGradientAssets, searchGradientAssets } from './GradientAssetProvider.js';
import { getPatternAssets, searchPatternAssets } from './PatternAssetProvider.js';
import { getIllustrationAssets, searchIllustrationAssets } from './IllustrationAssetProvider.js';
import { getAnimationAssets, searchAnimationAssets } from './AnimationAssetProvider.js';

export class AssetLibraryBrowser {
  private state: AssetLibraryState;
  private allAssets: Asset[] = [];
  private filteredAssets: Asset[] = [];
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map();

  constructor() {
    this.state = {
      searchQuery: '',
      activeCategory: 'all',
      selectedAsset: null,
      viewMode: 'grid',
      sortBy: 'name',
      favorites: new Set(),
    };
    this.loadAllAssets();
  }

  // === Asset Loading ===

  private loadAllAssets(): void {
    this.allAssets = [
      ...getIconAssets(),
      ...getImageAssets(),
      ...getFontAssets(),
      ...getColorAssets(),
      ...getGradientAssets(),
      ...getPatternAssets(),
      ...getIllustrationAssets(),
      ...getAnimationAssets(),
    ];
    this.filteredAssets = [...this.allAssets];
  }

  // === Search ===

  search(query: string): Asset[] {
    this.state.searchQuery = query;
    this.applyFilters();
    return this.filteredAssets;
  }

  // === Category Filtering ===

  setCategory(category: AssetCategory | 'all'): void {
    this.state.activeCategory = category;
    this.applyFilters();
  }

  getCategories(): typeof ASSET_CATEGORIES {
    return ASSET_CATEGORIES;
  }

  // === Filtering Logic ===

  private applyFilters(): void {
    let assets = [...this.allAssets];

    // Category filter
    if (this.state.activeCategory !== 'all') {
      assets = assets.filter((a) => a.category === this.state.activeCategory);
    }

    // Search filter
    if (this.state.searchQuery) {
      const q = this.state.searchQuery.toLowerCase();
      assets = assets.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.tags.some((t) => t.includes(q))
      );
    }

    // Sort
    assets.sort((a, b) => {
      switch (this.state.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    this.filteredAssets = assets;
  }

  // === Selection ===

  selectAsset(asset: Asset): void {
    this.state.selectedAsset = asset;
    this.emit('select', asset);
  }

  getSelectedAsset(): Asset | null {
    return this.state.selectedAsset;
  }

  // === Insert ===

  insertAsset(asset: Asset, target?: string): AssetInsertEvent {
    const event: AssetInsertEvent = {
      asset,
      timestamp: Date.now(),
      target,
    };
    this.emit('insert', event);
    return event;
  }

  // === Favorites ===

  toggleFavorite(assetId: string): boolean {
    if (this.state.favorites.has(assetId)) {
      this.state.favorites.delete(assetId);
      return false;
    } else {
      this.state.favorites.add(assetId);
      return true;
    }
  }

  isFavorite(assetId: string): boolean {
    return this.state.favorites.has(assetId);
  }

  // === View Mode ===

  setViewMode(mode: 'grid' | 'list'): void {
    this.state.viewMode = mode;
    this.emit('viewModeChange', mode);
  }

  getViewMode(): 'grid' | 'list' {
    return this.state.viewMode;
  }

  // === Getters ===

  getFilteredAssets(): Asset[] {
    return this.filteredAssets;
  }

  getAllAssets(): Asset[] {
    return this.allAssets;
  }

  getAssetCount(): number {
    return this.allAssets.length;
  }

  getCategoryCount(category: AssetCategory | 'all'): number {
    if (category === 'all') return this.allAssets.length;
    return this.allAssets.filter((a) => a.category === category).length;
  }

  // === Event System ===

  on(event: string, callback: (data: unknown) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: unknown): void {
    this.listeners.get(event)?.forEach((cb) => cb(data));
  }

  // === State Snapshot ===

  getState(): Readonly<AssetLibraryState> {
    return { ...this.state };
  }

  // === Reset ===

  reset(): void {
    this.state.searchQuery = '';
    this.state.activeCategory = 'all';
    this.state.selectedAsset = null;
    this.applyFilters();
  }
}

// === Factory Function ===

export function createAssetLibraryBrowser(): AssetLibraryBrowser {
  return new AssetLibraryBrowser();
}

// === Convenience Functions for Direct Access ===

export function searchAllAssets(query: string): Asset[] {
  const q = query.toLowerCase();
  const allAssets = [
    ...getIconAssets(),
    ...getImageAssets(),
    ...getFontAssets(),
    ...getColorAssets(),
    ...getGradientAssets(),
    ...getPatternAssets(),
    ...getIllustrationAssets(),
    ...getAnimationAssets(),
  ];
  return allAssets.filter(
    (a) =>
      a.name.toLowerCase().includes(q) ||
      a.tags.some((t) => t.includes(q))
  );
}

export function getAssetsByCategory(category: AssetCategory): Asset[] {
  switch (category) {
    case 'icons': return getIconAssets();
    case 'images': return getImageAssets();
    case 'fonts': return getFontAssets();
    case 'colors': return getColorAssets();
    case 'gradients': return getGradientAssets();
    case 'patterns': return getPatternAssets();
    case 'illustrations': return getIllustrationAssets();
    case 'animations': return getAnimationAssets();
    default: return [];
  }
}