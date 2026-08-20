// ============================================================================
// Template System Types
// ============================================================================

export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  colorPalette: ColorPalette;
  typography: TypographySystem;
  breakpoints: Breakpoints;
  sections: Section[];
  pages: Page[];
  metadata: TemplateMetadata;
}

export type TemplateCategory =
  | 'saas'
  | 'portfolio'
  | 'ecommerce'
  | 'blog'
  | 'agency'
  | 'restaurant'
  | 'startup'
  | 'personal'
  | 'nonprofit'
  | 'educational'
  | 'medical'
  | 'legal'
  | 'real-estate'
  | 'travel'
  | 'photography'
  | 'music'
  | 'fitness'
  | 'finance'
  | 'technology'
  | 'healthcare';

export interface ColorPalette {
  primary: ColorShades;
  secondary: ColorShades;
  accent: ColorShades;
  neutral: ColorShades;
  semantic: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

export interface ColorShades {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export interface TypographySystem {
  fontFamily: {
    heading: string;
    body: string;
    mono: string;
  };
  fontSize: Record<string, string>;
  fontWeight: Record<string, number>;
  lineHeight: Record<string, number>;
  letterSpacing: Record<string, string>;
}

export interface Breakpoints {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

export interface Section {
  id: string;
  type: SectionType;
  name: string;
  content: Record<string, unknown>;
  styles: SectionStyles;
}

export type SectionType =
  | 'navbar'
  | 'hero'
  | 'features'
  | 'pricing'
  | 'testimonials'
  | 'faq'
  | 'cta'
  | 'footer'
  | 'gallery'
  | 'stats'
  | 'content'
  | 'form'
  | 'sidebar'
  | 'header';

export interface SectionStyles {
  backgroundColor?: string;
  textColor?: string;
  padding?: string;
  maxWidth?: string;
  responsive?: Record<string, Record<string, string>>;
}

export interface Page {
  id: string;
  name: string;
  path: string;
  sections: string[];
}

export interface TemplateMetadata {
  industry: string;
  style: string;
  features: string[];
  createdAt: string;
}

export const DEFAULT_BREAKPOINTS: Breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};