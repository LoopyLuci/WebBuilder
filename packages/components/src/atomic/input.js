import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * WebBuilder Components - Atomic Input Component
 * A flexible text input with label, error, and helper text support.
 */
import React from 'react';
const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-4 py-3 text-base',
};
export const Input = React.forwardRef(({ label, error, helperText, size = 'md', fullWidth = false, leftAddon, rightAddon, id, disabled, className = '', ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;
    const baseStyles = 'block rounded-md border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed';
    const stateStyles = error
        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';
    return (_jsxs("div", { className: fullWidth ? 'w-full' : '', children: [label && (_jsx("label", { htmlFor: inputId, className: "block text-sm font-medium text-gray-700 mb-1.5", children: label })), _jsxs("div", { className: "relative flex items-center", children: [leftAddon && (_jsx("span", { className: "absolute left-3 text-gray-400 pointer-events-none z-10", children: leftAddon })), _jsx("input", { ref: ref, id: inputId, disabled: disabled, "aria-invalid": !!error, "aria-describedby": [error ? errorId : null, helperText && !error ? helperId : null]
                            .filter(Boolean)
                            .join(' ') || undefined, className: [
                            baseStyles,
                            stateStyles,
                            sizeStyles[size],
                            fullWidth ? 'w-full' : '',
                            leftAddon ? 'pl-10' : '',
                            rightAddon ? 'pr-10' : '',
                            'bg-white text-gray-900 placeholder-gray-400',
                            className,
                        ]
                            .filter(Boolean)
                            .join(' '), ...props }), rightAddon && (_jsx("span", { className: "absolute right-3 text-gray-400 pointer-events-none", children: rightAddon }))] }), error && (_jsx("p", { id: errorId, className: "mt-1.5 text-sm text-red-600", role: "alert", children: error })), helperText && !error && (_jsx("p", { id: helperId, className: "mt-1.5 text-sm text-gray-500", children: helperText }))] }));
});
Input.displayName = 'Input';
export default Input;
//# sourceMappingURL=input.js.map