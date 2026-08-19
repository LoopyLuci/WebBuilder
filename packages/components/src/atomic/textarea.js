import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * WebBuilder Components - Atomic Textarea Component
 * A flexible textarea with label, error, and helper text support.
 */
import React from 'react';
const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-4 py-3 text-base',
};
const resizeStyles = {
    none: 'resize-none',
    both: 'resize',
    horizontal: 'resize-x',
    vertical: 'resize-y',
};
export const Textarea = React.forwardRef(({ label, error, helperText, size = 'md', fullWidth = false, resize = 'vertical', id, disabled, className = '', ...props }, ref) => {
    const inputId = id || `textarea-${Math.random().toString(36).substring(2, 9)}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;
    const baseStyles = 'block rounded-md border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed';
    const stateStyles = error
        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';
    return (_jsxs("div", { className: fullWidth ? 'w-full' : '', children: [label && (_jsx("label", { htmlFor: inputId, className: "block text-sm font-medium text-gray-700 mb-1.5", children: label })), _jsx("textarea", { ref: ref, id: inputId, disabled: disabled, "aria-invalid": !!error, "aria-describedby": [error ? errorId : null, helperText && !error ? helperId : null]
                    .filter(Boolean)
                    .join(' ') || undefined, className: [
                    baseStyles,
                    stateStyles,
                    sizeStyles[size],
                    resizeStyles[resize],
                    fullWidth ? 'w-full' : '',
                    'bg-white text-gray-900 placeholder-gray-400',
                    className,
                ]
                    .filter(Boolean)
                    .join(' '), ...props }), error && (_jsx("p", { id: errorId, className: "mt-1.5 text-sm text-red-600", role: "alert", children: error })), helperText && !error && (_jsx("p", { id: helperId, className: "mt-1.5 text-sm text-gray-500", children: helperText }))] }));
});
Textarea.displayName = 'Textarea';
export default Textarea;
//# sourceMappingURL=textarea.js.map