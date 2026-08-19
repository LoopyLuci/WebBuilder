import { jsx as _jsx } from "react/jsx-runtime";
/**
 * WebBuilder Components - Grid Component
 * A responsive grid system with auto-flow and gap options.
 */
import React from 'react';
const columnStyles = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    12: 'grid-cols-12',
};
const smColumnStyles = {
    1: 'sm:grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-4',
    5: 'sm:grid-cols-5',
    6: 'sm:grid-cols-6',
    12: 'sm:grid-cols-12',
};
const mdColumnStyles = {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
    5: 'md:grid-cols-5',
    6: 'md:grid-cols-6',
    12: 'md:grid-cols-12',
};
const lgColumnStyles = {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    5: 'lg:grid-cols-5',
    6: 'lg:grid-cols-6',
    12: 'lg:grid-cols-12',
};
const xlColumnStyles = {
    1: 'xl:grid-cols-1',
    2: 'xl:grid-cols-2',
    3: 'xl:grid-cols-3',
    4: 'xl:grid-cols-4',
    5: 'xl:grid-cols-5',
    6: 'xl:grid-cols-6',
    12: 'xl:grid-cols-12',
};
const gapStyles = {
    none: 'gap-0',
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
};
const flowStyles = {
    row: 'grid-flow-row',
    column: 'grid-flow-col',
    dense: 'grid-flow-dense',
    'row-dense': 'grid-flow-row-dense',
    'column-dense': 'grid-flow-col-dense',
};
const alignItemsStyles = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
};
const justifyItemsStyles = {
    start: 'justify-items-start',
    center: 'justify-items-center',
    end: 'justify-items-end',
    stretch: 'justify-items-stretch',
};
export const Grid = React.forwardRef(({ columns = 1, smColumns, mdColumns, lgColumns, xlColumns, gap = 'md', rowGap, columnGap, flow, alignItems, justifyItems, children, className = '', ...props }, ref) => {
    return (_jsx("div", { ref: ref, className: [
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
            .join(' '), ...props, children: children }));
});
Grid.displayName = 'Grid';
export default Grid;
//# sourceMappingURL=grid.js.map