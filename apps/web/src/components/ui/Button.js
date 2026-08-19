'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from 'react';
export const Button = forwardRef(({ variant = 'primary', size = 'md', loading, children, icon, iconPosition = 'left', disabled, className = '', shortcut, ...props }, ref) => {
    const base = 'btn';
    const variants = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        ghost: 'btn-ghost',
        danger: 'btn-danger',
    };
    const sizes = {
        sm: 'btn-sm',
        md: 'btn-md',
        lg: 'btn-lg',
        icon: 'btn-icon',
    };
    const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
    return (_jsxs("button", { ref: ref, className: classes, disabled: disabled || loading, "aria-busy": loading, ...props, children: [loading && (_jsxs("svg", { className: "animate-spin h-4 w-4", viewBox: "0 0 24 24", "aria-hidden": "true", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4", fill: "none" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" })] })), !loading && icon && iconPosition === 'left' && _jsx("span", { "aria-hidden": "true", children: icon }), children && _jsx("span", { children: children }), !loading && icon && iconPosition === 'right' && _jsx("span", { "aria-hidden": "true", children: icon }), shortcut && (_jsx("kbd", { className: "ml-2 px-1.5 py-0.5 text-[10px] font-medium opacity-70 bg-white/20 rounded", children: shortcut }))] }));
});
Button.displayName = 'Button';
export default Button;
//# sourceMappingURL=Button.js.map