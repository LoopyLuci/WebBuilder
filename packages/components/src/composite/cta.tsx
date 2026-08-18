/**
 * WebBuilder Components - Call-to-Action Section Component
 * A CTA section with title, description, and action buttons.
 */

import React from 'react';

export type CTAVariant = 'default' | 'primary' | 'minimal' | 'gradient';

export interface CTAProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  description?: string;
  variant?: CTAVariant;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  backgroundColor?: string;
  backgroundImage?: string;
  overlay?: boolean;
  align?: 'left' | 'center' | 'right';
  size?: 'sm' | 'md' | 'lg';
}

export const CTA = React.forwardRef<HTMLElement, CTAProps>(
  (
    {
      title,
      description,
      variant = 'default',
      primaryAction,
      secondaryAction,
      backgroundColor,
      backgroundImage,
      overlay = false,
      align = 'center',
      size = 'md',
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const sizeStyles = {
      sm: 'py-8',
      md: 'py-12',
      lg: 'py-16',
    };

    const alignStyles = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    };

    const variantContainerStyles = {
      default: 'bg-blue-600',
      primary: 'bg-indigo-600',
      minimal: 'bg-gray-100',
      gradient: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600',
    };

    const variantTextStyles = {
      default: 'text-white',
      primary: 'text-white',
      minimal: 'text-gray-900',
      gradient: 'text-white',
    };

    const variantDescriptionStyles = {
      default: 'text-blue-100',
      primary: 'text-indigo-100',
      minimal: 'text-gray-600',
      gradient: 'text-blue-100',
    };

    const hasBackground = !!backgroundImage;

    return (
      <section
        ref={ref}
        className={[
          'relative overflow-hidden',
          sizeStyles[size],
          variant !== 'minimal' ? variantContainerStyles[variant] : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        style={backgroundColor ? { backgroundColor } : undefined}
        {...props}
      >
        {hasBackground && (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${backgroundImage})` }}
              aria-hidden="true"
            />
            {overlay && (
              <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
            )}
          </>
        )}
        <div
          className={[
            'relative z-10 container mx-auto px-4',
            alignStyles[align],
          ].join(' ')}
        >
          <div
            className={[
              'max-w-2xl',
              align === 'center' ? 'mx-auto' : '',
              align === 'right' ? 'ml-auto' : '',
            ].join(' ')}
          >
            <h2
              className={[
                'text-2xl md:text-3xl lg:text-4xl font-bold',
                variantTextStyles[variant],
              ].join(' ')}
            >
              {title}
            </h2>
            {description && (
              <p
                className={[
                  'mt-3 text-lg',
                  variantDescriptionStyles[variant],
                ].join(' ')}
              >
                {description}
              </p>
            )}
            {(primaryAction || secondaryAction) && (
              <div
                className={[
                  'flex flex-wrap gap-4 mt-8',
                  align === 'center' ? 'justify-center' : '',
                  align === 'right' ? 'justify-end' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {primaryAction}
                {secondaryAction}
              </div>
            )}
            {children}
          </div>
        </div>
      </section>
    );
  }
);

CTA.displayName = 'CTA';

export default CTA;