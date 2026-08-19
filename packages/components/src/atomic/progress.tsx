/**
 * WebBuilder Components - Progress Component
 * A progress bar with multiple variants, sizes, and animations.
 */

import React from 'react';

export type ProgressVariant = 'default' | 'success' | 'warning' | 'danger';
export type ProgressSize = 'sm' | 'md' | 'lg';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  variant?: ProgressVariant;
  size?: ProgressSize;
  showLabel?: boolean;
  animated?: boolean;
  striped?: boolean;
  label?: string;
}

const variantStyles: Record<ProgressVariant, string> = {
  default: 'bg-blue-600',
  success: 'bg-green-600',
  warning: 'bg-yellow-500',
  danger: 'bg-red-600',
};

const sizeStyles: Record<ProgressSize, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      value,
      max = 100,
      variant = 'default',
      size = 'md',
      showLabel = false,
      animated = false,
      striped = false,
      label,
      className = '',
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div
        ref={ref}
        className={['w-full', className].filter(Boolean).join(' ')}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || `Progress: ${percentage}%`}
        {...props}
      >
        {showLabel && (
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">{label || 'Progress'}</span>
            <span className="text-sm font-medium text-gray-500">{Math.round(percentage)}%</span>
          </div>
        )}
        <div className={['w-full bg-gray-200 rounded-full overflow-hidden', sizeStyles[size]].join(' ')}>
          <div
            className={[
              'h-full rounded-full transition-all duration-500 ease-out',
              variantStyles[variant],
              striped ? 'bg-[length:1rem_1rem] bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)]' : '',
              animated ? 'animate-[progress-stripes_1s_linear_infinite]' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export default Progress;