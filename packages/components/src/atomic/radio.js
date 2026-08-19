import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * WebBuilder Components - Atomic Radio Component
 * A flexible radio button with label and error support.
 */
import React from 'react';
const sizeStyles = {
    sm: { box: 'w-4 h-4', text: 'text-sm', desc: 'text-xs' },
    md: { box: 'w-5 h-5', text: 'text-sm', desc: 'text-sm' },
    lg: { box: 'w-6 h-6', text: 'text-base', desc: 'text-sm' },
};
export const Radio = React.forwardRef(({ label, description, size = 'md', error, id, disabled, className = '', ...props }, ref) => {
    const radioId = id || `radio-${Math.random().toString(36).substring(2, 9)}`;
    const errorId = `${radioId}-error`;
    const sizes = sizeStyles[size];
    return (_jsxs("div", { className: ['inline-flex flex-col', className].filter(Boolean).join(' '), children: [_jsxs("label", { htmlFor: radioId, className: [
                    'inline-flex items-start gap-3 cursor-pointer',
                    disabled ? 'cursor-not-allowed opacity-50' : '',
                ].join(' '), children: [_jsx("span", { className: "flex items-center justify-center flex-shrink-0 pt-0.5", children: _jsx("input", { ref: ref, type: "radio", id: radioId, disabled: disabled, "aria-invalid": !!error, "aria-describedby": error ? errorId : undefined, className: [
                                sizes.box,
                                'rounded-full border-2 transition-colors duration-150',
                                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
                                'text-blue-600 border-gray-300',
                            ]
                                .filter(Boolean)
                                .join(' '), ...props }) }), _jsxs("span", { className: "flex flex-col", children: [label && (_jsx("span", { className: [sizes.text, 'font-medium text-gray-900'].join(' '), children: label })), description && (_jsx("span", { className: [sizes.desc, 'text-gray-500'].join(' '), children: description }))] })] }), error && (_jsx("p", { id: errorId, className: "mt-1 text-sm text-red-600 ml-8", role: "alert", children: error }))] }));
});
Radio.displayName = 'Radio';
export default Radio;
//# sourceMappingURL=radio.js.map