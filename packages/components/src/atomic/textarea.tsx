/**
 * WebBuilder Components - Atomic Textarea Component
 * A flexible textarea with label, error, and helper text support.
 */

import React from 'react';

export type TextareaSize = 'sm' | 'md' | 'lg';

export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: TextareaSize;
  fullWidth?: boolean;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
}

const sizeStyles: Record<TextareaSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-4 py-3 text-base',
};

const resizeStyles: Record<string, string> = {
  none: 'resize-none',
  both: 'resize',
  horizontal: 'resize-x',
  vertical: 'resize-y',
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      size = 'md',
      fullWidth = false,
      resize = 'vertical',
      id,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const inputId = id || `textarea-${Math.random().toString(36).substring(2, 9)}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const baseStyles =
      'block rounded-md border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed';

    const stateStyles = error
      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={
            [error ? errorId : null, helperText && !error ? helperId : null]
              .filter(Boolean)
              .join(' ') || undefined
          }
          className={[
            baseStyles,
            stateStyles,
            sizeStyles[size],
            resizeStyles[resize],
            fullWidth ? 'w-full' : '',
            'bg-white text-gray-900 placeholder-gray-400',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />
        {error && (
          <p id={errorId} className="mt-1.5 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1.5 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;