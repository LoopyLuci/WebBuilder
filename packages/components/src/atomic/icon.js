import { jsx as _jsx } from "react/jsx-runtime";
/**
 * WebBuilder Components - Icon Component
 * A flexible icon component with multiple sizes and colors.
 */
import React from 'react';
const sizeStyles = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
    '2xl': 'w-10 h-10',
};
export const Icon = React.forwardRef(({ name, size = 'md', color, icon, className = '', ...props }, ref) => {
    return (_jsx("span", { ref: ref, className: ['inline-flex items-center justify-center', sizeStyles[size], className]
            .filter(Boolean)
            .join(' '), style: color ? { color } : undefined, "aria-hidden": "true", ...props, children: icon || (_jsx("svg", { className: "w-full h-full", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) })) }));
});
Icon.displayName = 'Icon';
export default Icon;
//# sourceMappingURL=icon.js.map