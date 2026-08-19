/**
 * WebBuilder Components - CheckboxGroup Component
 * A group of checkboxes with label and layout options.
 */

import React from 'react';

export interface CheckboxOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface CheckboxGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  label?: string;
  options: CheckboxOption[];
  value: string[];
  onChange: (value: string[]) => void;
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

export const CheckboxGroup = React.forwardRef<HTMLDivElement, CheckboxGroupProps>(
  (
    {
      label,
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
    const handleChange = (optionValue: string, checked: boolean) => {
      if (checked) {
        onChange([...value, optionValue]);
      } else {
        onChange(value.filter((v) => v !== optionValue));
      }
    };

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
                type="checkbox"
                checked={value.includes(option.value)}
                onChange={(e) => handleChange(option.value, e.target.checked)}
                disabled={option.disabled || disabled}
                className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-1"
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

CheckboxGroup.displayName = 'CheckboxGroup';

export default CheckboxGroup;