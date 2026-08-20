// ============================================================================
// CSS Generation Utilities
// Generate CSS variables, classes, and Tailwind configs from style state
// ============================================================================

import type {
  StyleState,
  ShadowLayer,
  SpacingValues,
  BorderRadiusValues,
  SpacingUnit,
} from '../types.js';

/**
 * Generate CSS custom properties from style state
 */
export function generateCSSVariables(state: StyleState): string {
  const lines: string[] = [':root {'];

  // Colors
  lines.push('  /* Colors */');
  lines.push(`  --color-primary: ${state.colors.primary};`);
  lines.push(`  --color-secondary: ${state.colors.secondary};`);
  lines.push(`  --color-accent: ${state.colors.accent};`);
  lines.push(`  --color-background: ${state.colors.background};`);
  lines.push(`  --color-text: ${state.colors.text};`);

  for (const [key, value] of Object.entries(state.colors.custom)) {
    lines.push(`  --color-${key}: ${value};`);
  }

  // Typography
  lines.push('');
  lines.push('  /* Typography */');
  lines.push(`  --font-heading: ${state.typography.headingFont};`);
  lines.push(`  --font-body: ${state.typography.bodyFont};`);
  if (state.typography.accentFont) {
    lines.push(`  --font-accent: ${state.typography.accentFont};`);
  }
  lines.push(`  --font-size-base: ${state.typography.baseSize}px;`);
  lines.push(`  --font-scale: ${state.typography.scale};`);
  lines.push(`  --line-height: ${state.typography.lineHeight};`);
  lines.push(`  --letter-spacing: ${state.typography.letterSpacing}em;`);

  // Spacing
  lines.push('');
  lines.push('  /* Spacing */');
  lines.push(`  --spacing-unit: ${state.spacing.unit}`);
  lines.push(`  --spacing-gap: ${state.spacing.gap}${state.spacing.unit}`);
  lines.push(`  --padding-top: ${state.spacing.padding.top}${state.spacing.padding.unit}`);
  lines.push(`  --padding-right: ${state.spacing.padding.right}${state.spacing.padding.unit}`);
  lines.push(`  --padding-bottom: ${state.spacing.padding.bottom}${state.spacing.padding.unit}`);
  lines.push(`  --padding-left: ${state.spacing.padding.left}${state.spacing.padding.unit}`);
  lines.push(`  --margin-top: ${state.spacing.margin.top}${state.spacing.margin.unit}`);
  lines.push(`  --margin-right: ${state.spacing.margin.right}${state.spacing.margin.unit}`);
  lines.push(`  --margin-bottom: ${state.spacing.margin.bottom}${state.spacing.margin.unit}`);
  lines.push(`  --margin-left: ${state.spacing.margin.left}${state.spacing.margin.unit}`);

  // Shadows
  if (state.shadows.layers.length > 0) {
    lines.push('');
    lines.push('  /* Shadows */');
    lines.push(`  --shadow: ${generateShadowCSS(state.shadows.layers)};`);
  }

  // Border Radius
  const br = state.borderRadius.values;
  lines.push('');
  lines.push('  /* Border Radius */');
  lines.push(`  --radius-tl: ${br.topLeft}${br.unit}`);
  lines.push(`  --radius-tr: ${br.topRight}${br.unit}`);
  lines.push(`  --radius-br: ${br.bottomRight}${br.unit}`);
  lines.push(`  --radius-bl: ${br.bottomLeft}${br.unit}`);
  lines.push(`  --radius: ${br.topLeft}${br.unit}`);

  lines.push('}');
  return lines.join('\n');
}

/**
 * Generate CSS class definitions from style state
 */
export function generateCSSClasses(state: StyleState): string {
  const lines: string[] = [];

  // Base container
  lines.push('.style-container {');
  lines.push(`  color: ${state.colors.text};`);
  lines.push(`  background-color: ${state.colors.background};`);
  lines.push(`  font-family: ${state.typography.bodyFont};`);
  lines.push(`  font-size: ${state.typography.baseSize}px;`);
  lines.push(`  line-height: ${state.typography.lineHeight};`);
  lines.push(`  letter-spacing: ${state.typography.letterSpacing}em;`);
  lines.push('}');

  // Headings
  lines.push('');
  lines.push('.style-heading {');
  lines.push(`  font-family: ${state.typography.headingFont};`);
  lines.push(`  color: ${state.colors.text};`);
  lines.push(`  line-height: 1.2;`);
  lines.push('}');

  if (state.typography.accentFont) {
    lines.push('');
    lines.push('.style-accent {');
    lines.push(`  font-family: ${state.typography.accentFont};`);
    lines.push('}');
  }

  // Card component
  lines.push('');
  lines.push('.style-card {');
  lines.push(`  background-color: ${state.colors.background};`);
  lines.push(`  color: ${state.colors.text};`);
  lines.push(`  padding: ${formatSpacing(state.spacing.padding)};`);
  lines.push(`  margin: ${formatSpacing(state.spacing.margin)};`);
  lines.push(`  border-radius: ${formatBorderRadius(state.borderRadius.values)};`);
  lines.push(`  box-shadow: ${generateShadowCSS(state.shadows.layers)};`);
  lines.push('}');

  // Button component
  lines.push('');
  lines.push('.style-button {');
  lines.push(`  background-color: ${state.colors.primary};`);
  lines.push(`  color: ${getContrastColor(state.colors.primary)};`);
  lines.push(`  font-family: ${state.typography.bodyFont};`);
  lines.push(`  padding: ${state.spacing.padding.top}${state.spacing.padding.unit} ${state.spacing.padding.right}${state.spacing.padding.unit};`);
  lines.push(`  border-radius: ${state.borderRadius.values.topLeft}${state.borderRadius.values.unit};`);
  lines.push(`  border: none;`);
  lines.push(`  cursor: pointer;`);
  if (state.shadows.layers.length > 0) {
    lines.push(`  box-shadow: ${generateShadowCSS(state.shadows.layers)};`);
  }
  lines.push('}');

  return lines.join('\n');
}

/**
 * Generate Tailwind config extension
 */
export function generateTailwindExtension(state: StyleState): string {
  const config = {
    theme: {
      extend: {
        colors: {
          primary: state.colors.primary,
          secondary: state.colors.secondary,
          accent: state.colors.accent,
          surface: state.colors.background,
          foreground: state.colors.text,
          ...Object.fromEntries(
            Object.entries(state.colors.custom).map(([k, v]) => [k, v])
          ),
        },
        fontFamily: {
          heading: [state.typography.headingFont, 'system-ui', 'sans-serif'],
          body: [state.typography.bodyFont, 'system-ui', 'sans-serif'],
          ...(state.typography.accentFont
            ? { accent: [state.typography.accentFont, 'system-ui', 'sans-serif'] }
            : {}),
        },
        fontSize: {
          base: `${state.typography.baseSize}px`,
        },
        lineHeight: {
          base: String(state.typography.lineHeight),
        },
        letterSpacing: {
          base: `${state.typography.letterSpacing}em`,
        },
        spacing: {
          gap: `${state.spacing.gap}${state.spacing.unit}`,
        },
        boxShadow: {
          custom: generateShadowCSS(state.shadows.layers),
        },
        borderRadius: {
          custom: formatBorderRadius(state.borderRadius.values),
        },
      },
    },
  };

  return `/** @type {import('tailwindcss').Config} */\nmodule.exports = ${JSON.stringify(config, null, 2)};`;
}

/**
 * Generate complete CSS output
 */
export function generateCompleteCSS(state: StyleState): { variables: string; classes: string; raw: string; tailwind: string } {
  const variables = generateCSSVariables(state);
  const classes = generateCSSClasses(state);
  const tailwind = generateTailwindExtension(state);
  const raw = `${variables}\n\n${classes}`;

  return { variables, classes, raw, tailwind };
}

/**
 * Generate shadow CSS from shadow layers
 */
export function generateShadowCSS(layers: ShadowLayer[]): string {
  if (layers.length === 0) return 'none';

  return layers
    .filter((l) => l.enabled)
    .map((layer) => {
      const color = hexToRgba(layer.color, layer.opacity);
      const inset = layer.inset ? 'inset ' : '';
      return `${inset}${layer.offsetX}px ${layer.offsetY}px ${layer.blur}px ${layer.spread}px ${color}`;
    })
    .join(', ');
}

/**
 * Format spacing values as CSS string
 */
export function formatSpacing(values: SpacingValues): string {
  if (values.linked) {
    const v = values.top;
    return `${v}${values.unit}`;
  }
  return `${values.top}${values.unit} ${values.right}${values.unit} ${values.bottom}${values.unit} ${values.left}${values.unit}`;
}

/**
 * Format border radius as CSS string
 */
export function formatBorderRadius(values: BorderRadiusValues): string {
  if (values.linked) {
    return `${values.topLeft}${values.unit}`;
  }
  return `${values.topLeft}${values.unit} ${values.topRight}${values.unit} ${values.bottomRight}${values.unit} ${values.bottomLeft}${values.unit}`;
}

/**
 * Convert hex color to rgba string
 */
function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Get contrasting text color
 */
function getContrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

/**
 * Generate inline style string from style state (for React/CSS-in-JS)
 */
export function generateInlineStyles(state: StyleState): Record<string, string> {
  return {
    color: state.colors.text,
    backgroundColor: state.colors.background,
    fontFamily: state.typography.bodyFont,
    fontSize: `${state.typography.baseSize}px`,
    lineHeight: String(state.typography.lineHeight),
    letterSpacing: `${state.typography.letterSpacing}em`,
    padding: formatSpacing(state.spacing.padding),
    margin: formatSpacing(state.spacing.margin),
    borderRadius: formatBorderRadius(state.borderRadius.values),
    boxShadow: generateShadowCSS(state.shadows.layers),
  };
}

/**
 * Generate spacing CSS value
 */
export function generateSpacingValue(value: number, unit: SpacingUnit): string {
  return `${value}${unit}`;
}