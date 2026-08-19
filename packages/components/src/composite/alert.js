import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * WebBuilder Components - Alert Component
 * A flexible alert component with multiple variants and dismiss support.
 */
import React from 'react';
const variantStyles = {
    info: {
        container: 'bg-blue-50 border-blue-200',
        icon: 'text-blue-600',
        title: 'text-blue-900',
    },
    success: {
        container: 'bg-green-50 border-green-200',
        icon: 'text-green-600',
        title: 'text-green-900',
    },
    warning: {
        container: 'bg-yellow-50 border-yellow-200',
        icon: 'text-yellow-600',
        title: 'text-yellow-900',
    },
    error: {
        container: 'bg-red-50 border-red-200',
        icon: 'text-red-600',
        title: 'text-red-900',
    },
};
const defaultIcons = {
    info: (_jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) })),
    success: (_jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) })),
    warning: (_jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" }) })),
    error: (_jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" }) })),
};
export const Alert = React.forwardRef(({ variant = 'info', title, icon, dismissible = false, onDismiss, action, children, className = '', ...props }, ref) => {
    const styles = variantStyles[variant];
    const displayIcon = icon !== undefined ? icon : defaultIcons[variant];
    return (_jsxs("div", { ref: ref, role: "alert", className: [
            'flex items-start gap-3 p-4 rounded-lg border',
            styles.container,
            className,
        ]
            .filter(Boolean)
            .join(' '), ...props, children: [_jsx("span", { className: ['flex-shrink-0', styles.icon].join(' '), children: displayIcon }), _jsxs("div", { className: "flex-1 min-w-0", children: [title && (_jsx("h4", { className: ['text-sm font-semibold', styles.title].join(' '), children: title })), children && (_jsx("div", { className: ['text-sm text-gray-700', title ? 'mt-1' : ''].join(' '), children: children })), action && _jsx("div", { className: "mt-3", children: action })] }), dismissible && (_jsx("button", { type: "button", onClick: onDismiss, className: "flex-shrink-0 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/50 transition-colors", "aria-label": "Dismiss", children: _jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) }))] }));
});
Alert.displayName = 'Alert';
export default Alert;
//# sourceMappingURL=alert.js.map