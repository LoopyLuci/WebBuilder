/**
 * WebBuilder Components - Atomic Badge Component
 * A flexible badge/tag component for status indicators and labels.
 */

import React from 'react';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';
export type BadgeShape = 'rounded' | 'pill' | 'dot';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  shape?: BadgeShape;
  removable?: boolean;
  onRemove?: () => void;
  icon?: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700 border-gray-200',
  primary: 'bg-blue-100 text-blue-700 border-blue-200',
  success: 'bg-green-100 text-green-700 border-green-200',
  warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  danger: 'bg-red-100 text-red-700 border-red-200',
  info: 'bg-cyan-100 text-cyan-700 border-cyan-200',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1 text-sm',
};

const shapeStyles: Record<BadgeShape, string> = {
  rounded: 'rounded',
  pill: 'rounded-full',
  dot: 'rounded-full',
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'default',
      size = 'md',
      shape = 'pill',
      removable = false,
      onRemove,
      icon,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <span
        ref={ref}
        className={[
          'inline-flex items-center gap-1 font-medium border',
          variantStyles[variant],
          sizeStyles[size],
          shapeStyles[shape],
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {shape === 'dot' && (
          <span
            className={[
              'inline-block w-1.5 h-1.5 rounded-full',
              variant === 'default' ? 'bg-gray-500' : '',
              variant === 'primary' ? 'bg-blue-500' : '',
              variant === 'success' ? 'bg-green-500' : '',
              variant === 'warning' ? 'bg-yellow-500' : '',
              variant === 'danger' ? 'bg-red-500' : '',
              variant === 'info' ? 'bg-cyan-500' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-hidden="true"
          />
        )}
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children}
        {removable && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-0.5 -mr-1 p-0.5 rounded-full hover:bg-black/10 focus:outline-none focus:ring-1 focus:ring-current"
            aria-label="Remove"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;