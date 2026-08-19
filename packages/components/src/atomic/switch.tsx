/**
 * WebBuilder Components - Atomic Switch Component
 * A toggle switch with label and error support.
 */

import React from 'react';

export type SwitchSize = 'sm' | 'md' | 'lg';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  description?: string;
  size?: SwitchSize;
  error?: string;
  onOffLabels?: boolean;
}

const sizeStyles: Record<SwitchSize, { track: string; thumb: string; text: string }> = {
  sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', text: 'text-sm' },
  md: { track: 'w-10 h-5', thumb: 'w-4 h-4', text: 'text-sm' },
  lg: { track: 'w-14 h-7', thumb: 'w-6 h-6', text: 'text-base' },
};

const thumbTranslate: Record<SwitchSize, string> = {
  sm: 'translate-x-4',
  md: 'translate-x-5',
  lg: 'translate-x-7',
};

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      label,
      description,
      size = 'md',
      error,
      onOffLabels = false,
      id,
      disabled,
      className = '',
      checked,
      onChange,
      ...props
    },
    ref
  ) => {
    const switchId = id || `switch-${Math.random().toString(36).substring(2, 9)}`;
    const errorId = `${switchId}-error`;
    const sizes = sizeStyles[size];

    return (
      <div className={['inline-flex flex-col', className].filter(Boolean).join(' ')}>
        <label
          htmlFor={switchId}
          className={[
            'inline-flex items-center gap-3 cursor-pointer',
            disabled ? 'cursor-not-allowed opacity-50' : '',
          ].join(' ')}
        >
          <span className="relative inline-flex items-center">
            <input
              ref={ref}
              type="checkbox"
              role="switch"
              id={switchId}
              disabled={disabled}
              checked={checked}
              aria-invalid={!!error}
              aria-describedby={error ? errorId : undefined}
              onChange={onChange}
              className="sr-only peer"
              {...props}
            />
            <span
              className={[
                sizes.track,
                'rounded-full transition-colors duration-200',
                'bg-gray-200 peer-checked:bg-blue-600',
                'peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-2',
              ].join(' ')}
              aria-hidden="true"
            >
              <span
                className={[
                  sizes.thumb,
                  'absolute top-0.5 left-0.5 rounded-full bg-white shadow-sm transition-transform duration-200',
                  'peer-checked:' + thumbTranslate[size],
                ].join(' ')}
                aria-hidden="true"
              />
            </span>
          </span>
          <span className="flex flex-col">
            {label && (
              <span className={[sizes.text, 'font-medium text-gray-900'].join(' ')}>
                {label}
              </span>
            )}
            {description && (
              <span className="text-sm text-gray-500">
                {description}
              </span>
            )}
          </span>
        </label>
        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Switch.displayName = 'Switch';

export default Switch;