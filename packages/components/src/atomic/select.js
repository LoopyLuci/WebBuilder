import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * WebBuilder Components - Atomic Select Component
 * A flexible select dropdown with label, error, and helper text support.
 */
import React from 'react';
const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-4 py-3 text-base',
};
export const Select = React.forwardRef(({ label, error, helperText, size = 'md', fullWidth = false, options, placeholder, id, disabled, className = '', ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substring(2, 9)}`;
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;
    const baseStyles = `block rounded-md border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed appearance-none bg-no-repeat bg-[length:1.25rem] bg-[right_0.5rem_center]`;
    const stateStyles = error
        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';
    return (_jsxs("div", { className: fullWidth ? 'w-full' : '', children: [label && (_jsx("label", { htmlFor: selectId, className: "block text-sm font-medium text-gray-700 mb-1.5", children: label })), _jsxs("select", { ref: ref, id: selectId, disabled: disabled, "aria-invalid": !!error, "aria-describedby": [error ? errorId : null, helperText && !error ? helperId : null]
                    .filter(Boolean)
                    .join(' ') || undefined, className: [
                    baseStyles,
                    stateStyles,
                    sizeStyles[size],
                    fullWidth ? 'w-full' : '',
                    'pr-10 bg-white text-gray-900',
                    className,
                ]
                    .filter(Boolean)
                    .join(' '), ...props, children: [placeholder && (_jsx("option", { value: "", disabled: true, children: placeholder })), options.map((option) => (_jsx("option", { value: option.value, disabled: option.disabled, children: option.label }, option.value)))] }), error && (_jsx("p", { id: errorId, className: "mt-1.5 text-sm text-red-600", role: "alert", children: error })), helperText && !error && (_jsx("p", { id: helperId, className: "mt-1.5 text-sm text-gray-500", children: helperText }))] }));
});
Select.displayName = 'Select';
export default Select;
//# sourceMappingURL=select.js.map