// ============================================================================
// Style Editor Types
// Comprehensive type system for visual style editing tools
// ============================================================================

/**
 * Color representation in multiple formats
 */
export interface ColorHSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
  a: number; // 0-1
}

export interface ColorRGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
  a: number; // 0-1
}

export interface ColorHex {
  value: string; // #RRGGBB or #RRGGBBAA
}

export type ColorFormat = 'hsl' | 'rgb' | 'hex';

export interface ColorState {
  hsl: ColorHSL;
  rgb: ColorRGB;
  hex: string;
  alpha: number;
}

/**
 * Font pairing definition
 */
export interface FontPairing {
  id: string;
  name: string;
  heading: FontDef;
  body: FontDef;
  accent?: FontDef;
  category: FontPairingCategory;
  mood: string[];
  description: string;
  previewText?: string;
}

export interface FontDef {
  family: string;
  fallback: string;
  weight: number;
  style?: string;
  letterSpacing?: string;
  lineHeight?: number;
}

export type FontPairingCategory =
  | 'classic'
  | 'modern'
  | 'elegant'
  | 'playful'
  | 'minimal'
  | 'bold'
  | 'retro'
  | 'corporate'
  | 'creative';

/**
 * Spacing values for padding/margin
 */
export interface SpacingValues {
  top: number;
  right: number;
  bottom: number;
  left: number;
  unit: SpacingUnit;
  linked: boolean; // when true, all sides move together
}

export type SpacingUnit = 'px' | 'rem' | 'em' | '%' | 'vh' | 'vw';

export interface SpacingDirection {
  vertical: number;
  horizontal: number;
  unit: SpacingUnit;
}

/**
 * Shadow layer definition
 */
export interface ShadowLayer {
  id: string;
  enabled: boolean;
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  inset: boolean;
}

export interface ShadowPreset {
  id: string;
  name: string;
  layers: ShadowLayer[];
}

/**
 * Border radius corner values
 */
export interface BorderRadiusValues {
  topLeft: number;
  topRight: number;
  bottomRight: number;
  bottomLeft: number;
  unit: SpacingUnit;
  linked: boolean;
}

/**
 * Complete style state combining all tools
 */
export interface StyleState {
  colors: ColorStyleState;
  typography: TypographyStyleState;
  spacing: SpacingStyleState;
  shadows: ShadowStyleState;
  borderRadius: BorderRadiusStyleState;
}

export interface ColorStyleState {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  custom: Record<string, string>;
}

export interface TypographyStyleState {
  headingFont: string;
  bodyFont: string;
  accentFont?: string;
  baseSize: number;
  scale: number;
  lineHeight: number;
  letterSpacing: number;
}

export interface SpacingStyleState {
  padding: SpacingValues;
  margin: SpacingValues;
  gap: number;
  unit: SpacingUnit;
}

export interface ShadowStyleState {
  layers: ShadowLayer[];
  preset?: string;
}

export interface BorderRadiusStyleState {
  values: BorderRadiusValues;
  preset?: string;
}

/**
 * CSS output configuration
 */
export interface CSSOutputConfig {
  format: 'css' | 'scss' | 'tailwind' | 'styled-components';
  prefix?: string;
  includeVariables: boolean;
  minify: boolean;
}

/**
 * Style editor event callbacks
 */
export interface StyleEditorCallbacks {
  onColorChange?: (state: ColorStyleState) => void;
  onTypographyChange?: (state: TypographyStyleState) => void;
  onSpacingChange?: (state: SpacingStyleState) => void;
  onShadowChange?: (state: ShadowStyleState) => void;
  onBorderRadiusChange?: (state: BorderRadiusStyleState) => void;
  onStyleChange?: (state: StyleState) => void;
  onCSSGenerated?: (css: string) => void;
}

/**
 * Complete CSS output from the style editor
 */
export interface StyleEditorCSS {
  variables: string;
  classes: string;
  raw: string;
  tailwind?: string;
}