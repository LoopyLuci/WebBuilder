// ============================================================================
// Design Engine Module
// Universal styling system that expresses any design and compiles to any CSS strategy
// ============================================================================

import { nanoid } from 'nanoid';
import type {
  DesignSystem,
  DesignTokens,
  Theme,
  ResponsiveConfig,
  AnimationLibrary,
  TypographySystem,
  ColorSystem,
  SpacingSystem,
  ElevationSystem,
  MotionSystem,
  TokenSet,
  TokenValue,
  TokenReference,
  Breakpoint,
  FontFamily,
  TypeScale,
  TextStyle,
  ColorPalette,
  ColorShades,
  GradientSet,
  GridConfig,
  ElevationLevel,
  SpringConfig,
  AnimationPreset,
  TransitionPreset,
  KeyframeSet,
} from '../types/index.js';

// ─── Design Engine ─────────────────────────────────────────────────────────

export class DesignEngine {
  private system: DesignSystem;
  private compiler: CSSCompiler;

  constructor(system?: DesignSystem) {
    this.system = system ?? this.createDefaultSystem();
    this.compiler = new CSSCompiler(this.system);
  }

  /**
   * Get the current design system
   */
  getSystem(): DesignSystem {
    return this.system;
  }

  /**
   * Set the design system
   */
  setSystem(system: DesignSystem): void {
    this.system = system;
    this.compiler = new CSSCompiler(system);
  }

  /**
   * Update design tokens
   */
  updateTokens(tokens: Partial<DesignTokens>): void {
    this.system.tokens = { ...this.system.tokens, ...tokens };
  }

  /**
   * Add a theme
   */
  addTheme(theme: Theme): void {
    this.system.themes.push(theme);
  }

  /**
   * Set the default theme
   */
  setDefaultTheme(themeId: string): void {
    for (const theme of this.system.themes) {
      theme.default = theme.id === themeId;
    }
  }

  /**
   * Get the default theme
   */
  getDefaultTheme(): Theme | undefined {
    return this.system.themes.find(t => t.default) ?? this.system.themes[0];
  }

  /**
   * Generate CSS custom properties
   */
  generateCSSVariables(): string {
    return this.compiler.generateCSSVariables();
  }

  /**
   * Generate Tailwind config
   */
  generateTailwindConfig(): string {
    return this.compiler.generateTailwindConfig();
  }

  /**
   * Generate CSS for a specific component
   */
  generateComponentCSS(componentName: string, variant?: string): string {
    return this.compiler.generateComponentCSS(componentName, variant);
  }

  /**
   * Generate responsive CSS
   */
  generateResponsiveCSS(): string {
    return this.compiler.generateResponsiveCSS();
  }

  /**
   * Compile to CSS string
   */
  compile(options?: CompileOptions): string {
    return this.compiler.compile(options);
  }

  /**
   * Validate the design system
   */
  validate(): DesignValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for required tokens
    const requiredTokens = ['colors.primary', 'colors.secondary', 'fonts.sans', 'spacing.md'];
    for (const token of requiredTokens) {
      if (!this.getTokenValue(token)) {
        warnings.push(`Missing recommended token: ${token}`);
      }
    }

    // Check for contrast issues
    const textColor = this.getTokenValue('semantic.text');
    const bgColor = this.getTokenValue('semantic.background');
    if (textColor && bgColor) {
      const contrast = this.calculateContrast(textColor as string, bgColor as string);
      if (contrast < 4.5) {
        errors.push(`Text contrast ratio ${contrast.toFixed(2)} is below WCAG AA minimum (4.5)`);
      }
    }

    // Check for at least one theme
    if (this.system.themes.length === 0) {
      warnings.push('No themes defined');
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Analyze a design from an image/URL
   */
  async analyze(source: string): Promise<DesignSystem> {
    // This would integrate with an AI vision model
    // For now, return the current system
    return this.system;
  }

  /**
   * Merge two design systems
   */
  merge(other: DesignSystem): DesignSystem {
    return {
      ...this.system,
      tokens: this.mergeTokens(this.system.tokens, other.tokens),
      themes: [...this.system.themes, ...other.themes],
    };
  }

  /**
   * Get a token value by path
   */
  getTokenValue(path: string): string | undefined {
    const parts = path.split('.');
    let current: any = this.system.tokens;

    for (const part of parts) {
      if (current[part] === undefined) return undefined;
      current = current[part];
    }

    return current?.value ?? current;
  }

  /**
   * Set a token value by path
   */
  setTokenValue(path: string, value: string, type: TokenValue['type'] = 'string'): void {
    const parts = path.split('.');
    let current: any = this.system.tokens;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]!;
      if (current[part] === undefined) {
        current[part] = {};
      }
      current = current[part];
    }

    current[parts[parts.length - 1]!] = { value, type, description: '' };
  }

  // ─── Private Methods ──────────────────────────────────────────────────

  /**
   * Create default design system
   */
  private createDefaultSystem(): DesignSystem {
    return {
      id: nanoid(),
      name: 'Default Design System',
      tokens: this.createDefaultTokens(),
      themes: [this.createDefaultTheme()],
      responsive: this.createDefaultResponsive(),
      animations: this.createDefaultAnimations(),
      typography: this.createDefaultTypography(),
      color: this.createDefaultColorSystem(),
      spacing: this.createDefaultSpacing(),
      elevation: this.createDefaultElevation(),
      motion: this.createDefaultMotion(),
    };
  }

  /**
   * Create default tokens
   */
  private createDefaultTokens(): DesignTokens {
    return {
      colors: {
        primary: { value: '#3b82f6', type: 'color', description: 'Primary brand color' },
        secondary: { value: '#8b5cf6', type: 'color', description: 'Secondary brand color' },
        accent: { value: '#f59e0b', type: 'color', description: 'Accent color' },
        success: { value: '#10b981', type: 'color', description: 'Success color' },
        warning: { value: '#f59e0b', type: 'color', description: 'Warning color' },
        error: { value: '#ef4444', type: 'color', description: 'Error color' },
        white: { value: '#ffffff', type: 'color', description: 'White' },
        black: { value: '#000000', type: 'color', description: 'Black' },
      },
      fonts: {
        sans: { value: 'Inter, system-ui, sans-serif', type: 'font', description: 'Primary sans-serif' },
        mono: { value: 'JetBrains Mono, monospace', type: 'font', description: 'Monospace font' },
        display: { value: 'Cal Sans, Inter, sans-serif', type: 'font', description: 'Display font' },
      },
      spacing: {
        '0': { value: '0', type: 'dimension', description: 'No spacing' },
        '1': { value: '0.25rem', type: 'dimension', description: '4px' },
        '2': { value: '0.5rem', type: 'dimension', description: '8px' },
        '4': { value: '1rem', type: 'dimension', description: '16px' },
        '6': { value: '1.5rem', type: 'dimension', description: '24px' },
        '8': { value: '2rem', type: 'dimension', description: '32px' },
        '12': { value: '3rem', type: 'dimension', description: '48px' },
        '16': { value: '4rem', type: 'dimension', description: '64px' },
      },
      sizing: {
        sm: { value: '0.875rem', type: 'dimension', description: 'Small size' },
        base: { value: '1rem', type: 'dimension', description: 'Base size' },
        lg: { value: '1.125rem', type: 'dimension', description: 'Large size' },
        xl: { value: '1.25rem', type: 'dimension', description: 'XL size' },
      },
      borders: {
        thin: { value: '1px solid', type: 'string', description: 'Thin border' },
        medium: { value: '2px solid', type: 'string', description: 'Medium border' },
        thick: { value: '4px solid', type: 'string', description: 'Thick border' },
      },
      shadows: {
        sm: { value: '0 1px 2px rgba(0,0,0,0.05)', type: 'string', description: 'Small shadow' },
        md: { value: '0 4px 6px rgba(0,0,0,0.1)', type: 'string', description: 'Medium shadow' },
        lg: { value: '0 10px 15px rgba(0,0,0,0.1)', type: 'string', description: 'Large shadow' },
        xl: { value: '0 20px 25px rgba(0,0,0,0.15)', type: 'string', description: 'XL shadow' },
      },
      radii: {
        sm: { value: '4px', type: 'dimension', description: 'Small radius' },
        md: { value: '8px', type: 'dimension', description: 'Medium radius' },
        lg: { value: '12px', type: 'dimension', description: 'Large radius' },
        xl: { value: '16px', type: 'dimension', description: 'XL radius' },
        full: { value: '9999px', type: 'dimension', description: 'Full radius' },
      },
      opacity: {
        disabled: { value: '0.5', type: 'number', description: 'Disabled opacity' },
        hover: { value: '0.8', type: 'number', description: 'Hover opacity' },
        overlay: { value: '0.9', type: 'number', description: 'Overlay opacity' },
      },
      semantic: {
        primary: { value: '$colors.primary', description: 'Primary semantic color' },
        secondary: { value: '$colors.secondary', description: 'Secondary semantic color' },
        success: { value: '$colors.success', description: 'Success semantic color' },
        warning: { value: '$colors.warning', description: 'Warning semantic color' },
        error: { value: '$colors.error', description: 'Error semantic color' },
        info: { value: '$colors.primary', description: 'Info semantic color' },
        surface: { value: '#ffffff', description: 'Surface color' },
        text: { value: '#1f2937', description: 'Text color' },
        background: { value: '#f9fafb', description: 'Background color' },
      },
      components: {},
    };
  }

  /**
   * Create default theme
   */
  private createDefaultTheme(): Theme {
    return {
      id: nanoid(),
      name: 'Default',
      mode: 'light',
      tokens: {},
      default: true,
    };
  }

  /**
   * Create default responsive config
   */
  private createDefaultResponsive(): ResponsiveConfig {
    return {
      breakpoints: [
        { name: 'mobile', maxWidth: 639, baseFontSize: 14 },
        { name: 'tablet', minWidth: 640, maxWidth: 1023, baseFontSize: 15 },
        { name: 'desktop', minWidth: 1024, baseFontSize: 16 },
      ],
      defaultBreakpoint: 'mobile',
      strategy: 'mobile-first',
    };
  }

  /**
   * Create default animations
   */
  private createDefaultAnimations(): AnimationLibrary {
    return {
      presets: [
        { id: nanoid(), name: 'fadeIn', duration: '300ms', easing: 'ease-out', properties: { opacity: '0 → 1' } },
        { id: nanoid(), name: 'slideUp', duration: '300ms', easing: 'ease-out', properties: { transform: 'translateY(20px) → translateY(0)' } },
        { id: nanoid(), name: 'scaleIn', duration: '200ms', easing: 'ease-out', properties: { transform: 'scale(0.95) → scale(1)' } },
      ],
      transitions: [
        { id: nanoid(), name: 'default', property: 'all', duration: '150ms', easing: 'ease' },
        { id: nanoid(), name: 'fast', property: 'all', duration: '100ms', easing: 'ease' },
        { id: nanoid(), name: 'slow', property: 'all', duration: '300ms', easing: 'ease' },
      ],
      keyframes: [],
    };
  }

  /**
   * Create default typography
   */
  private createDefaultTypography(): TypographySystem {
    return {
      fontFamilies: [
        { name: 'Inter', family: 'Inter, system-ui, sans-serif', fallback: ['system-ui', 'sans-serif'], category: 'sans-serif' },
        { name: 'JetBrains Mono', family: 'JetBrains Mono, monospace', fallback: ['monospace'], category: 'monospace' },
      ],
      fontSizes: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
      },
      fontWeights: { normal: 400, medium: 500, semibold: 600, bold: 700 },
      lineHeights: { tight: 1.25, normal: 1.5, relaxed: 1.75 },
      letterSpacings: { tight: '-0.025em', normal: '0', wide: '0.025em' },
      textStyles: [],
    };
  }

  /**
   * Create default color system
   */
  private createDefaultColorSystem(): ColorSystem {
    return {
      palette: {
        blue: { 50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a', 950: '#172554' },
        gray: { 50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 400: '#9ca3af', 500: '#6b7280', 600: '#4b5563', 700: '#374151', 800: '#1f2937', 900: '#111827', 950: '#030712' },
        green: { 50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac', 400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d', 800: '#166534', 900: '#14532d', 950: '#052e16' },
        red: { 50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5', 400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c', 800: '#991b1b', 900: '#7f1d1d', 950: '#450a0a' },
      },
      gradients: [],
    };
  }

  /**
   * Create default spacing
   */
  private createDefaultSpacing(): SpacingSystem {
    return {
      scale: {
        '0': '0', '1': '0.25rem', '2': '0.5rem', '4': '1rem',
        '6': '1.5rem', '8': '2rem', '12': '3rem', '16': '4rem',
        '24': '6rem', '32': '8rem',
      },
      grid: { columns: 12, gutter: '1rem', margin: '1.5rem', maxWidth: '1280px' },
    };
  }

  /**
   * Create default elevation
   */
  private createDefaultElevation(): ElevationSystem {
    return {
      levels: [
        { name: 'none', shadow: 'none', zIndex: 0 },
        { name: 'sm', shadow: '0 1px 2px rgba(0,0,0,0.05)', zIndex: 1 },
        { name: 'md', shadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 2 },
        { name: 'lg', shadow: '0 10px 15px rgba(0,0,0,0.1)', zIndex: 3 },
        { name: 'xl', shadow: '0 20px 25px rgba(0,0,0,0.15)', zIndex: 4 },
        { name: '2xl', shadow: '0 25px 50px rgba(0,0,0,0.25)', zIndex: 5 },
      ],
    };
  }

  /**
   * Create default motion
   */
  private createDefaultMotion(): MotionSystem {
    return {
      duration: { fast: '150ms', normal: '300ms', slow: '500ms' },
      easing: { ease: 'cubic-bezier(0.4, 0, 0.2, 1)', spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
      spring: { default: { stiffness: 300, damping: 30, mass: 1 } },
    };
  }

  /**
   * Merge two token sets
   */
  private mergeTokens(base: DesignTokens, override: DesignTokens): DesignTokens {
    const result = { ...base };
    for (const key of Object.keys(override) as (keyof DesignTokens)[]) {
      if (typeof override[key] === 'object' && !Array.isArray(override[key])) {
        (result as any)[key] = { ...(base[key] as any), ...(override[key] as any) };
      } else {
        (result as any)[key] = override[key];
      }
    }
    return result;
  }

  /**
   * Calculate contrast ratio between two colors
   */
  private calculateContrast(color1: string, color2: string): number {
    const lum1 = this.getRelativeLuminance(color1);
    const lum2 = this.getRelativeLuminance(color2);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Get relative luminance of a color
   */
  private getRelativeLuminance(color: string): number {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
}

// ─── CSS Compiler ───────────────────────────────────────────────────────────

class CSSCompiler {
  constructor(private system: DesignSystem) {}

  generateCSSVariables(): string {
    const lines: string[] = [':root {'];
    this.generateTokenVariables(this.system.tokens, '  ', lines);
    lines.push('}');
    return lines.join('\n');
  }

  generateTailwindConfig(): string {
    return `/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: ${JSON.stringify(this.flattenColors(this.system.tokens.colors), null, 6)},
      fontFamily: ${JSON.stringify(this.flattenFonts(this.system.tokens.fonts), null, 6)},
      spacing: ${JSON.stringify(this.flattenScale(this.system.tokens.spacing), null, 6)},
      borderRadius: ${JSON.stringify(this.flattenScale(this.system.tokens.radii), null, 6)},
      boxShadow: ${JSON.stringify(this.flattenScale(this.system.tokens.shadows), null, 6)},
    },
  },
  plugins: [],
};`;
  }

  generateComponentCSS(componentName: string, variant?: string): string {
    const tokens = this.system.tokens;
    let css = `.${componentName} {\n`;
    if (variant) {
      css += `  /* Variant: ${variant} */\n`;
    }
    css += `  /* Generated from design tokens */\n`;
    css += `  color: var(--color-text);\n`;
    css += `  background-color: var(--color-surface);\n`;
    css += `}\n`;
    return css;
  }

  generateResponsiveCSS(): string {
    const lines: string[] = [];
    for (const bp of this.system.responsive.breakpoints) {
      if (bp.minWidth) {
        lines.push(`@media (min-width: ${bp.minWidth}px) {`);
        lines.push(`  /* ${bp.name} styles */`);
        lines.push(`}`);
      }
    }
    return lines.join('\n');
  }

  compile(options?: CompileOptions): string {
    const parts: string[] = [];

    // CSS Variables
    parts.push(this.generateCSSVariables());

    // Responsive
    if (options?.responsive !== false) {
      parts.push(this.generateResponsiveCSS());
    }

    return parts.join('\n\n');
  }

  private generateTokenVariables(tokens: any, indent: string, lines: string[]): void {
    for (const [key, value] of Object.entries(tokens)) {
      if (value && typeof value === 'object' && 'value' in (value as any)) {
        const tokenValue = value as TokenValue;
        lines.push(`${indent}--${key}: ${tokenValue.value};`);
      } else if (typeof value === 'object' && value !== null) {
        this.generateTokenVariables(value, indent, lines);
      }
    }
  }

  private flattenColors(colors: TokenSet): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [name, token] of Object.entries(colors)) {
      if ('value' in token) {
        result[name] = (token as TokenValue).value;
      }
    }
    return result;
  }

  private flattenFonts(fonts: TokenSet): Record<string, string[]> {
    const result: Record<string, string[]> = {};
    for (const [name, token] of Object.entries(fonts)) {
      if ('value' in token) {
        result[name] = (token as TokenValue).value.split(',').map(s => `'${s.trim()}'`);
      }
    }
    return result;
  }

  private flattenScale(scale: TokenSet): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [name, token] of Object.entries(scale)) {
      if ('value' in token) {
        result[name] = (token as TokenValue).value;
      }
    }
    return result;
  }
}

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CompileOptions {
  responsive?: boolean;
  animations?: boolean;
  components?: boolean[];
  format?: 'css' | 'scss' | 'less';
  minify?: boolean;
}

export interface DesignValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ─── Utility Functions ──────────────────────────────────────────────────────

export function createDesignEngine(system?: DesignSystem): DesignEngine {
  return new DesignEngine(system);
}

export function createDesignTokens(overrides?: Partial<DesignTokens>): DesignTokens {
  const engine = new DesignEngine();
  const system = engine.getSystem();
  return { ...system.tokens, ...overrides };
}

export default DesignEngine;
