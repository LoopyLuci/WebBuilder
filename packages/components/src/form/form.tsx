/**
 * WebBuilder Components - Form Component
 * A form wrapper with layout, validation, and submission handling.
 */

import React from 'react';

export type FormLayout = 'vertical' | 'horizontal' | 'inline';

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  layout?: FormLayout;
  spacing?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const layoutStyles: Record<FormLayout, string> = {
  vertical: 'flex flex-col',
  horizontal: 'flex flex-col',
  inline: 'flex flex-row flex-wrap items-end',
};

const spacingStyles: Record<string, string> = {
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
};

export const Form = React.forwardRef<HTMLFormElement, FormProps>(
  (
    {
      layout = 'vertical',
      spacing = 'md',
      disabled = false,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <form
        ref={ref}
        className={[
          layoutStyles[layout],
          layout === 'inline' ? 'gap-3' : spacingStyles[spacing],
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {children}
      </form>
    );
  }
);

Form.displayName = 'Form';

export default Form;