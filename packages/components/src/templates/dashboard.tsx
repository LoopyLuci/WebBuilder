/**
 * WebBuilder Components - Dashboard Layout Template
 * A complete dashboard layout with sidebar, header, and main content area.
 */

import React, { useState } from 'react';

export interface DashboardProps {
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  children: React.ReactNode;
  sidebarCollapsed?: boolean;
  onSidebarCollapseChange?: (collapsed: boolean) => void;
  contentPadding?: 'none' | 'sm' | 'md' | 'lg';
}

export interface DashboardHeaderProps extends React.HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode;
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
  userMenu?: React.ReactNode;
  search?: React.ReactNode;
}

export interface DashboardContentProps extends React.HTMLAttributes<HTMLElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  maxWidth?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export interface DashboardCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  noPadding?: boolean;
  hoverable?: boolean;
}

export interface DashboardStatProps {
  label: string;
  value: string | number;
  change?: { value: number; type: 'increase' | 'decrease' | 'neutral' };
  icon?: React.ReactNode;
  trend?: number[];
}

export interface DashboardChartProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

const paddingStyles: Record<string, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const maxWidthStyles: Record<string, string> = {
  none: '',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-full',
};

export const DashboardHeader = React.forwardRef<HTMLElement, DashboardHeaderProps>(
  (
    {
      logo,
      title,
      breadcrumbs,
      actions,
      userMenu,
      search,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <header
        ref={ref}
        className={[
          'w-full h-16 border-b border-gray-200 bg-white flex items-center justify-between px-4 md:px-6',
          className,
        ].join(' ')}
        {...props}
      >
        <div className="flex items-center gap-4">
          {logo && <div className="flex-shrink-0">{logo}</div>}
          {breadcrumbs && (
            <nav aria-label="Breadcrumb" className="hidden md:block">
              <ol className="flex items-center gap-2 text-sm">
                {breadcrumbs.map((crumb, index) => (
                  <li key={index} className="flex items-center gap-2">
                    {index > 0 && (
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                    {crumb.href ? (
                      <a href={crumb.href} className="text-gray-600 hover:text-gray-900">
                        {crumb.label}
                      </a>
                    ) : (
                      <span className="text-gray-900 font-medium">{crumb.label}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}
          {title && (
            <h1 className="text-lg font-semibold text-gray-900 hidden md:block">{title}</h1>
          )}
        </div>
        <div className="flex items-center gap-4">
          {search && <div className="hidden md:block">{search}</div>}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
          {userMenu && <div className="flex-shrink-0">{userMenu}</div>}
        </div>
      </header>
    );
  }
);

DashboardHeader.displayName = 'DashboardHeader';

export const DashboardContent = React.forwardRef<HTMLElement, DashboardContentProps>(
  (
    {
      padding = 'md',
      maxWidth = 'none',
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <main
        ref={ref}
        className={[
          'flex-1 overflow-auto',
          paddingStyles[padding],
          className,
        ].join(' ')}
        {...props}
      >
        <div className={['mx-auto', maxWidthStyles[maxWidth]].filter(Boolean).join(' ')}>
          {children}
        </div>
      </main>
    );
  }
);

DashboardContent.displayName = 'DashboardContent';

export const DashboardCard = React.forwardRef<HTMLDivElement, DashboardCardProps>(
  (
    {
      title,
      description,
      icon,
      actions,
      noPadding = false,
      hoverable = false,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={[
          'bg-white rounded-xl border border-gray-200',
          hoverable ? 'hover:shadow-md transition-shadow' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {(title || description || actions) && (
          <div className="flex items-start justify-between p-4 md:p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  {icon}
                </div>
              )}
              <div>
                {title && <h3 className="text-sm font-semibold text-gray-900">{title}</h3>}
                {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
              </div>
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        )}
        {!noPadding ? (
          <div className="p-4 md:p-6">{children}</div>
        ) : (
          children
        )}
      </div>
    );
  }
);

DashboardCard.displayName = 'DashboardCard';

export const DashboardStat: React.FC<DashboardStatProps> = ({
  label,
  value,
  change,
  icon,
  trend,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">{label}</span>
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p
              className={[
                'text-xs font-medium mt-1',
                change.type === 'increase' ? 'text-green-600' : '',
                change.type === 'decrease' ? 'text-red-600' : '',
                change.type === 'neutral' ? 'text-gray-500' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {change.type === 'increase' ? '↑' : change.type === 'decrease' ? '↓' : '→'}{' '}
              {Math.abs(change.value)}%
            </p>
          )}
        </div>
        {trend && (
          <div className="flex items-end gap-0.5 h-8">
            {trend.map((point, index) => (
              <div
                key={index}
                className="w-1.5 bg-blue-500 rounded-sm"
                style={{ height: `${(point / Math.max(...trend)) * 100}%` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

DashboardStat.displayName = 'DashboardStat';

export const DashboardChart = React.forwardRef<HTMLDivElement, DashboardChartProps>(
  (
    {
      title,
      subtitle,
      children,
      actions,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={[
          'bg-white rounded-xl border border-gray-200',
          className,
        ].join(' ')}
        {...props}
      >
        {(title || subtitle || actions) && (
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
            <div>
              {title && <h3 className="text-sm font-semibold text-gray-900">{title}</h3>}
              {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        )}
        <div className="p-4 md:p-6">{children}</div>
      </div>
    );
  }
);

DashboardChart.displayName = 'DashboardChart';

export const Dashboard: React.FC<DashboardProps> = ({
  sidebar,
  header,
  children,
  sidebarCollapsed,
  onSidebarCollapseChange,
  contentPadding = 'md',
}) => {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {sidebar}
      <div className="flex-1 flex flex-col min-w-0">
        {header}
        <DashboardContent padding={contentPadding}>
          {children}
        </DashboardContent>
      </div>
    </div>
  );
};

Dashboard.displayName = 'Dashboard';

export default Object.assign(Dashboard, {
  Header: DashboardHeader,
  Content: DashboardContent,
  Card: DashboardCard,
  Stat: DashboardStat,
  Chart: DashboardChart,
});