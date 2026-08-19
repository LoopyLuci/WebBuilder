import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = {
  primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
  success: 'bg-success-50 text-success-700 dark:bg-success-700/20 dark:text-success-500',
  warning: 'bg-warning-50 text-warning-700 dark:bg-warning-700/20 dark:text-warning-500',
  error: 'bg-error-50 text-error-700 dark:bg-error-700/20 dark:text-error-500',
  default: 'bg-muted text-muted-foreground',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof badgeVariants;
  dot?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'primary', dot = false, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
          'transition-colors duration-150',
          badgeVariants[variant],
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              variant === 'primary' && 'bg-primary-500',
              variant === 'success' && 'bg-success-500',
              variant === 'warning' && 'bg-warning-500',
              variant === 'error' && 'bg-error-500',
              variant === 'default' && 'bg-muted-foreground'
            )}
            aria-hidden="true"
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
export default Badge;