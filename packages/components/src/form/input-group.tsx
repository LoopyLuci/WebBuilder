/**
 * WebBuilder Components - InputGroup Component
 * Groups multiple inputs with addons, buttons, and icons.
 */

import React from 'react';

export type InputGroupSize = 'sm' | 'md' | 'lg';

export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: InputGroupSize;
  fullWidth?: boolean;
}

const sizeStyles: Record<InputGroupSize, string> = {
  sm: 'text-sm',
  md: 'text-sm',
  lg: 'text-base',
};

export const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  ({ size = 'md', fullWidth = false, children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={[
          'flex items-stretch',
          fullWidth ? 'w-full' : '',
          sizeStyles[size],
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(child as React.ReactElement<unknown>, {
                ...(child.props as Record<string, unknown>),
                size,
              } as never)
            : child
        )}
      </div>
    );
  }
);

InputGroup.displayName = 'InputGroup';

export interface InputGroupAddonProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: InputGroupSize;
  position?: 'left' | 'right';
  variant?: 'default' | 'filled' | 'outline';
}

const addonSizeStyles: Record<InputGroupSize, string> = {
  sm: 'px-2 py-1.5',
  md: 'px-3 py-2.5',
  lg: 'px-4 py-3',
};

const addonVariantStyles: Record<string, string> = {
  default: 'bg-gray-100 border border-gray-300 text-gray-600',
  filled: 'bg-gray-200 text-gray-700',
  outline: 'bg-transparent border border-gray-300 text-gray-600',
};

export const InputGroupAddon = React.forwardRef<HTMLSpanElement, InputGroupAddonProps>(
  (
    { size = 'md', position = 'left', variant = 'default', children, className = '', ...props },
    ref
  ) => {
    return (
      <span
        ref={ref}
        className={[
          'inline-flex items-center whitespace-nowrap',
          addonSizeStyles[size],
          addonVariantStyles[variant],
          position === 'left' ? 'rounded-l-md border-r-0' : 'rounded-r-md border-l-0',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {children}
      </span>
    );
  }
);

InputGroupAddon.displayName = 'InputGroupAddon';

export interface InputGroupButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: InputGroupSize;
  position?: 'left' | 'right';
  variant?: 'default' | 'primary' | 'outline';
}

const buttonSizeStyles: Record<InputGroupSize, string> = {
  sm: 'px-2 py-1.5 text-xs',
  md: 'px-3 py-2.5 text-sm',
  lg: 'px-4 py-3 text-base',
};

const buttonVariantStyles: Record<string, string> = {
  default: 'bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200',
  primary: 'bg-blue-600 border border-blue-600 text-white hover:bg-blue-700',
  outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50',
};

export const InputGroupButton = React.forwardRef<HTMLButtonElement, InputGroupButtonProps>(
  (
    {
      size = 'md',
      position = 'left',
      variant = 'default',
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type="button"
        className={[
          'inline-flex items-center font-medium transition-colors',
          buttonSizeStyles[size],
          buttonVariantStyles[variant],
          position === 'left' ? 'rounded-l-md border-r-0' : 'rounded-r-md border-l-0',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {children}
      </button>
    );
  }
);

InputGroupButton.displayName = 'InputGroupButton';

export default Object.assign(InputGroup, {
  Addon: InputGroupAddon,
  Button: InputGroupButton,
});