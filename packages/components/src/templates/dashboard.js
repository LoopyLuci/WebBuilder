import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * WebBuilder Components - Dashboard Layout Template
 * A complete dashboard layout with sidebar, header, and main content area.
 */
import React from 'react';
const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
};
const maxWidthStyles = {
    none: '',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
};
export const DashboardHeader = React.forwardRef(({ logo, title, breadcrumbs, actions, userMenu, search, className = '', ...props }, ref) => {
    return (_jsxs("header", { ref: ref, className: [
            'w-full h-16 border-b border-gray-200 bg-white flex items-center justify-between px-4 md:px-6',
            className,
        ].join(' '), ...props, children: [_jsxs("div", { className: "flex items-center gap-4", children: [logo && _jsx("div", { className: "flex-shrink-0", children: logo }), breadcrumbs && (_jsx("nav", { "aria-label": "Breadcrumb", className: "hidden md:block", children: _jsx("ol", { className: "flex items-center gap-2 text-sm", children: breadcrumbs.map((crumb, index) => (_jsxs("li", { className: "flex items-center gap-2", children: [index > 0 && (_jsx("svg", { className: "w-4 h-4 text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) })), crumb.href ? (_jsx("a", { href: crumb.href, className: "text-gray-600 hover:text-gray-900", children: crumb.label })) : (_jsx("span", { className: "text-gray-900 font-medium", children: crumb.label }))] }, index))) }) })), title && (_jsx("h1", { className: "text-lg font-semibold text-gray-900 hidden md:block", children: title }))] }), _jsxs("div", { className: "flex items-center gap-4", children: [search && _jsx("div", { className: "hidden md:block", children: search }), actions && _jsx("div", { className: "flex items-center gap-2", children: actions }), userMenu && _jsx("div", { className: "flex-shrink-0", children: userMenu })] })] }));
});
DashboardHeader.displayName = 'DashboardHeader';
export const DashboardContent = React.forwardRef(({ padding = 'md', maxWidth = 'none', children, className = '', ...props }, ref) => {
    return (_jsx("main", { ref: ref, className: [
            'flex-1 overflow-auto',
            paddingStyles[padding],
            className,
        ].join(' '), ...props, children: _jsx("div", { className: ['mx-auto', maxWidthStyles[maxWidth]].filter(Boolean).join(' '), children: children }) }));
});
DashboardContent.displayName = 'DashboardContent';
export const DashboardCard = React.forwardRef(({ title, description, icon, actions, noPadding = false, hoverable = false, children, className = '', ...props }, ref) => {
    return (_jsxs("div", { ref: ref, className: [
            'bg-white rounded-xl border border-gray-200',
            hoverable ? 'hover:shadow-md transition-shadow' : '',
            className,
        ]
            .filter(Boolean)
            .join(' '), ...props, children: [(title || description || actions) && (_jsxs("div", { className: "flex items-start justify-between p-4 md:p-6 border-b border-gray-200", children: [_jsxs("div", { className: "flex items-center gap-3", children: [icon && (_jsx("div", { className: "flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center", children: icon })), _jsxs("div", { children: [title && _jsx("h3", { className: "text-sm font-semibold text-gray-900", children: title }), description && _jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: description })] })] }), actions && _jsx("div", { className: "flex items-center gap-2", children: actions })] })), !noPadding ? (_jsx("div", { className: "p-4 md:p-6", children: children })) : (children)] }));
});
DashboardCard.displayName = 'DashboardCard';
export const DashboardStat = ({ label, value, change, icon, trend, }) => {
    return (_jsxs("div", { className: "bg-white rounded-xl border border-gray-200 p-4 md:p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm text-gray-500", children: label }), icon && (_jsx("div", { className: "w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center", children: icon }))] }), _jsxs("div", { className: "flex items-end justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-2xl font-bold text-gray-900", children: value }), change && (_jsxs("p", { className: [
                                    'text-xs font-medium mt-1',
                                    change.type === 'increase' ? 'text-green-600' : '',
                                    change.type === 'decrease' ? 'text-red-600' : '',
                                    change.type === 'neutral' ? 'text-gray-500' : '',
                                ]
                                    .filter(Boolean)
                                    .join(' '), children: [change.type === 'increase' ? '↑' : change.type === 'decrease' ? '↓' : '→', ' ', Math.abs(change.value), "%"] }))] }), trend && (_jsx("div", { className: "flex items-end gap-0.5 h-8", children: trend.map((point, index) => (_jsx("div", { className: "w-1.5 bg-blue-500 rounded-sm", style: { height: `${(point / Math.max(...trend)) * 100}%` } }, index))) }))] })] }));
};
DashboardStat.displayName = 'DashboardStat';
export const DashboardChart = React.forwardRef(({ title, subtitle, children, actions, className = '', ...props }, ref) => {
    return (_jsxs("div", { ref: ref, className: [
            'bg-white rounded-xl border border-gray-200',
            className,
        ].join(' '), ...props, children: [(title || subtitle || actions) && (_jsxs("div", { className: "flex items-center justify-between p-4 md:p-6 border-b border-gray-200", children: [_jsxs("div", { children: [title && _jsx("h3", { className: "text-sm font-semibold text-gray-900", children: title }), subtitle && _jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: subtitle })] }), actions && _jsx("div", { className: "flex items-center gap-2", children: actions })] })), _jsx("div", { className: "p-4 md:p-6", children: children })] }));
});
DashboardChart.displayName = 'DashboardChart';
export const Dashboard = ({ sidebar, header, children, sidebarCollapsed, onSidebarCollapseChange, contentPadding = 'md', }) => {
    return (_jsxs("div", { className: "min-h-screen flex bg-gray-50", children: [sidebar, _jsxs("div", { className: "flex-1 flex flex-col min-w-0", children: [header, _jsx(DashboardContent, { padding: contentPadding, children: children })] })] }));
};
Dashboard.displayName = 'Dashboard';
export default Object.assign(Dashboard, {
    Header: DashboardHeader,
    Content: DashboardContent,
    Card: DashboardCard,
    Stat: DashboardStat,
    Chart: DashboardChart,
});
//# sourceMappingURL=dashboard.js.map