// ============================================================================
// Asset Library Types
// ============================================================================

export type AssetCategory =
  | 'icons'
  | 'images'
  | 'fonts'
  | 'colors'
  | 'gradients'
  | 'patterns'
  | 'illustrations'
  | 'animations';

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  tags: string[];
  thumbnail: string;
  preview?: string;
  insertData: AssetInsertData;
  metadata?: Record<string, string | number>;
}

export type AssetInsertData =
  | { type: 'icon'; svg: string; name: string }
  | { type: 'image'; url: string; alt: string; credit?: string }
  | { type: 'font'; family: string; url: string; weights: number[] }
  | { type: 'color'; hex: string; rgb: [number, number, number] }
  | { type: 'gradient'; css: string; stops: GradientStop[] }
  | { type: 'pattern'; css: string; svg?: string }
  | { type: 'illustration'; svg: string; viewBox: string }
  | { type: 'animation'; css: string; keyframes: string };

export interface GradientStop {
  color: string;
  position: number;
}

export interface AssetCategoryInfo {
  id: AssetCategory;
  name: string;
  icon: string;
  description: string;
  count: number;
}

export interface AssetLibraryState {
  searchQuery: string;
  activeCategory: AssetCategory | 'all';
  selectedAsset: Asset | null;
  viewMode: 'grid' | 'list';
  sortBy: 'name' | 'category' | 'recent';
  favorites: Set<string>;
}

export interface AssetInsertEvent {
  asset: Asset;
  timestamp: number;
  target?: string;
}