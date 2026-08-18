/**
 * WebBuilder Components - Features Grid Section Component
 * A features section with icon, title, description grid.
 */

import React from 'react';

export type FeaturesLayout = 'grid' | 'list' | 'cards';
export type FeaturesColumns = 1 | 2 | 3 | 4;

export interface FeatureItem {
  icon?: React.ReactNode;
  title: string;
  description: string;
  link?: string;
  linkText?: string;
}

export interface FeaturesProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  subtitle?: string;
  features: FeatureItem[];
  layout?: FeaturesLayout;
  columns?: FeaturesColumns;
  centered?: boolean;
  backgroundColor?: string;
}

const columnStyles: Record<FeaturesColumns, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

export const Features = React.forwardRef<HTMLElement, FeaturesProps>(
  (
    {
      title,
      subtitle,
      features,
      layout = 'grid',
      columns = 3,
      centered = true,
      backgroundColor,
      className = '',
      ...props
    },
    ref
  ) => {
    if (layout === 'list') {
      return (
        <section
          ref={ref}
          className={['py-16 md:py-24', className].filter(Boolean).join(' ')}
          style={backgroundColor ? { backgroundColor } : undefined}
          {...props}
        >
          <div className="container mx-auto px-4">
            {(title || subtitle) && (
              <div className={['max-w-2xl mb-12', centered ? 'mx-auto text-center' : ''].join(' ')}>
                {subtitle && (
                  <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 mb-2">
                    {subtitle}
                  </p>
                )}
                {title && (
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{title}</h2>
                )}
              </div>
            )}
            <div className="space-y-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex gap-6 p-6 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {feature.icon && (
                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                      {feature.icon}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                    <p className="mt-1 text-gray-600">{feature.description}</p>
                    {feature.link && (
                      <a
                        href={feature.link}
                        className="inline-flex items-center mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        {feature.linkText || 'Learn more'}
                        <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    return (
      <section
        ref={ref}
        className={['py-16 md:py-24', className].filter(Boolean).join(' ')}
        style={backgroundColor ? { backgroundColor } : undefined}
        {...props}
      >
        <div className="container mx-auto px-4">
          {(title || subtitle) && (
            <div className={['max-w-2xl mb-12', centered ? 'mx-auto text-center' : ''].join(' ')}>
              {subtitle && (
                <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 mb-2">
                  {subtitle}
                </p>
              )}
              {title && (
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{title}</h2>
              )}
            </div>
          )}
          <div
            className={[
              'grid gap-6',
              layout === 'cards' ? 'gap-8' : '',
              columnStyles[columns],
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {features.map((feature, index) => (
              <div
                key={index}
                className={[
                  'group',
                  layout === 'cards'
                    ? 'p-6 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow'
                    : 'p-4',
                ].join(' ')}
              >
                {feature.icon && (
                  <div
                    className={[
                      'flex items-center justify-center rounded-lg bg-blue-100 text-blue-600 mb-4',
                      layout === 'cards' ? 'w-12 h-12' : 'w-10 h-10',
                    ].join(' ')}
                  >
                    {feature.icon}
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                {feature.link && (
                  <a
                    href={feature.link}
                    className="inline-flex items-center mt-4 text-sm font-medium text-blue-600 hover:text-blue-700 group-hover:underline"
                  >
                    {feature.linkText || 'Learn more'}
                    <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
);

Features.displayName = 'Features';

export default Features;