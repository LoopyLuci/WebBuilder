import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * WebBuilder Components - Responsive Navigation Bar Component
 * A responsive navbar with logo, links, and mobile menu.
 */
import React, { useState } from 'react';
export const Navbar = React.forwardRef(({ logo, items, actions, sticky = false, transparent = false, mobileBreakpoint = 'md', backgroundColor = 'bg-white', className = '', ...props }, ref) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);
    return (_jsx("header", { ref: ref, className: [
            'w-full z-50',
            sticky ? 'sticky top-0' : '',
            transparent ? 'bg-transparent' : backgroundColor,
            'border-b border-gray-200',
            className,
        ]
            .filter(Boolean)
            .join(' '), ...props, children: _jsxs("nav", { className: "container mx-auto px-4", children: [_jsxs("div", { className: "flex items-center justify-between h-16", children: [_jsx("div", { className: "flex-shrink-0", children: logo || (_jsx("span", { className: "text-xl font-bold text-gray-900", children: "Logo" })) }), _jsx("div", { className: "hidden md:flex items-center space-x-1", children: items.map((item, index) => (_jsxs("div", { className: "relative", children: [_jsxs("a", { href: item.href, target: item.external ? '_blank' : undefined, rel: item.external ? 'noopener noreferrer' : undefined, className: [
                                            'inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                                            item.active
                                                ? 'text-blue-600 bg-blue-50'
                                                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50',
                                        ].join(' '), onMouseEnter: () => item.children && setOpenDropdown(item.label), onMouseLeave: () => setOpenDropdown(null), children: [item.label, item.badge && (_jsx("span", { className: "ml-1.5 px-1.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-600 rounded-full", children: item.badge })), item.children && (_jsx("svg", { className: "ml-1 w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" }) }))] }), item.children && openDropdown === item.label && (_jsx("div", { className: "absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50", onMouseEnter: () => setOpenDropdown(item.label), onMouseLeave: () => setOpenDropdown(null), children: item.children.map((child, cIndex) => (_jsx("a", { href: child.href, className: "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600", children: child.label }, cIndex))) }))] }, index))) }), actions && (_jsx("div", { className: "hidden md:flex items-center space-x-3", children: actions })), _jsx("button", { type: "button", onClick: () => setMobileMenuOpen(!mobileMenuOpen), className: "md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50", "aria-expanded": mobileMenuOpen, "aria-label": "Toggle navigation menu", children: mobileMenuOpen ? (_jsx("svg", { className: "w-6 h-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })) : (_jsx("svg", { className: "w-6 h-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 6h16M4 12h16M4 18h16" }) })) })] }), mobileMenuOpen && (_jsxs("div", { className: "md:hidden border-t border-gray-200 py-3", children: [_jsx("div", { className: "space-y-1", children: items.map((item, index) => (_jsxs("div", { children: [_jsx("a", { href: item.href, className: [
                                            'block px-3 py-2 text-base font-medium rounded-md',
                                            item.active
                                                ? 'text-blue-600 bg-blue-50'
                                                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50',
                                        ].join(' '), children: _jsxs("span", { className: "flex items-center justify-between", children: [item.label, item.badge && (_jsx("span", { className: "px-1.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-600 rounded-full", children: item.badge }))] }) }), item.children && (_jsx("div", { className: "pl-6 space-y-1 mt-1", children: item.children.map((child, cIndex) => (_jsx("a", { href: child.href, className: "block px-3 py-2 text-sm text-gray-600 hover:text-blue-600", children: child.label }, cIndex))) }))] }, index))) }), actions && (_jsx("div", { className: "mt-4 pt-4 border-t border-gray-200 px-3 space-y-2", children: actions }))] }))] }) }));
});
Navbar.displayName = 'Navbar';
export default Navbar;
//# sourceMappingURL=navbar.js.map