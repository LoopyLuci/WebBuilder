/**
 * WebBuilder Components - Hero Section Component
 * A hero section with title, subtitle, CTA, and background image support.
 */

import React from 'react';

export type HeroLayout = 'center' | 'left' | 'right' | 'split';

export interface HeroProps extends React.HTMLAttributes<HTMLElement> {
  layout?: HeroLayout;
  title: string;
  subtitle?: string;
  description?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  overlay?: boolean;
  overlayOpacity?: number;
  cta?: React.ReactNode;
  secondaryCta?: React.ReactNode;
  height?: 'auto' | 'half' | 'full' | 'large';
}

const heightStyles: Record<string, string> = {
  auto: 'py-16 md:py-24',
  half: 'min-h-[50vh] py-12',
  full: 'min-h-screen py-16',
  large: 'min-h-[80vh] py-20',
};

const layoutStyles: Record<HeroLayout, { container: string; content: string }> = {
  center: {
    container: 'max-w-4xl mx-auto text-center',
    content: 'flex flex-col items-center',
  },
  left: {
    container: 'max-w-3xl mr-auto text-left',
    content: 'flex flex-col items-start',
  },
  right: {
    container: 'max-w-3xl ml-auto text-right',
    content: 'flex flex-col items-end',
  },
  split: {
    container: 'grid md:grid-cols-2 gap-8 items-center',
    content: '',
  },
};

export const Hero = React.forwardRef<HTMLElement, HeroProps>(
  (
    {
      layout = 'center',
      title,
      subtitle,
      description,
      backgroundImage,
      backgroundColor,
      overlay = true,
      overlayOpacity = 0.5,
      cta,
      secondaryCta,
      height = 'auto',
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const styles = layoutStyles[layout];
    const hasBackground = !!backgroundImage;

    return (
      <section
        ref={ref}
        className={[
          'relative w-full overflow-hidden',
          heightStyles[height],
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
              <div
                className="absolute inset-0 bg-black"
                style={{ opacity: overlayOpacity }}
                aria-hidden="true"
              />
            )}
          </>
        )}
        <div className={['relative z-10 container mx-auto px-4', styles.container].join(' ')}>
          {layout === 'split' ? (
            <div className="space-y-6">
              {hasBackground ? (
                <>
                  {subtitle && (
                    <p className="text-sm font-semibold uppercase tracking-wider text-blue-300">
                      {subtitle}
                    </p>
                  )}
                  <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                    {title}
                  </h1>
                  {description && (
                    <p className="text-lg text-gray-200 max-w-xl">{description}</p>
                  )}
                </>
              ) : (
                <>
                  {subtitle && (
                    <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                      {subtitle}
                    </p>
                  )}
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                    {title}
                  </h1>
                  {description && (
                    <p className="text-lg text-gray-600 max-w-xl">{description}</p>
                  )}
                </>
              )}
              {(cta || secondaryCta) && (
                <div className="flex flex-wrap gap-4 pt-4">
                  {cta}
                  {secondaryCta}
                </div>
              )}
            </div>
          ) : (
            <div className={styles.content}>
              {subtitle && (
                <p
                  className={[
                    'text-sm font-semibold uppercase tracking-wider mb-3',
                    hasBackground ? 'text-blue-300' : 'text-blue-600',
                  ].join(' ')}
                >
                  {subtitle}
                </p>
              )}
              <h1
                className={[
                  'text-4xl md:text-5xl lg:text-6xl font-bold leading-tight',
                  hasBackground ? 'text-white' : 'text-gray-900',
                ].join(' ')}
              >
                {title}
              </h1>
              {description && (
                <p
                  className={[
                    'mt-4 text-lg md:text-xl max-w-2xl',
                    hasBackground ? 'text-gray-200' : 'text-gray-600',
                  ].join(' ')}
                >
                  {description}
                </p>
              )}
              {(cta || secondaryCta) && (
                <div className="flex flex-wrap gap-4 mt-8">
                  {cta}
                  {secondaryCta}
                </div>
              )}
            </div>
          )}
          {children}
        </div>
      </section>
    );
  }
);

Hero.displayName = 'Hero';

export default Hero;