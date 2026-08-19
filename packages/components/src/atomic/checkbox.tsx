/**
 * WebBuilder Components - Atomic Checkbox Component
 * A flexible checkbox with label, indeterminate state, and error support.
 */

import React from 'react';

export type CheckboxSize = 'sm' | 'md' | 'lg';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLCheckboxElement>, 'size'> {
  label?: string;
  description?: string;
  size?: CheckboxSize;
  error?: string;
  indeterminate?: boolean;
}

const sizeStyles: Record<CheckboxSize, { box: string; text: string; desc: string }> = {
  sm: { box: 'w-4 h-4', text: 'text-sm', desc: 'text-xs' },
  md: { box: 'w-5 h-5', text: 'text-sm', desc: 'text-sm' },
  lg: { box: 'w-6 h-6', text: 'text-base', desc: 'text-sm' },
};

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      description,
      size = 'md',
      error,
      indeterminate = false,
      id,
      disabled,
      className = '',
      checked,
      onChange,
      ...props
    },
    ref
  ) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substring(2, 9)}`;
    const errorId = `${checkboxId}-error`;
    const sizes = sizeStyles[size];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (indeterminate) {
        // Force unchecked when indeterminate and clicked
        e.target.checked = false;
      }
      onChange?.(e);
    };

    return (
      <div className={['inline-flex flex-col', className].filter(Boolean).join(' ')}>
        <label
          htmlFor={checkboxId}
          className={[
            'inline-flex items-start gap-3 cursor-pointer',
            disabled ? 'cursor-not-allowed opacity-50' : '',
          ].join(' ')}
        >
          <span className="flex items-center justify-center flex-shrink-0 pt-0.5">
            <input
              ref={ref}
              type="checkbox"
              id={checkboxId}
              disabled={disabled}
              checked={indeterminate ? false : checked}
              aria-invalid={!!error}
              aria-describedby={error ? errorId : undefined}
              onChange={handleChange}
              className={[
                sizes.box,
                'rounded border-2 transition-colors duration-150',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
                'text-blue-600 border-gray-300',
                indeterminate ? 'bg-blue-100 border-blue-400' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              {...props}
            />
          </span>
          <span className="flex flex-col">
            {label && (
              <span className={[sizes.text, 'font-medium text-gray-900'].join(' ')}>
                {label}
              </span>
            )}
            {description && (
              <span className={[sizes.desc, 'text-gray-500'].join(' ')}>
                {description}
              </span>
            )}
          </span>
        </label>
        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-600 ml-8" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;