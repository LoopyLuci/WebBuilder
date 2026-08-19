import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * WebBuilder Components - Breadcrumb Component
 * A navigation breadcrumb with separators and collapse support.
 */
import React from 'react';
const sizeStyles = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
};
export const Breadcrumb = React.forwardRef(({ items, separator, maxItems, size = 'md', className = '', ...props }, ref) => {
    const defaultSeparator = (_jsx("svg", { className: "w-4 h-4 text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) }));
    const renderSeparator = separator || defaultSeparator;
    let displayItems = items;
    let collapsed = false;
    if (maxItems && items.length > maxItems) {
        collapsed = true;
        const startItems = items.slice(0, 1);
        const endItems = items.slice(-(maxItems - 1));
        displayItems = [...startItems, { label: '...', active: false }, ...endItems];
    }
    return (_jsx("nav", { ref: ref, "aria-label": "Breadcrumb", className: ['flex', className].filter(Boolean).join(' '), ...props, children: _jsx("ol", { className: "flex items-center flex-wrap gap-2", children: displayItems.map((item, index) => (_jsxs("li", { className: "flex items-center gap-2", children: [index > 0 && _jsx("span", { className: "flex-shrink-0", children: renderSeparator }), item.active || !item.href ? (_jsxs("span", { className: [
                            'font-medium text-gray-900 flex items-center gap-1.5',
                            sizeStyles[size],
                            item.label === '...' ? 'text-gray-400' : '',
                        ].join(' '), "aria-current": item.active ? 'page' : undefined, children: [item.icon, item.label] })) : (_jsxs("a", { href: item.href, className: [
                            'text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1.5',
                            sizeStyles[size],
                        ].join(' '), children: [item.icon, item.label] }))] }, index))) }) }));
});
Breadcrumb.displayName = 'Breadcrumb';
export default Breadcrumb;
//# sourceMappingURL=breadcrumb.js.map