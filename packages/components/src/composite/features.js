import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * WebBuilder Components - Features Grid Section Component
 * A features section with icon, title, description grid.
 */
import React from 'react';
const columnStyles = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};
export const Features = React.forwardRef(({ title, subtitle, features, layout = 'grid', columns = 3, centered = true, backgroundColor, className = '', ...props }, ref) => {
    if (layout === 'list') {
        return (_jsx("section", { ref: ref, className: ['py-16 md:py-24', className].filter(Boolean).join(' '), style: backgroundColor ? { backgroundColor } : undefined, ...props, children: _jsxs("div", { className: "container mx-auto px-4", children: [(title || subtitle) && (_jsxs("div", { className: ['max-w-2xl mb-12', centered ? 'mx-auto text-center' : ''].join(' '), children: [subtitle && (_jsx("p", { className: "text-sm font-semibold uppercase tracking-wider text-blue-600 mb-2", children: subtitle })), title && (_jsx("h2", { className: "text-3xl md:text-4xl font-bold text-gray-900", children: title }))] })), _jsx("div", { className: "space-y-8", children: features.map((feature, index) => (_jsxs("div", { className: "flex gap-6 p-6 rounded-lg hover:bg-gray-50 transition-colors", children: [feature.icon && (_jsx("div", { className: "flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-blue-100 text-blue-600", children: feature.icon })), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: feature.title }), _jsx("p", { className: "mt-1 text-gray-600", children: feature.description }), feature.link && (_jsxs("a", { href: feature.link, className: "inline-flex items-center mt-3 text-sm font-medium text-blue-600 hover:text-blue-700", children: [feature.linkText || 'Learn more', _jsx("svg", { className: "ml-1 w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) })] }))] })] }, index))) })] }) }));
    }
    return (_jsx("section", { ref: ref, className: ['py-16 md:py-24', className].filter(Boolean).join(' '), style: backgroundColor ? { backgroundColor } : undefined, ...props, children: _jsxs("div", { className: "container mx-auto px-4", children: [(title || subtitle) && (_jsxs("div", { className: ['max-w-2xl mb-12', centered ? 'mx-auto text-center' : ''].join(' '), children: [subtitle && (_jsx("p", { className: "text-sm font-semibold uppercase tracking-wider text-blue-600 mb-2", children: subtitle })), title && (_jsx("h2", { className: "text-3xl md:text-4xl font-bold text-gray-900", children: title }))] })), _jsx("div", { className: [
                        'grid gap-6',
                        layout === 'cards' ? 'gap-8' : '',
                        columnStyles[columns],
                    ]
                        .filter(Boolean)
                        .join(' '), children: features.map((feature, index) => (_jsxs("div", { className: [
                            'group',
                            layout === 'cards'
                                ? 'p-6 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow'
                                : 'p-4',
                        ].join(' '), children: [feature.icon && (_jsx("div", { className: [
                                    'flex items-center justify-center rounded-lg bg-blue-100 text-blue-600 mb-4',
                                    layout === 'cards' ? 'w-12 h-12' : 'w-10 h-10',
                                ].join(' '), children: feature.icon })), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: feature.title }), _jsx("p", { className: "text-gray-600 text-sm leading-relaxed", children: feature.description }), feature.link && (_jsxs("a", { href: feature.link, className: "inline-flex items-center mt-4 text-sm font-medium text-blue-600 hover:text-blue-700 group-hover:underline", children: [feature.linkText || 'Learn more', _jsx("svg", { className: "ml-1 w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) })] }))] }, index))) })] }) }));
});
Features.displayName = 'Features';
export default Features;
//# sourceMappingURL=features.js.map