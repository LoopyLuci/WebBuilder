'use client';

import React from 'react';

export interface ListItem {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  avatar?: string;
  badge?: string;
  meta?: string;
  actions?: React.ReactNode;
  href?: string;
}

export interface ListProps {
  items: ListItem[];
  variant?: 'default' | 'bordered' | 'separated';
  size?: 'sm' | 'md' | 'lg';
  onClick?: (item: ListItem) => void;
  className?: string;
}

export const List: React.FC<ListProps> = ({
  items,
  variant = 'default',
  size = 'md',
  onClick,
  className = '',
}) => {
  const sizes = {
    sm: 'py-2',
    md: 'py-3',
    lg: 'py-4',
  };

  const variants = {
    default: 'border-b border-border last:border-0',
    bordered: 'border border-border rounded-lg mb-2 last:mb-0',
    separated: 'mb-2 last:mb-0',
  };

  return (
    <div className={`divide-y divide-border ${className}`} role="list">
      {items.map(item => {
        const content = (
          <>
            {(item.icon || item.avatar) && (
              <div className="shrink-0">
                {item.avatar ? (
                  <img src={item.avatar} alt="" className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg">
                    {item.icon}
                  </div>
                )}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">{item.title}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                    {item.badge}
                  </span>
                )}
              </div>
              {item.description && (
                <p className="text-sm text-muted-foreground truncate">{item.description}</p>
              )}
              {item.meta && (
                <p className="text-xs text-muted-foreground">{item.meta}</p>
              )}
            </div>
            {item.actions && <div className="shrink-0">{item.actions}</div>}
          </>
        );

        if (item.href) {
          return (
            <a
              key={item.id}
              href={item.href}
              onClick={() => onClick?.(item)}
              className={`flex items-center gap-3 px-3 ${sizes[size]} ${variants[variant]} hover:bg-muted/50 transition-colors`}
              role="listitem"
            >
              {content}
            </a>
          );
        }

        return (
          <div
            key={item.id}
            onClick={() => onClick?.(item)}
            className={`flex items-center gap-3 px-3 ${sizes[size]} ${variants[variant]} ${onClick ? 'cursor-pointer hover:bg-muted/50' : ''} transition-colors`}
            role="listitem"
          >
            {content}
          </div>
        );
      })}
    </div>
  );
};

export default List;
