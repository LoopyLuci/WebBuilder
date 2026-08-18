/**
 * WebBuilder Components - Testimonials Section Component
 * A testimonials section with quotes, avatars, and ratings.
 */

import React from 'react';

export type TestimonialsLayout = 'grid' | 'carousel' | 'masonry';

export interface Testimonial {
  id?: string | number;
  content: string;
  author: {
    name: string;
    role?: string;
    company?: string;
    avatar?: string;
  };
  rating?: number;
  featured?: boolean;
}

export interface TestimonialsProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  subtitle?: string;
  testimonials: Testimonial[];
  layout?: TestimonialsLayout;
  columns?: 1 | 2 | 3;
  showRating?: boolean;
  backgroundColor?: string;
}

export const Testimonials = React.forwardRef<HTMLElement, TestimonialsProps>(
  (
    {
      title,
      subtitle,
      testimonials,
      layout = 'grid',
      columns = 3,
      showRating = true,
      backgroundColor,
      className = '',
      ...props
    },
    ref
  ) => {
    const renderStars = (rating: number) => {
      return (
        <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className={[
                'w-4 h-4',
                star <= rating ? 'text-yellow-400' : 'text-gray-300',
              ].join(' ')}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      );
    };

    const columnClass = columns === 1
      ? 'grid-cols-1'
      : columns === 2
        ? 'grid-cols-1 md:grid-cols-2'
        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

    return (
      <section
        ref={ref}
        className={['py-16 md:py-24', className].filter(Boolean).join(' ')}
        style={backgroundColor ? { backgroundColor } : undefined}
        {...props}
      >
        <div className="container mx-auto px-4">
          {(title || subtitle) && (
            <div className="max-w-2xl mx-auto text-center mb-12">
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

          <div className={['grid gap-6', columnClass].join(' ')}>
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id || testimonial.author.name}
                className={[
                  'relative p-6 rounded-xl border transition-shadow',
                  testimonial.featured
                    ? 'bg-blue-50 border-blue-200 shadow-md'
                    : 'bg-white border-gray-200 hover:shadow-md',
                ].join(' ')}
              >
                {showRating && testimonial.rating && (
                  <div className="mb-4">{renderStars(testimonial.rating)}</div>
                )}
                <blockquote className="text-gray-700 leading-relaxed mb-6">
                  &ldquo;{testimonial.content}&rdquo;
                </blockquote>
                <div className="flex items-center gap-3">
                  {testimonial.author.avatar ? (
                    <img
                      src={testimonial.author.avatar}
                      alt={testimonial.author.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {testimonial.author.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {testimonial.author.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {[testimonial.author.role, testimonial.author.company]
                        .filter(Boolean)
                        .join(' at ')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
);

Testimonials.displayName = 'Testimonials';

export default Testimonials;