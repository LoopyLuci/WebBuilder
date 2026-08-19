/**
 * WebBuilder Components - Header Component
 * A page header with title, description, and action slots.
 */

import React from 'react';

export interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  centered?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles: Record<string, { title: string; description: string }> = {
  sm: { title: 'text-lg', description: 'text-sm' },
  md: { title: 'text-2xl', description: 'text-base' },
  lg: { title: 'text-3xl', description: 'text-lg' },
};

export const Header = React.forwardRef<HTMLDivElement, HeaderProps>(
  (
    {
      title,
      subtitle,
      description,
      actions,
      breadcrumbs,
      centered = false,
      size = 'md',
      className = '',
      ...props
    },
    ref
  ) => {
    const sStyles = sizeStyles[size];

    return (
      <div
        ref={ref}
        className={['w-full', className].filter(Boolean).join(' ')}
        {...props}
      >
        {breadcrumbs && <div className="mb-4">{breadcrumbs}</div>}
        <div
          className={[
            'flex flex-col md:flex-row md:items-center md:justify-between gap-4',
            centered ? 'text-center' : '',
          ].join(' ')}
        >
          <div className={centered ? 'mx-auto' : ''}>
            {subtitle && (
              <p className="text-sm font-medium text-blue-600 mb-1">{subtitle}</p>
            )}
            <h1
              className={[
                'font-bold text-gray-900',
                sStyles.title,
              ].join(' ')}
            >
              {title}
            </h1>
            {description && (
              <p
                className={[
                  'mt-2 text-gray-600 max-w-2xl',
                  sStyles.description,
                  centered ? 'mx-auto' : '',
                ].join(' ')}
              >
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div
              className={[
                'flex items-center gap-3',
                centered ? 'mx-auto' : 'flex-shrink-0',
              ].join(' ')}
            >
              {actions}
            </div>
          )}
        </div>
      </div>
    );
  }
);

Header.displayName = 'Header';

export default Header;