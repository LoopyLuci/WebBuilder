/**
 * WebBuilder Components - Container Component
 * A responsive container with max-width variants.
 */

import React from 'react';

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: ContainerSize;
  centered?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  maxWidth?: string;
}

const sizeStyles: Record<ContainerSize, string> = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full',
};

const paddingStyles: Record<string, string> = {
  none: '',
  sm: 'px-4',
  md: 'px-6',
  lg: 'px-8',
};

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      size = 'lg',
      centered = true,
      padding = 'md',
      maxWidth,
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
          'w-full',
          maxWidth || sizeStyles[size],
          centered ? 'mx-auto' : '',
          paddingStyles[padding],
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

Container.displayName = 'Container';

export default Container;