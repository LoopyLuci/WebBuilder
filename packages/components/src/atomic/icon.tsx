/**
 * WebBuilder Components - Icon Component
 * A flexible icon component with multiple sizes and colors.
 */

import React from 'react';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name?: string;
  size?: IconSize;
  color?: string;
  icon?: React.ReactNode;
}

const sizeStyles: Record<IconSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
  '2xl': 'w-10 h-10',
};

export const Icon = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ name, size = 'md', color, icon, className = '', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={['inline-flex items-center justify-center', sizeStyles[size], className]
          .filter(Boolean)
          .join(' ')}
        style={color ? { color } : undefined}
        aria-hidden="true"
        {...props}
      >
        {icon || (
          <svg
            className="w-full h-full"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
      </span>
    );
  }
);

Icon.displayName = 'Icon';

export default Icon;