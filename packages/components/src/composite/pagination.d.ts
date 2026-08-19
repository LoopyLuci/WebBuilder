/**
 * WebBuilder Components - Pagination Component
 * A pagination component with page numbers, navigation, and size options.
 */
import React from 'react';
export type PaginationSize = 'sm' | 'md' | 'lg';
export interface PaginationProps extends React.HTMLAttributes<HTMLElement> {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    size?: PaginationSize;
    showFirstLast?: boolean;
    showPrevNext?: boolean;
    siblingCount?: number;
    boundaryCount?: number;
    disabled?: boolean;
}
export declare const Pagination: React.ForwardRefExoticComponent<PaginationProps & React.RefAttributes<HTMLElement>>;
export default Pagination;
//# sourceMappingURL=pagination.d.ts.map