/**
 * WebBuilder Components - Stack Component
 * A flexbox-based stack for vertical/horizontal layouts.
 */

import React from 'react';

export type StackDirection = 'horizontal' | 'vertical';
export type StackSpacing = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: StackDirection;
  spacing?: StackSpacing;
  align?: StackAlign;
  justify?: StackJustify;
  wrap?: boolean;
  dividers?: boolean;
  reverse?: boolean;
}

const directionStyles: Record<StackDirection, string> = {
  horizontal: 'flex-row',
  vertical: 'flex-col',
};

const spacingStyles: Record<StackSpacing, { horizontal: string; vertical: string }> = {
  none: { horizontal: 'space-x-0', vertical: 'space-y-0' },
  xs: { horizontal: 'space-x-1', vertical: 'space-y-1' },
  sm: { horizontal: 'space-x-2', vertical: 'space-y-2' },
  md: { horizontal: 'space-x-4', vertical: 'space-y-4' },
  lg: { horizontal: 'space-x-6', vertical: 'space-y-6' },
  xl: { horizontal: 'space-x-8', vertical: 'space-y-8' },
};

const alignStyles: Record<StackAlign, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

const justifyStyles: Record<StackJustify, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  (
    {
      direction = 'vertical',
      spacing = 'md',
      align,
      justify,
      wrap = false,
      dividers = false,
      reverse = false,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const spacingClass =
      direction === 'horizontal'
        ? spacingStyles[spacing].horizontal
        : spacingStyles[spacing].vertical;

    return (
      <div
        ref={ref}
        className={[
          'flex',
          directionStyles[direction],
          reverse ? (direction === 'horizontal' ? 'flex-row-reverse' : 'flex-col-reverse') : '',
          spacingClass,
          align ? alignStyles[align] : '',
          justify ? justifyStyles[justify] : '',
          wrap ? 'flex-wrap' : '',
          dividers ? 'divide-gray-200' : '',
          dividers && direction === 'horizontal' ? 'divide-x' : '',
          dividers && direction === 'vertical' ? 'divide-y' : '',
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

Stack.displayName = 'Stack';

export default Stack;