// ============================================================================
// Component Generator
// Procedural generation of UI components with variants and props
// ============================================================================

import { PRNG } from './prng.js';
import type { GeneratedColor } from './color.js';

export interface GeneratedComponent {
  id: string;
  name: string;
  category: string;
  description: string;
  props: ComponentProp[];
  variants: ComponentVariant[];
  styles: ComponentStyles;
  code: string;
}

export interface ComponentProp {
  name: string;
  type: string;
  description: string;
  required: boolean;
  defaultValue?: string;
}

export interface ComponentVariant {
  name: string;
  description: string;
  styles: Record<string, string>;
  props?: Record<string, string>;
}

export interface ComponentStyles {
  base: string;
  variants: Record<string, string>;
  sizes: Record<string, string>;
  responsive: Record<string, string>;
}

export interface ComponentGenOptions {
  componentType?: 'button' | 'card' | 'input' | 'badge' | 'alert' | 'avatar' | 'accordion' | 'tabs' | 'modal' | 'tooltip';
  variantCount?: number;
  sizeVariants?: boolean;
  colorOverrides?: {
    primary?: GeneratedColor;
    secondary?: GeneratedColor;
  };
  complexity?: 'simple' | 'standard' | 'complex';
}

// Component templates
const COMPONENT_TEMPLATES = {
  button: {
    name: 'Button',
    category: 'interactive',
    description: 'A clickable button component',
    props: [
      { name: 'children', type: 'ReactNode', description: 'Button content', required: true },
      { name: 'onClick', type: '() => void', description: 'Click handler', required: false },
      { name: 'disabled', type: 'boolean', description: 'Disabled state', required: false, defaultValue: 'false' },
      { name: 'loading', type: 'boolean', description: 'Loading state', required: false, defaultValue: 'false' },
      { name: 'type', type: '"button" | "submit" | "reset"', description: 'Button type', required: false, defaultValue: '"button"' },
    ],
    variants: [
      { name: 'primary', description: 'Primary action button', styles: { backgroundColor: 'var(--color-primary)', color: 'white' } },
      { name: 'secondary', description: 'Secondary action button', styles: { backgroundColor: 'var(--color-secondary)', color: 'white' } },
      { name: 'outline', description: 'Outlined button', styles: { backgroundColor: 'transparent', border: '2px solid var(--color-primary)', color: 'var(--color-primary)' } },
      { name: 'ghost', description: 'Minimal button', styles: { backgroundColor: 'transparent', color: 'var(--color-primary)' } },
      { name: 'danger', description: 'Destructive action button', styles: { backgroundColor: 'var(--color-error)', color: 'white' } },
      { name: 'link', description: 'Link-styled button', styles: { backgroundColor: 'transparent', color: 'var(--color-primary)', textDecoration: 'underline' } },
    ],
    sizes: {
      sm: { padding: '0.375rem 0.75rem', fontSize: '0.875rem', minHeight: '2rem' },
      md: { padding: '0.5rem 1rem', fontSize: '1rem', minHeight: '2.5rem' },
      lg: { padding: '0.75rem 1.5rem', fontSize: '1.125rem', minHeight: '3rem' },
      xl: { padding: '1rem 2rem', fontSize: '1.25rem', minHeight: '3.5rem' },
    },
  },
  card: {
    name: 'Card',
    category: 'display',
    description: 'A container for content with optional header and footer',
    props: [
      { name: 'children', type: 'ReactNode', description: 'Card content', required: true },
      { name: 'title', type: 'string', description: 'Card title', required: false },
      { name: 'subtitle', type: 'string', description: 'Card subtitle', required: false },
      { name: 'image', type: 'string', description: 'Card image URL', required: false },
      { name: 'footer', type: 'ReactNode', description: 'Card footer content', required: false },
    ],
    variants: [
      { name: 'elevated', description: 'Card with shadow', styles: { boxShadow: '0 4px 6px rgba(0,0,0,0.1)' } },
      { name: 'outlined', description: 'Card with border', styles: { border: '1px solid var(--color-neutral-200)' } },
      { name: 'filled', description: 'Card with background', styles: { backgroundColor: 'var(--color-neutral-50)' } },
      { name: 'interactive', description: 'Hoverable card', styles: { cursor: 'pointer', transition: 'all 0.2s' } },
    ],
    sizes: {
      sm: { padding: '1rem', maxWidth: '20rem' },
      md: { padding: '1.5rem', maxWidth: '28rem' },
      lg: { padding: '2rem', maxWidth: '36rem' },
      xl: { padding: '2.5rem', maxWidth: '48rem' },
    },
  },
  input: {
    name: 'Input',
    category: 'form',
    description: 'A text input field',
    props: [
      { name: 'value', type: 'string', description: 'Input value', required: false },
      { name: 'onChange', type: '(e: ChangeEvent) => void', description: 'Change handler', required: false },
      { name: 'placeholder', type: 'string', description: 'Placeholder text', required: false },
      { name: 'disabled', type: 'boolean', description: 'Disabled state', required: false },
      { name: 'error', type: 'string', description: 'Error message', required: false },
      { name: 'label', type: 'string', description: 'Input label', required: false },
    ],
    variants: [
      { name: 'default', description: 'Default input', styles: { border: '1px solid var(--color-neutral-300)' } },
      { name: 'filled', description: 'Filled background', styles: { backgroundColor: 'var(--color-neutral-100)', border: 'none' } },
      { name: 'flushed', description: 'Bottom border only', styles: { borderBottom: '2px solid var(--color-neutral-300)', borderRadius: '0' } },
      { name: 'unstyled', description: 'No visible styling', styles: { border: 'none', backgroundColor: 'transparent' } },
    ],
    sizes: {
      sm: { padding: '0.375rem 0.5rem', fontSize: '0.875rem' },
      md: { padding: '0.5rem 0.75rem', fontSize: '1rem' },
      lg: { padding: '0.75rem 1rem', fontSize: '1.125rem' },
      xl: { padding: '1rem 1.25rem', fontSize: '1.25rem' },
    },
  },
  badge: {
    name: 'Badge',
    category: 'display',
    description: 'A small status indicator',
    props: [
      { name: 'children', type: 'ReactNode', description: 'Badge content', required: true },
      { name: 'dot', type: 'boolean', description: 'Show dot indicator', required: false },
      { name: 'onRemove', type: '() => void', description: 'Remove handler', required: false },
    ],
    variants: [
      { name: 'default', description: 'Default badge', styles: { backgroundColor: 'var(--color-neutral-100)', color: 'var(--color-neutral-800)' } },
      { name: 'primary', description: 'Primary badge', styles: { backgroundColor: 'var(--color-primary)', color: 'white' } },
      { name: 'success', description: 'Success badge', styles: { backgroundColor: 'var(--color-success)', color: 'white' } },
      { name: 'warning', description: 'Warning badge', styles: { backgroundColor: 'var(--color-warning)', color: 'white' } },
      { name: 'error', description: 'Error badge', styles: { backgroundColor: 'var(--color-error)', color: 'white' } },
      { name: 'outline', description: 'Outlined badge', styles: { border: '1px solid currentColor', backgroundColor: 'transparent' } },
    ],
    sizes: {
      sm: { padding: '0.125rem 0.375rem', fontSize: '0.75rem' },
      md: { padding: '0.25rem 0.5rem', fontSize: '0.875rem' },
      lg: { padding: '0.375rem 0.75rem', fontSize: '1rem' },
      xl: { padding: '0.5rem 1rem', fontSize: '1.125rem' },
    },
  },
  alert: {
    name: 'Alert',
    category: 'feedback',
    description: 'An alert message component',
    props: [
      { name: 'children', type: 'ReactNode', description: 'Alert content', required: true },
      { name: 'title', type: 'string', description: 'Alert title', required: false },
      { name: 'icon', type: 'ReactNode', description: 'Alert icon', required: false },
      { name: 'onClose', type: '() => void', description: 'Close handler', required: false },
    ],
    variants: [
      { name: 'info', description: 'Informational alert', styles: { backgroundColor: 'var(--color-info-50)', borderColor: 'var(--color-info)' } },
      { name: 'success', description: 'Success alert', styles: { backgroundColor: 'var(--color-success-50)', borderColor: 'var(--color-success)' } },
      { name: 'warning', description: 'Warning alert', styles: { backgroundColor: 'var(--color-warning-50)', borderColor: 'var(--color-warning)' } },
      { name: 'error', description: 'Error alert', styles: { backgroundColor: 'var(--color-error-50)', borderColor: 'var(--color-error)' } },
    ],
    sizes: {
      sm: { padding: '0.5rem', fontSize: '0.875rem' },
      md: { padding: '0.75rem', fontSize: '1rem' },
      lg: { padding: '1rem', fontSize: '1.125rem' },
      xl: { padding: '1.25rem', fontSize: '1.25rem' },
    },
  },
  avatar: {
    name: 'Avatar',
    category: 'display',
    description: 'An avatar image with fallback',
    props: [
      { name: 'src', type: 'string', description: 'Image source URL', required: false },
      { name: 'alt', type: 'string', description: 'Alt text', required: false },
      { name: 'fallback', type: 'ReactNode', description: 'Fallback content', required: false },
    ],
    variants: [
      { name: 'circle', description: 'Circular avatar', styles: { borderRadius: '50%' } },
      { name: 'square', description: 'Square avatar', styles: { borderRadius: '0.5rem' } },
      { name: 'rounded', description: 'Rounded square avatar', styles: { borderRadius: '0.75rem' } },
    ],
    sizes: {
      sm: { width: '2rem', height: '2rem', fontSize: '0.75rem' },
      md: { width: '2.5rem', height: '2.5rem', fontSize: '0.875rem' },
      lg: { width: '3.5rem', height: '3.5rem', fontSize: '1.125rem' },
      xl: { width: '5rem', height: '5rem', fontSize: '1.5rem' },
    },
  },
  accordion: {
    name: 'Accordion',
    category: 'interactive',
    description: 'Collapsible content sections',
    props: [
      { name: 'items', type: 'AccordionItem[]', description: 'Accordion items', required: true },
      { name: 'multiple', type: 'boolean', description: 'Allow multiple open', required: false },
      { name: 'defaultOpen', type: 'number[]', description: 'Default open indices', required: false },
    ],
    variants: [
      { name: 'default', description: 'Default accordion', styles: { border: '1px solid var(--color-neutral-200)' } },
      { name: 'separated', description: 'Separated items', styles: { gap: '0.5rem' } },
      { name: 'filled', description: 'Filled background', styles: { backgroundColor: 'var(--color-neutral-50)' } },
    ],
    sizes: {
      sm: { padding: '0.5rem', fontSize: '0.875rem' },
      md: { padding: '0.75rem', fontSize: '1rem' },
      lg: { padding: '1rem', fontSize: '1.125rem' },
      xl: { padding: '1.25rem', fontSize: '1.25rem' },
    },
  },
  tabs: {
    name: 'Tabs',
    category: 'navigation',
    description: 'Tab navigation component',
    props: [
      { name: 'items', type: 'TabItem[]', description: 'Tab items', required: true },
      { name: 'activeTab', type: 'number', description: 'Active tab index', required: false },
      { name: 'onChange', type: '(index: number) => void', description: 'Tab change handler', required: false },
    ],
    variants: [
      { name: 'default', description: 'Default tabs', styles: { borderBottom: '1px solid var(--color-neutral-200)' } },
      { name: 'enclosed', description: 'Enclosed tabs', styles: { border: '1px solid var(--color-neutral-200)', borderRadius: '0.5rem' } },
      { name: 'unstyled', description: 'Minimal tabs', styles: {} },
    ],
    sizes: {
      sm: { padding: '0.375rem 0.75rem', fontSize: '0.875rem' },
      md: { padding: '0.5rem 1rem', fontSize: '1rem' },
      lg: { padding: '0.75rem 1.5rem', fontSize: '1.125rem' },
      xl: { padding: '1rem 2rem', fontSize: '1.25rem' },
    },
  },
  modal: {
    name: 'Modal',
    category: 'overlay',
    description: 'A modal dialog overlay',
    props: [
      { name: 'isOpen', type: 'boolean', description: 'Modal open state', required: true },
      { name: 'onClose', type: '() => void', description: 'Close handler', required: true },
      { name: 'children', type: 'ReactNode', description: 'Modal content', required: true },
      { name: 'title', type: 'string', description: 'Modal title', required: false },
    ],
    variants: [
      { name: 'default', description: 'Default modal', styles: { backgroundColor: 'white', borderRadius: '0.75rem' } },
      { name: 'flat', description: 'Flat modal', styles: { backgroundColor: 'white' } },
      { name: 'elevated', description: 'Elevated modal', styles: { backgroundColor: 'white', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' } },
    ],
    sizes: {
      sm: { maxWidth: '24rem', padding: '1rem' },
      md: { maxWidth: '32rem', padding: '1.5rem' },
      lg: { maxWidth: '48rem', padding: '2rem' },
      xl: { maxWidth: '64rem', padding: '2.5rem' },
    },
  },
  tooltip: {
    name: 'Tooltip',
    category: 'overlay',
    description: 'A tooltip popup',
    props: [
      { name: 'content', type: 'ReactNode', description: 'Tooltip content', required: true },
      { name: 'children', type: 'ReactNode', description: 'Trigger element', required: true },
      { name: 'position', type: '"top" | "bottom" | "left" | "right"', description: 'Tooltip position', required: false },
    ],
    variants: [
      { name: 'dark', description: 'Dark tooltip', styles: { backgroundColor: 'var(--color-neutral-900)', color: 'white' } },
      { name: 'light', description: 'Light tooltip', styles: { backgroundColor: 'white', color: 'var(--color-neutral-900)', border: '1px solid var(--color-neutral-200)' } },
    ],
    sizes: {
      sm: { padding: '0.25rem 0.5rem', fontSize: '0.75rem' },
      md: { padding: '0.375rem 0.75rem', fontSize: '0.875rem' },
      lg: { padding: '0.5rem 1rem', fontSize: '1rem' },
      xl: { padding: '0.75rem 1.25rem', fontSize: '1.125rem' },
    },
  },
};

/**
 * Generate a component with procedural variants
 */
export function generateComponent(seed: string, options: ComponentGenOptions = {}): GeneratedComponent {
  const {
    componentType = 'button',
    variantCount = 4,
    sizeVariants = true,
    complexity = 'standard',
  } = options;

  const prng = new PRNG(seed);
  const template = COMPONENT_TEMPLATES[componentType] || COMPONENT_TEMPLATES.button;

  // Select variants
  const selectedVariants = prng.pickN(template.variants, Math.min(variantCount, template.variants.length));

  // Generate sizes
  const sizes: Record<string, string> = {};
  if (sizeVariants) {
    for (const [name, styles] of Object.entries(template.sizes)) {
      sizes[name] = Object.entries(styles)
        .map(([k, v]) => `${k}: ${v}`)
        .join('; ');
    }
  }

  // Generate component code
  const code = generateComponentCode(template, selectedVariants, sizes, complexity);

  return {
    id: `${componentType}-${prng.int(1000, 9999)}`,
    name: template.name,
    category: template.category,
    description: template.description,
    props: template.props,
    variants: selectedVariants,
    styles: {
      base: generateBaseStyles(template, complexity),
      variants: Object.fromEntries(selectedVariants.map(v => [v.name, Object.entries(v.styles).map(([k, val]) => `${k}: ${val}`).join('; ')])),
      sizes,
      responsive: {
        mobile: 'width: 100%',
        tablet: 'max-width: 768px',
        desktop: 'max-width: 1024px',
      },
    },
    code,
  };
}

/**
 * Generate base styles for a component
 */
function generateBaseStyles(template: any, complexity: string): string {
  const baseStyles: Record<string, string> = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'inherit',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    border: 'none',
    outline: 'none',
  };

  if (complexity === 'complex') {
    baseStyles['position'] = 'relative';
    baseStyles['overflow'] = 'hidden';
    baseStyles['userSelect'] = 'none';
  }

  return Object.entries(baseStyles)
    .map(([k, v]) => `${k}: ${v}`)
    .join('; ');
}

/**
 * Generate React component code
 */
function generateComponentCode(
  template: any,
  variants: any[],
  sizes: Record<string, string>,
  complexity: string
): string {
  const componentName = template.name;
  const variantNames = variants.map(v => `'${v.name}'`).join(' | ');
  const sizeNames = Object.keys(sizes).map(s => `'${s}'`).join(' | ');

  let code = `import React from 'react';\n\n`;
  code += `export interface ${componentName}Props {\n`;
  for (const prop of template.props) {
    const optional = prop.required ? '' : '?';
    code += `  ${prop.name}${optional}: ${prop.type}; // ${prop.description}\n`;
  }
  code += `  variant?: ${variantNames};\n`;
  code += `  size?: ${sizeNames};\n`;
  code += `}\n\n`;

  code += `export function ${componentName}({\n`;
  for (const prop of template.props) {
    if (prop.defaultValue) {
      code += `  ${prop.name} = ${prop.defaultValue},\n`;
    } else {
      code += `  ${prop.name},\n`;
    }
  }
  code += `  variant = '${variants[0]?.name || 'default'}',\n`;
  code += `  size = 'md',\n`;
  code += `}: ${componentName}Props) {\n`;

  if (complexity === 'simple') {
    code += `  return <div className={\`\${variant} \${size}\`}>{children}</div>;\n`;
  } else {
    code += `  const baseStyles = \`${generateBaseStyles(template, complexity)}\`;\n`;
    code += `  const variantStyles = variants[variant] || {};\n`;
    code += `  const sizeStyles = sizes[size] || {};\n`;
    code += `  return (\n`;
    code += `    <div\n`;
    code += `      style={{ ...baseStyles, ...variantStyles, ...sizeStyles }}\n`;
    code += `      {...props}\n`;
    code += `    >\n`;
    code += `      {children}\n`;
    code += `    </div>\n`;
    code += `  );\n`;
  }

  code += `}\n`;

  return code;
}

/**
 * Generate multiple components at once
 */
export function generateComponentSet(seed: string, types: string[]): GeneratedComponent[] {
  const prng = new PRNG(seed);
  return types.map((type, i) => {
    const componentSeed = prng.fork(`component-${i}`);
    return generateComponent(componentSeed.getState().toString(), {
      componentType: type as any,
    });
  });
}