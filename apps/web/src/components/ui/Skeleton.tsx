import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: number | string;
  height?: number | string;
  lines?: number;
  animated?: boolean;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'text', width, height, lines = 1, animated = true, ...props }, ref) => {
    const base = cn(
      'rounded bg-muted',
      animated && 'animate-pulse',
    );

    if (variant === 'text' && lines > 1) {
      return (
        <div ref={ref} className={cn('space-y-2', className)} {...props}>
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={cn(base, 'h-4')}
              style={{ width: i === lines - 1 ? '75%' : '100%' }}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        aria-hidden="true"
        aria-label="Loading..."
        role="status"
        className={cn(
          base,
          variant === 'circular' && 'rounded-full',
          variant === 'rectangular' && 'rounded-none',
          className
        )}
        style={{ width, height: height ?? (variant === 'circular' ? width : variant === 'text' ? '1rem' : '8rem') }}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';
export default Skeleton;