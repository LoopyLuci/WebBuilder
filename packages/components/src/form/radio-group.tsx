/**
 * WebBuilder Components - RadioGroup Component
 * A group of radio buttons with label and layout options.
 */

import React from 'react';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  label?: string;
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  error?: string;
  helperText?: string;
  disabled?: boolean;
}

const orientationStyles: Record<string, string> = {
  horizontal: 'flex flex-row flex-wrap gap-4',
  vertical: 'flex flex-col gap-3',
};

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      label,
      name,
      options,
      value,
      onChange,
      orientation = 'vertical',
      size = 'md',
      error,
      helperText,
      disabled = false,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div ref={ref} className={['flex flex-col gap-2', className].filter(Boolean).join(' ')} {...props}>
        {label && (
          <label className="text-sm font-medium text-gray-700">{label}</label>
        )}
        <div className={orientationStyles[orientation]}>
          {options.map((option) => (
            <label
              key={option.value}
              className={[
                'inline-flex items-start gap-3 cursor-pointer',
                option.disabled || disabled ? 'opacity-50 cursor-not-allowed' : '',
              ].join(' ')}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange(option.value)}
                disabled={option.disabled || disabled}
                className="mt-0.5 rounded-full border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-1"
              />
              <span className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">{option.label}</span>
                {option.description && (
                  <span className="text-xs text-gray-500">{option.description}</span>
                )}
              </span>
            </label>
          ))}
        </div>
        {error && (
          <p className="text-sm text-red-600" role="alert">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';

export default RadioGroup;