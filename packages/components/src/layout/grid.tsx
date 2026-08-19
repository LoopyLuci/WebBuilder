/**
 * WebBuilder Components - Grid Component
 * A responsive grid system with auto-flow and gap options.
 */

import React from 'react';

export type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 12;
export type GridGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: GridColumns;
  smColumns?: GridColumns;
  mdColumns?: GridColumns;
  lgColumns?: GridColumns;
  xlColumns?: GridColumns;
  gap?: GridGap;
  rowGap?: GridGap;
  columnGap?: GridGap;
  flow?: 'row' | 'column' | 'dense' | 'row-dense' | 'column-dense';
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  justifyItems?: 'start' | 'center' | 'end' | 'stretch';
}

const columnStyles: Record<GridColumns, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  12: 'grid-cols-12',
};

const smColumnStyles: Record<GridColumns, string> = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-4',
  5: 'sm:grid-cols-5',
  6: 'sm:grid-cols-6',
  12: 'sm:grid-cols-12',
};

const mdColumnStyles: Record<GridColumns, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
  6: 'md:grid-cols-6',
  12: 'md:grid-cols-12',
};

const lgColumnStyles: Record<GridColumns, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
  6: 'lg:grid-cols-6',
  12: 'lg:grid-cols-12',
};

const xlColumnStyles: Record<GridColumns, string> = {
  1: 'xl:grid-cols-1',
  2: 'xl:grid-cols-2',
  3: 'xl:grid-cols-3',
  4: 'xl:grid-cols-4',
  5: 'xl:grid-cols-5',
  6: 'xl:grid-cols-6',
  12: 'xl:grid-cols-12',
};

const gapStyles: Record<GridGap, string> = {
  none: 'gap-0',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

const flowStyles: Record<string, string> = {
  row: 'grid-flow-row',
  column: 'grid-flow-col',
  dense: 'grid-flow-dense',
  'row-dense': 'grid-flow-row-dense',
  'column-dense': 'grid-flow-col-dense',
};

const alignItemsStyles: Record<string, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

const justifyItemsStyles: Record<string, string> = {
  start: 'justify-items-start',
  center: 'justify-items-center',
  end: 'justify-items-end',
  stretch: 'justify-items-stretch',
};

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  (
    {
      columns = 1,
      smColumns,
      mdColumns,
      lgColumns,
      xlColumns,
      gap = 'md',
      rowGap,
      columnGap,
      flow,
      alignItems,
      justifyItems,
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
          'grid',
          columnStyles[columns],
          smColumns ? smColumnStyles[smColumns] : '',
          mdColumns ? mdColumnStyles[mdColumns] : '',
          lgColumns ? lgColumnStyles[lgColumns] : '',
          xlColumns ? xlColumnStyles[xlColumns] : '',
          rowGap ? gapStyles[rowGap] : gapStyles[gap],
          columnGap ? gapStyles[columnGap] : '',
          flow ? flowStyles[flow] : '',
          alignItems ? alignItemsStyles[alignItems] : '',
          justifyItems ? justifyItemsStyles[justifyItems] : '',
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

Grid.displayName = 'Grid';

export default Grid;