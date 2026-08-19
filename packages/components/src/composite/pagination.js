import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * WebBuilder Components - Pagination Component
 * A pagination component with page numbers, navigation, and size options.
 */
import React from 'react';
const sizeStyles = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
};
export const Pagination = React.forwardRef(({ currentPage, totalPages, onPageChange, size = 'md', showFirstLast = true, showPrevNext = true, siblingCount = 1, boundaryCount = 1, disabled = false, className = '', ...props }, ref) => {
    const getPageNumbers = () => {
        const pages = [];
        const leftSibling = Math.max(currentPage - siblingCount, 1);
        const rightSibling = Math.min(currentPage + siblingCount, totalPages);
        const showLeftDots = leftSibling > boundaryCount + 1;
        const showRightDots = rightSibling < totalPages - boundaryCount;
        if (!showLeftDots && showRightDots) {
            const leftRange = boundaryCount + 2 * siblingCount + 1;
            for (let i = 1; i <= Math.min(leftRange, totalPages); i++) {
                pages.push(i);
            }
            pages.push('...');
            pages.push(totalPages);
        }
        else if (showLeftDots && !showRightDots) {
            pages.push(1);
            pages.push('...');
            const rightRange = totalPages - boundaryCount - 2 * siblingCount;
            for (let i = Math.max(rightRange, 1); i <= totalPages; i++) {
                pages.push(i);
            }
        }
        else if (showLeftDots && showRightDots) {
            pages.push(1);
            pages.push('...');
            for (let i = leftSibling; i <= rightSibling; i++) {
                pages.push(i);
            }
            pages.push('...');
            pages.push(totalPages);
        }
        else {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        }
        return pages;
    };
    const pages = getPageNumbers();
    return (_jsxs("nav", { ref: ref, role: "navigation", "aria-label": "Pagination", className: ['flex items-center gap-1', className].filter(Boolean).join(' '), ...props, children: [showFirstLast && (_jsx("button", { type: "button", onClick: () => onPageChange(1), disabled: disabled || currentPage === 1, className: [
                    'flex items-center justify-center rounded-lg font-medium transition-colors',
                    sizeStyles[size],
                    'text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed',
                ].join(' '), "aria-label": "Go to first page", children: _jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M11 19l-7-7 7-7M18 19l-7-7 7-7" }) }) })), showPrevNext && (_jsx("button", { type: "button", onClick: () => onPageChange(currentPage - 1), disabled: disabled || currentPage === 1, className: [
                    'flex items-center justify-center rounded-lg font-medium transition-colors',
                    sizeStyles[size],
                    'text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed',
                ].join(' '), "aria-label": "Go to previous page", children: _jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }) })), pages.map((page, index) => page === '...' ? (_jsx("span", { className: [
                    'flex items-center justify-center text-gray-400',
                    sizeStyles[size],
                ].join(' '), children: "..." }, `dots-${index}`)) : (_jsx("button", { type: "button", onClick: () => onPageChange(page), disabled: disabled, className: [
                    'flex items-center justify-center rounded-lg font-medium transition-colors',
                    sizeStyles[size],
                    page === currentPage
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100',
                    disabled ? 'opacity-50 cursor-not-allowed' : '',
                ].join(' '), "aria-label": `Go to page ${page}`, "aria-current": page === currentPage ? 'page' : undefined, children: page }, page))), showPrevNext && (_jsx("button", { type: "button", onClick: () => onPageChange(currentPage + 1), disabled: disabled || currentPage === totalPages, className: [
                    'flex items-center justify-center rounded-lg font-medium transition-colors',
                    sizeStyles[size],
                    'text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed',
                ].join(' '), "aria-label": "Go to next page", children: _jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) }) })), showFirstLast && (_jsx("button", { type: "button", onClick: () => onPageChange(totalPages), disabled: disabled || currentPage === totalPages, className: [
                    'flex items-center justify-center rounded-lg font-medium transition-colors',
                    sizeStyles[size],
                    'text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed',
                ].join(' '), "aria-label": "Go to last page", children: _jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 5l7 7-7 7M6 5l7 7-7 7" }) }) }))] }));
});
Pagination.displayName = 'Pagination';
export default Pagination;
//# sourceMappingURL=pagination.js.map