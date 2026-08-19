import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const containerSizes = {
  sm: 'py-8',
  md: 'py-12',
  lg: 'py-16',
};

const iconSizes = {
  sm: 'h-10 w-10',
  md: 'h-14 w-14',
  lg: 'h-20 w-20',
};

const titleSizes = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl',
};

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon, title, description, action, size = 'md', ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-label={title}
        className={cn(
          'flex flex-col items-center justify-center text-center',
          containerSizes[size],
          className
        )}
        {...props}
      >
        {icon && (
          <div
            className={cn(
              'mb-4 flex items-center justify-center rounded-full bg-muted text-muted-foreground',
              iconSizes[size]
            )}
          >
            {React.isValidElement(icon)
              ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
                  className: cn(
                    size === 'sm' ? 'h-5 w-5' : size === 'md' ? 'h-7 w-7' : 'h-10 w-10',
                    (icon.props as { className?: string })?.className
                  ),
                })
              : icon}
          </div>
        )}
        <h3 className={cn('font-semibold text-foreground', titleSizes[size])}>
          {title}
        </h3>
        {description && (
          <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
            {description}
          </p>
        )}
        {action && (
          <div className="mt-4">
            {action}
          </div>
        )}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';
export default EmptyState;