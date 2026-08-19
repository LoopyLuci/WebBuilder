/**
 * WebBuilder Components - Stats Component
 * A statistics display component with icons, trends, and grid layout.
 */

import React from 'react';

export interface StatItem {
  id: string;
  label: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    direction: 'up' | 'down';
    label?: string;
  };
  color?: string;
}

export interface StatsProps extends React.HTMLAttributes<HTMLDivElement> {
  stats: StatItem[];
  columns?: 1 | 2 | 3 | 4;
  variant?: 'default' | 'cards' | 'minimal' | 'bordered';
  size?: 'sm' | 'md' | 'lg';
}

const columnStyles: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

const variantContainerStyles: Record<string, string> = {
  default: '',
  cards: '',
  minimal: '',
  bordered: '',
};

const variantItemStyles: Record<string, string> = {
  default: 'bg-white p-6 rounded-lg shadow-sm border border-gray-200',
  cards: 'bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow',
  minimal: 'p-4',
  bordered: 'p-6 border-2 border-gray-200 rounded-lg',
};

const sizeStyles: Record<string, { value: string; label: string }> = {
  sm: { value: 'text-xl', label: 'text-xs' },
  md: { value: 'text-2xl', label: 'text-sm' },
  lg: { value: 'text-3xl', label: 'text-base' },
};

export const Stats = React.forwardRef<HTMLDivElement, StatsProps>(
  (
    {
      stats,
      columns = 4,
      variant = 'default',
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
        className={['grid gap-4', columnStyles[columns], className]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {stats.map((stat) => (
          <div key={stat.id} className={variantItemStyles[variant]}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className={['font-medium text-gray-500', sStyles.label].join(' ')}>
                  {stat.label}
                </p>
                <p
                  className={[
                    'font-bold text-gray-900 mt-1',
                    sStyles.value,
                  ].join(' ')}
                >
                  {stat.value}
                </p>
                {stat.trend && (
                  <div className="flex items-center gap-1 mt-2">
                    {stat.trend.direction === 'up' ? (
                      <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    )}
                    <span
                      className={[
                        'text-sm font-medium',
                        stat.trend.direction === 'up' ? 'text-green-600' : 'text-red-600',
                      ].join(' ')}
                    >
                      {stat.trend.value}
                    </span>
                    {stat.trend.label && (
                      <span className="text-sm text-gray-500">{stat.trend.label}</span>
                    )}
                  </div>
                )}
                {stat.description && !stat.trend && (
                  <p className="text-sm text-gray-500 mt-1">{stat.description}</p>
                )}
              </div>
              {stat.icon && (
                <div
                  className={[
                    'flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg',
                    stat.color || 'bg-blue-100 text-blue-600',
                  ].join(' ')}
                >
                  {stat.icon}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }
);

Stats.displayName = 'Stats';

export default Stats;