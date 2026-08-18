/**
 * WebBuilder Components - Atomic Card Component
 * A flexible card with image, title, description, and footer slots.
 */

import React from 'react';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding;
  hoverable?: boolean;
  bordered?: boolean;
}

export interface CardImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  aspectRatio?: '16:9' | '4:3' | '1:1' | 'auto';
}

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const paddingStyles: Record<CardPadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const aspectRatioStyles: Record<string, string> = {
  '16:9': 'aspect-video',
  '4:3': 'aspect-4/3',
  '1:1': 'aspect-square',
  auto: '',
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ padding = 'md', hoverable = false, bordered = true, children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={[
          'bg-white rounded-lg overflow-hidden',
          bordered ? 'border border-gray-200' : '',
          hoverable ? 'shadow-sm hover:shadow-md transition-shadow duration-200' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardImage = React.forwardRef<HTMLDivElement, CardImageProps>(
  ({ aspectRatio = '16:9', className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={['w-full overflow-hidden bg-gray-100', aspectRatioStyles[aspectRatio], className]
          .filter(Boolean)
          .join(' ')}
      >
        <img
          className="w-full h-full object-cover"
          {...props}
        />
      </div>
    );
  }
);

CardImage.displayName = 'CardImage';

export const CardBody = React.forwardRef<HTMLDivElement, CardProps>(
  ({ padding = 'md', className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={[paddingStyles[padding], className].filter(Boolean).join(' ')}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardBody.displayName = 'CardBody';

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ as: Tag = 'h3', className = '', children, ...props }, ref) => {
    return (
      <Tag
        ref={ref}
        className={['text-lg font-semibold text-gray-900', className].filter(Boolean).join(' ')}
        {...props}
      >
        {children}
      </Tag>
    );
  }
);

CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={['mt-1 text-sm text-gray-600', className].filter(Boolean).join(' ')}
        {...props}
      >
        {children}
      </p>
    );
  }
);

CardDescription.displayName = 'CardDescription';

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={['px-4 py-3 bg-gray-50 border-t border-gray-200', className].filter(Boolean).join(' ')}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

export default Object.assign(Card, {
  Image: CardImage,
  Body: CardBody,
  Title: CardTitle,
  Description: CardDescription,
  Footer: CardFooter,
});