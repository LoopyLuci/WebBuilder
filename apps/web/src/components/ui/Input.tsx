import React, { forwardRef, useId, useState } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const inputSizes = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-2.5 text-base',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, id, label, error, helperText, leftIcon, rightIcon, size = 'md', disabled, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const [focused, setFocused] = useState(false);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'mb-1.5 block text-sm font-medium',
              error ? 'text-error-500' : 'text-foreground',
              disabled && 'opacity-50'
            )}
          >
            {label}
          </label>
        )}
        <div className={cn('relative', focused && 'z-10')}>
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={cn(helperId, errorId) || undefined}
            aria-errormessage={errorId}
            onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
            onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
            className={cn(
              'w-full rounded-lg border bg-background placeholder:text-muted-foreground',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-transparent',
              'transition-shadow duration-150',
              error
                ? 'border-error-500 focus-visible:ring-error-500'
                : 'border-border',
              inputSizes[size],
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              disabled && 'cursor-not-allowed opacity-50',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={errorId} role="alert" className="mt-1.5 text-xs text-error-500">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1.5 text-xs text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;