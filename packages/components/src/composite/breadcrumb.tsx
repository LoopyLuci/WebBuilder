/**
 * WebBuilder Components - Breadcrumb Component
 * A navigation breadcrumb with separators and collapse support.
 */

import React from 'react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  active?: boolean;
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  maxItems?: number;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles: Record<string, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  (
    {
      items,
      separator,
      maxItems,
      size = 'md',
      className = '',
      ...props
    },
    ref
  ) => {
    const defaultSeparator = (
      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    );

    const renderSeparator = separator || defaultSeparator;

    let displayItems = items;
    let collapsed = false;

    if (maxItems && items.length > maxItems) {
      collapsed = true;
      const startItems = items.slice(0, 1);
      const endItems = items.slice(-(maxItems - 1));
      displayItems = [...startItems, { label: '...', active: false } as BreadcrumbItem, ...endItems];
    }

    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={['flex', className].filter(Boolean).join(' ')}
        {...props}
      >
        <ol className="flex items-center flex-wrap gap-2">
          {displayItems.map((item, index) => (
            <li key={index} className="flex items-center gap-2">
              {index > 0 && <span className="flex-shrink-0">{renderSeparator}</span>}
              {item.active || !item.href ? (
                <span
                  className={[
                    'font-medium text-gray-900 flex items-center gap-1.5',
                    sizeStyles[size],
                    item.label === '...' ? 'text-gray-400' : '',
                  ].join(' ')}
                  aria-current={item.active ? 'page' : undefined}
                >
                  {item.icon}
                  {item.label}
                </span>
              ) : (
                <a
                  href={item.href}
                  className={[
                    'text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1.5',
                    sizeStyles[size],
                  ].join(' ')}
                >
                  {item.icon}
                  {item.label}
                </a>
              )}
            </li>
          ))}
        </ol>
      </nav>
    );
  }
);

Breadcrumb.displayName = 'Breadcrumb';

export default Breadcrumb;