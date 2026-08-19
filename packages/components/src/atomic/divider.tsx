/**
 * WebBuilder Components - Divider Component
 * A flexible divider with optional label and multiple orientations.
 */

import React from 'react';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerVariant = 'solid' | 'dashed' | 'dotted';

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: DividerOrientation;
  variant?: DividerVariant;
  label?: string;
  labelPosition?: 'left' | 'center' | 'right';
  color?: string;
  spacing?: 'sm' | 'md' | 'lg';
}

const variantStyles: Record<DividerVariant, string> = {
  solid: 'border-solid',
  dashed: 'border-dashed',
  dotted: 'border-dotted',
};

const spacingStyles: Record<string, string> = {
  sm: 'my-2',
  md: 'my-4',
  lg: 'my-8',
};

export const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  (
    {
      orientation = 'horizontal',
      variant = 'solid',
      label,
      labelPosition = 'center',
      color = 'border-gray-200',
      spacing = 'md',
      className = '',
      ...props
    },
    ref
  ) => {
    if (orientation === 'vertical') {
      return (
        <div
          ref={ref}
          className={['inline-flex h-full', spacingStyles[spacing], className]
            .filter(Boolean)
            .join(' ')}
          role="separator"
          {...props}
        >
          <div
            className={['w-px h-full border-l', color, variantStyles[variant]].join(' ')}
          />
        </div>
      );
    }

    if (!label) {
      return (
        <div
          ref={ref}
          className={['w-full', spacingStyles[spacing], className].filter(Boolean).join(' ')}
          role="separator"
          {...props}
        >
          <div
            className={['w-full border-t', color, variantStyles[variant]].join(' ')}
          />
        </div>
      );
    }

    const labelJustify =
      labelPosition === 'left'
        ? 'justify-start'
        : labelPosition === 'right'
          ? 'justify-end'
          : 'justify-center';

    return (
      <div
        ref={ref}
        className={['w-full flex items-center', spacingStyles[spacing], className]
          .filter(Boolean)
          .join(' ')}
        role="separator"
        {...props}
      >
        <div
          className={[
            'flex-1 border-t',
            color,
            variantStyles[variant],
            labelPosition === 'left' ? 'mr-4' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        />
        <span className={['px-3 text-sm text-gray-500 font-medium', labelJustify].join(' ')}>
          {label}
        </span>
        <div
          className={[
            'flex-1 border-t',
            color,
            variantStyles[variant],
            labelPosition === 'right' ? 'ml-4' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        />
      </div>
    );
  }
);

Divider.displayName = 'Divider';

export default Divider;