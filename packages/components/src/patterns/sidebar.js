import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * WebBuilder Components - Sidebar Navigation Component
 * A side navigation with collapsible menu items and icons.
 */
import React, { useState } from 'react';
export const Sidebar = React.forwardRef(({ items, logo, footer, collapsible = true, collapsed: controlledCollapsed, defaultCollapsed = false, onCollapseChange, width = 256, collapsedWidth = 72, backgroundColor = 'bg-white', showSearch = false, searchPlaceholder = 'Search...', className = '', ...props }, ref) => {
    const [uncontrolledCollapsed, setUncontrolledCollapsed] = useState(defaultCollapsed);
    const [searchQuery, setSearchQuery] = useState('');
    const [openItems, setOpenItems] = useState([]);
    const collapsed = controlledCollapsed !== undefined ? controlledCollapsed : uncontrolledCollapsed;
    const handleToggleCollapse = () => {
        const newState = !collapsed;
        if (controlledCollapsed === undefined) {
            setUncontrolledCollapsed(newState);
        }
        onCollapseChange?.(newState);
    };
    const toggleItem = (id) => {
        setOpenItems((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
    };
    const filteredItems = searchQuery
        ? items.filter((item) => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
        : items;
    const renderItem = (item, depth = 0) => {
        const hasChildren = !!item.children?.length;
        const isOpen = openItems.includes(item.id);
        return (_jsxs("div", { children: [_jsxs("a", { href: item.href, onClick: (e) => {
                        if (hasChildren || item.onClick) {
                            e.preventDefault();
                        }
                        if (item.onClick)
                            item.onClick();
                        if (hasChildren)
                            toggleItem(item.id);
                    }, className: [
                        'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                        item.active
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:bg-gray-100',
                        item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                        depth > 0 ? 'pl-10' : '',
                    ]
                        .filter(Boolean)
                        .join(' '), children: [!collapsed && (_jsxs(_Fragment, { children: [item.icon && (_jsx("span", { className: "flex-shrink-0 w-5 h-5", children: item.icon })), _jsx("span", { className: "flex-1 text-sm font-medium truncate", children: item.label }), item.badge && (_jsx("span", { className: "px-1.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-600 rounded-full", children: item.badge })), hasChildren && (_jsx("svg", { className: ['w-4 h-4 transition-transform', isOpen ? 'rotate-180' : ''].join(' '), fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" }) }))] })), collapsed && (_jsx("span", { className: "flex-shrink-0 w-5 h-5 mx-auto", children: item.icon }))] }), hasChildren && isOpen && !collapsed && (_jsx("div", { className: "mt-1 space-y-0.5", children: item.children.map((child) => renderItem(child, depth + 1)) }))] }, item.id));
    };
    return (_jsxs("aside", { ref: ref, className: [
            'h-full flex flex-col border-r border-gray-200 transition-all duration-300',
            backgroundColor,
            className,
        ].join(' '), style: { width: collapsed ? collapsedWidth : width }, ...props, children: [_jsxs("div", { className: "flex items-center justify-between h-16 px-4 border-b border-gray-200", children: [!collapsed && logo && _jsx("div", { className: "flex-shrink-0", children: logo }), collapsible && (_jsx("button", { type: "button", onClick: handleToggleCollapse, className: "p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500", "aria-label": collapsed ? 'Expand sidebar' : 'Collapse sidebar', children: _jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: collapsed ? (_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 6h16M4 12h16M4 18h16" })) : (_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M11 19l-7-7 7-7M4 12h16" })) }) }))] }), showSearch && !collapsed && (_jsx("div", { className: "px-4 py-3", children: _jsxs("div", { className: "relative", children: [_jsx("svg", { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }), _jsx("input", { type: "text", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: searchPlaceholder, className: "w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500" })] }) })), _jsx("nav", { className: "flex-1 px-2 py-4 space-y-1 overflow-y-auto", children: filteredItems.map((item) => renderItem(item)) }), footer && (_jsx("div", { className: "border-t border-gray-200 p-4", children: footer }))] }));
});
Sidebar.displayName = 'Sidebar';
export default Sidebar;
//# sourceMappingURL=sidebar.js.map