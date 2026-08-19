import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * WebBuilder Components - Stats Component
 * A statistics display component with icons, trends, and grid layout.
 */
import React from 'react';
const columnStyles = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};
const variantContainerStyles = {
    default: '',
    cards: '',
    minimal: '',
    bordered: '',
};
const variantItemStyles = {
    default: 'bg-white p-6 rounded-lg shadow-sm border border-gray-200',
    cards: 'bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow',
    minimal: 'p-4',
    bordered: 'p-6 border-2 border-gray-200 rounded-lg',
};
const sizeStyles = {
    sm: { value: 'text-xl', label: 'text-xs' },
    md: { value: 'text-2xl', label: 'text-sm' },
    lg: { value: 'text-3xl', label: 'text-base' },
};
export const Stats = React.forwardRef(({ stats, columns = 4, variant = 'default', size = 'md', className = '', ...props }, ref) => {
    const sStyles = sizeStyles[size];
    return (_jsx("div", { ref: ref, className: ['grid gap-4', columnStyles[columns], className]
            .filter(Boolean)
            .join(' '), ...props, children: stats.map((stat) => (_jsx("div", { className: variantItemStyles[variant], children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsx("p", { className: ['font-medium text-gray-500', sStyles.label].join(' '), children: stat.label }), _jsx("p", { className: [
                                    'font-bold text-gray-900 mt-1',
                                    sStyles.value,
                                ].join(' '), children: stat.value }), stat.trend && (_jsxs("div", { className: "flex items-center gap-1 mt-2", children: [stat.trend.direction === 'up' ? (_jsx("svg", { className: "w-4 h-4 text-green-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 10l7-7m0 0l7 7m-7-7v18" }) })) : (_jsx("svg", { className: "w-4 h-4 text-red-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 14l-7 7m0 0l-7-7m7 7V3" }) })), _jsx("span", { className: [
                                            'text-sm font-medium',
                                            stat.trend.direction === 'up' ? 'text-green-600' : 'text-red-600',
                                        ].join(' '), children: stat.trend.value }), stat.trend.label && (_jsx("span", { className: "text-sm text-gray-500", children: stat.trend.label }))] })), stat.description && !stat.trend && (_jsx("p", { className: "text-sm text-gray-500 mt-1", children: stat.description }))] }), stat.icon && (_jsx("div", { className: [
                            'flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg',
                            stat.color || 'bg-blue-100 text-blue-600',
                        ].join(' '), children: stat.icon }))] }) }, stat.id))) }));
});
Stats.displayName = 'Stats';
export default Stats;
//# sourceMappingURL=stats.js.map