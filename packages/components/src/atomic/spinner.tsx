/**
 * WebBuilder Components - Spinner Component
 * A loading spinner with multiple sizes and colors.
 */

import React from 'react';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize;
  color?: string;
  label?: string;
}

const sizeStyles: Record<SpinnerSize, string> = {
  xs: 'w-3 h-3 border',
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-3',
  xl: 'w-12 h-12 border-4',
};

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = 'md', color = 'border-blue-600', label = 'Loading...', className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={['inline-flex items-center gap-2', className].filter(Boolean).join(' ')}
        role="status"
        aria-label={label}
        {...props}
      >
        <div
          className={[
            'rounded-full border-gray-200 animate-spin',
            sizeStyles[size],
            color,
          ].join(' ')}
          style={{ borderTopColor: 'transparent' }}
        />
        <span className="sr-only">{label}</span>
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';

export default Spinner;