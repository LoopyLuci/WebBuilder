import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const spinnerSizes = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-3',
  xl: 'h-12 w-12 border-4',
};

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: keyof typeof spinnerSizes;
  label?: string;
}

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = 'md', label = 'Loading', ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-label={label}
        className={cn('inline-flex items-center justify-center', className)}
        {...props}
      >
        <div
          className={cn(
            'rounded-full border-current border-t-transparent animate-spin text-primary-500',
            spinnerSizes[size]
          )}
        />
        <span className="sr-only">{label}</span>
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';
export default Spinner;