// ============================================================================
// Asset Library Type Definitions
// Comprehensive type system for the asset library system
// ============================================================================

export type ID = string;
export type Timestamp = string;

// ─── Asset Categories ────────────────────────────────────────────────────────

export type AssetCategory =
  | 'icon'
  | 'color'
  | 'typography'
  | 'pattern'
  | 'gradient'
  | 'spacing'
  | 'image'
  | 'animation';

export const ASSET_CATEGORIES: AssetCategory[] = [
  'icon',
  'color',
  'typography',
  'pattern',
  'gradient',
  'spacing',
  'image',
  'animation',
];

export interface AssetCategoryInfo {
  id: AssetCategory;
  name: string;
  description: string;
  icon: string;
  count: number;
}

// ─── Asset Base ──────────────────────────────────────────────────────────────

export interface Asset {
  id: ID;
  name: string;
  category: AssetCategory;
  tags: string[];
  description: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  metadata: AssetMetadata;
}

export interface AssetMetadata {
  author?: string;
  license?: string;
  version?: string;
  source?: string;
  custom?: Record<string, string>;
}

// ─── Icon Assets ─────────────────────────────────────────────────────────────

export type IconStyle = 'outline' | 'filled' | 'duotone' | 'mini' | 'micro';

export interface IconAsset extends Asset {
  category: 'icon';
  svg: string;
  pathData: string;
  viewBox: string;
  style: IconStyle;
  size: number;
  strokeWidth?: number;
  keywords: string[];
}

export const DEFAULT_ICON_VIEWBOX = '0 0 24 24';
export const DEFAULT_ICON_SIZE = 24;

// ─── Color Assets ────────────────────────────────────────────────────────────

export interface ColorAsset extends Asset {
  category: 'color';
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  palette?: string;
}

export interface ColorPaletteAsset extends Asset {
  category: 'color';
  colors: ColorShadeSet[];
  baseColor: string;
  scheme: ColorSchemeType;
}

export type ColorSchemeType =
  | 'monochromatic'
  | 'complementary'
  | 'analogous'
  | 'triadic'
  | 'split-complementary'
  | 'tetradic';

export interface ColorShadeSet {
  name: string;
  shades: Record<string, string>; // label -> hex
  base: string;
}

// ─── Typography Assets ───────────────────────────────────────────────────────

export interface TypographyAsset extends Asset {
  category: 'typography';
  fontFamily: string;
  fallbackFonts: string[];
  category_type: 'serif' | 'sans-serif' | 'monospace' | 'display' | 'handwriting';
  weights: number[];
  source?: string; // Google Fonts, Adobe Fonts, etc.
}

export interface TypeScaleAsset extends Asset {
  category: 'typography';
  scale: TypeScaleEntry[];
  ratio: number;
  baseSize: number;
  unit: 'px' | 'rem' | 'em';
}

export interface TypeScaleEntry {
  name: string;
  size: number;
  lineHeight: number;
  letterSpacing?: number;
  fontWeight?: number;
  usage: string;
}

// ─── Pattern Assets ──────────────────────────────────────────────────────────

export type PatternType = 'geometric' | 'organic' | 'texture' | 'illustration' | 'abstract';

export interface PatternAsset extends Asset {
  category: 'pattern';
  type: PatternType;
  svg: string;
  css?: string;
  tileSize: { width: number; height: number };
  repeat: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';
  backgroundColor?: string;
}

// ─── Gradient Assets ─────────────────────────────────────────────────────────

export type GradientType = 'linear' | 'radial' | 'conic' | 'mesh';

export interface GradientAsset extends Asset {
  category: 'gradient';
  type: GradientType;
  stops: GradientStop[];
  angle?: number;
  css: string;
  backgroundColor: string;
}

export interface GradientStop {
  color: string;
  position: number; // 0-100
  opacity?: number;
}

// ─── Spacing Assets ──────────────────────────────────────────────────────────

export interface SpacingAsset extends Asset {
  category: 'spacing';
  scale: SpacingEntry[];
  baseUnit: number;
  unit: 'px' | 'rem' | 'em';
}

export interface SpacingEntry {
  name: string;
  value: number;
  pixels: number;
  usage: string;
}

// ─── Animation Assets ────────────────────────────────────────────────────────

export interface AnimationAsset extends Asset {
  category: 'animation';
  keyframes: AnimationKeyframe[];
  duration: number;
  easing: string;
  css: string;
  type: 'entrance' | 'exit' | 'attention' | 'transition';
}

export interface AnimationKeyframe {
  offset: number; // 0-100
  properties: Record<string, string>;
}

// ─── Image Assets ────────────────────────────────────────────────────────────

export interface ImageAsset extends Asset {
  category: 'image';
  src: string;
  width: number;
  height: number;
  alt: string;
  format: 'svg' | 'png' | 'jpg' | 'webp' | 'avif';
  placeholder?: string; // base64 LQIP
}

// ─── Search Types ────────────────────────────────────────────────────────────

export interface SearchQuery {
  text?: string;
  categories?: AssetCategory[];
  tags?: string[];
  filters?: AssetFilter[];
  sortBy?: 'name' | 'date' | 'relevance' | 'category';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface AssetFilter {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in';
  value: string | number | string[];
}

export interface SearchResult<T extends Asset = Asset> {
  items: T[];
  total: number;
  offset: number;
  limit: number;
  query: SearchQuery;
  facets: SearchFacet[];
}

export interface SearchFacet {
  field: string;
  values: { value: string; count: number }[];
}

// ─── Import Types ────────────────────────────────────────────────────────────

export type ImportSource =
  | 'figma'
  | 'sketch'
  | 'adobe-xd'
  | 'svg-file'
  | 'css'
  | 'tailwind'
  | 'image'
  | 'url'
  | 'json';

export interface ImportOptions {
  source: ImportSource;
  preserveStructure?: boolean;
  autoTag?: boolean;
  deduplicate?: boolean;
  category?: AssetCategory;
  tags?: string[];
}

export interface ImportResult {
  success: boolean;
  assetsImported: number;
  errors: ImportError[];
  warnings: string[];
  assets: Asset[];
}

export interface ImportError {
  message: string;
  source?: string;
  recoverable: boolean;
}

// ─── Library State ───────────────────────────────────────────────────────────

export interface AssetLibraryState {
  assets: Map<string, Asset>;
  categories: Map<AssetCategory, Asset[]>;
  tags: Map<string, Asset[]>;
  favorites: Set<string>;
  recent: string[];
  importedSources: Map<string, Timestamp>;
}

export interface AssetExportOptions {
  categories?: AssetCategory[];
  format: 'json' | 'css' | 'scss' | 'tailwind' | 'svg-sprite';
  includeMetadata?: boolean;
  pretty?: boolean;
}