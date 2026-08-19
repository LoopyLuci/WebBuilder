/**
 * WebBuilder Components - Accordion Component
 * A collapsible accordion with single or multiple expand modes.
 */

import React, { useState } from 'react';

export interface AccordionItem {
  id: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: string;
  disabled?: boolean;
  content: React.ReactNode;
}

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  items: AccordionItem[];
  defaultExpanded?: string[];
  expanded?: string[];
  onExpandedChange?: (expanded: string[]) => void;
  multiple?: boolean;
  variant?: 'default' | 'bordered' | 'separated';
  size?: 'sm' | 'md' | 'lg';
}

const variantStyles: Record<string, { container: string; item: string }> = {
  default: {
    container: 'divide-y divide-gray-200',
    item: '',
  },
  bordered: {
    container: 'border border-gray-200 rounded-lg divide-y divide-gray-200',
    item: '',
  },
  separated: {
    container: 'space-y-2',
    item: 'border border-gray-200 rounded-lg',
  },
};

const sizeStyles: Record<string, { header: string; content: string }> = {
  sm: { header: 'px-3 py-2', content: 'px-3 pb-2' },
  md: { header: 'px-4 py-3', content: 'px-4 pb-3' },
  lg: { header: 'px-5 py-4', content: 'px-5 pb-4' },
};

export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  (
    {
      items,
      defaultExpanded,
      expanded: controlledExpanded,
      onExpandedChange,
      multiple = false,
      variant = 'default',
      size = 'md',
      className = '',
      ...props
    },
    ref
  ) => {
    const [uncontrolledExpanded, setUncontrolledExpanded] = useState<string[]>(
      defaultExpanded || []
    );
    const expanded = controlledExpanded !== undefined ? controlledExpanded : uncontrolledExpanded;

    const toggleItem = (id: string) => {
      let newExpanded: string[];
      if (multiple) {
        newExpanded = expanded.includes(id)
          ? expanded.filter((i) => i !== id)
          : [...expanded, id];
      } else {
        newExpanded = expanded.includes(id) ? [] : [id];
      }
      if (controlledExpanded === undefined) {
        setUncontrolledExpanded(newExpanded);
      }
      onExpandedChange?.(newExpanded);
    };

    const vStyles = variantStyles[variant];
    const sStyles = sizeStyles[size];

    return (
      <div
        ref={ref}
        className={[vStyles.container, className].filter(Boolean).join(' ')}
        {...props}
      >
        {items.map((item) => {
          const isExpanded = expanded.includes(item.id);
          return (
            <div key={item.id} className={vStyles.item}>
              <button
                type="button"
                onClick={() => toggleItem(item.id)}
                disabled={item.disabled}
                aria-expanded={isExpanded}
                aria-controls={`accordion-content-${item.id}`}
                className={[
                  'w-full flex items-center justify-between text-left transition-colors',
                  sStyles.header,
                  item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50',
                  variant === 'separated' && isExpanded ? 'rounded-t-lg' : '',
                  variant === 'separated' && !isExpanded ? 'rounded-lg' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <div className="flex items-center gap-3">
                  {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                  <div>
                    <span className="text-sm font-medium text-gray-900">{item.title}</span>
                    {item.subtitle && (
                      <p className="text-xs text-gray-500 mt-0.5">{item.subtitle}</p>
                    )}
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-600 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
                <svg
                  className={[
                    'w-5 h-5 text-gray-400 transition-transform duration-200',
                    isExpanded ? 'rotate-180' : '',
                  ].join(' ')}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isExpanded && (
                <div
                  id={`accordion-content-${item.id}`}
                  className={[sStyles.content, 'text-sm text-gray-600'].join(' ')}
                >
                  {item.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }
);

Accordion.displayName = 'Accordion';

export default Accordion;