import React, { forwardRef, useId, useState } from 'react';
import { cn } from '@/lib/utils';

export interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  error?: string;
}

const toggleSizes = {
  sm: { track: 'h-4 w-7', thumb: 'h-3 w-3', translate: 'translate-x-3' },
  md: { track: 'h-5 w-9', thumb: 'h-4 w-4', translate: 'translate-x-4' },
  lg: { track: 'h-6 w-11', thumb: 'h-5 w-5', translate: 'translate-x-5' },
};

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ className, id, label, description, size = 'md', checked, disabled, error, onChange, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const [internalChecked, setInternalChecked] = useState(checked || false);
    const isControlled = checked !== undefined;
    const currentChecked = isControlled ? checked : internalChecked;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) setInternalChecked(e.target.checked);
      onChange?.(e);
    };

    return (
      <div className={cn('flex items-start gap-3', className)}>
        <button
          type="button"
          role="switch"
          id={inputId}
          aria-checked={currentChecked}
          aria-disabled={disabled}
          aria-invalid={!!error}
          disabled={disabled}
          onClick={() => {
            if (!disabled) {
              const newChecked = !currentChecked;
              if (!isControlled) setInternalChecked(newChecked);
              onChange?.({ target: { checked: newChecked } } as any);
            }
          }}
          className={cn(
            'relative inline-flex shrink-0 cursor-pointer rounded-full transition-colors duration-200',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
            toggleSizes[size].track,
            currentChecked ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          <span
            className={cn(
              'pointer-events-none inline-block rounded-full bg-white shadow-sm ring-0 transition-transform duration-200',
              'mt-0.5 ml-0.5',
              toggleSizes[size].thumb,
              currentChecked && toggleSizes[size].translate
            )}
          />
        </button>
        <input
          ref={ref}
          type="checkbox"
          checked={currentChecked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          {...props}
        />
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <label
                htmlFor={inputId}
                className={cn(
                  'text-sm font-medium',
                  error ? 'text-error-500' : 'text-foreground',
                  disabled && 'opacity-50'
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {error && (
              <p className="text-xs text-error-500">{error}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Toggle.displayName = 'Toggle';
export default Toggle;