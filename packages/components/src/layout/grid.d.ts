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
export declare const Grid: React.ForwardRefExoticComponent<GridProps & React.RefAttributes<HTMLDivElement>>;
export default Grid;
//# sourceMappingURL=grid.d.ts.map