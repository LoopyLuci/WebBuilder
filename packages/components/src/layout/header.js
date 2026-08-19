import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * WebBuilder Components - Header Component
 * A page header with title, description, and action slots.
 */
import React from 'react';
const sizeStyles = {
    sm: { title: 'text-lg', description: 'text-sm' },
    md: { title: 'text-2xl', description: 'text-base' },
    lg: { title: 'text-3xl', description: 'text-lg' },
};
export const Header = React.forwardRef(({ title, subtitle, description, actions, breadcrumbs, centered = false, size = 'md', className = '', ...props }, ref) => {
    const sStyles = sizeStyles[size];
    return (_jsxs("div", { ref: ref, className: ['w-full', className].filter(Boolean).join(' '), ...props, children: [breadcrumbs && _jsx("div", { className: "mb-4", children: breadcrumbs }), _jsxs("div", { className: [
                    'flex flex-col md:flex-row md:items-center md:justify-between gap-4',
                    centered ? 'text-center' : '',
                ].join(' '), children: [_jsxs("div", { className: centered ? 'mx-auto' : '', children: [subtitle && (_jsx("p", { className: "text-sm font-medium text-blue-600 mb-1", children: subtitle })), _jsx("h1", { className: [
                                    'font-bold text-gray-900',
                                    sStyles.title,
                                ].join(' '), children: title }), description && (_jsx("p", { className: [
                                    'mt-2 text-gray-600 max-w-2xl',
                                    sStyles.description,
                                    centered ? 'mx-auto' : '',
                                ].join(' '), children: description }))] }), actions && (_jsx("div", { className: [
                            'flex items-center gap-3',
                            centered ? 'mx-auto' : 'flex-shrink-0',
                        ].join(' '), children: actions }))] })] }));
});
Header.displayName = 'Header';
export default Header;
//# sourceMappingURL=header.js.map