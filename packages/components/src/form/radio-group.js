import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * WebBuilder Components - RadioGroup Component
 * A group of radio buttons with label and layout options.
 */
import React from 'react';
const orientationStyles = {
    horizontal: 'flex flex-row flex-wrap gap-4',
    vertical: 'flex flex-col gap-3',
};
export const RadioGroup = React.forwardRef(({ label, name, options, value, onChange, orientation = 'vertical', size = 'md', error, helperText, disabled = false, className = '', ...props }, ref) => {
    return (_jsxs("div", { ref: ref, className: ['flex flex-col gap-2', className].filter(Boolean).join(' '), ...props, children: [label && (_jsx("label", { className: "text-sm font-medium text-gray-700", children: label })), _jsx("div", { className: orientationStyles[orientation], children: options.map((option) => (_jsxs("label", { className: [
                        'inline-flex items-start gap-3 cursor-pointer',
                        option.disabled || disabled ? 'opacity-50 cursor-not-allowed' : '',
                    ].join(' '), children: [_jsx("input", { type: "radio", name: name, value: option.value, checked: value === option.value, onChange: () => onChange(option.value), disabled: option.disabled || disabled, className: "mt-0.5 rounded-full border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-1" }), _jsxs("span", { className: "flex flex-col", children: [_jsx("span", { className: "text-sm font-medium text-gray-900", children: option.label }), option.description && (_jsx("span", { className: "text-xs text-gray-500", children: option.description }))] })] }, option.value))) }), error && (_jsx("p", { className: "text-sm text-red-600", role: "alert", children: error })), helperText && !error && (_jsx("p", { className: "text-sm text-gray-500", children: helperText }))] }));
});
RadioGroup.displayName = 'RadioGroup';
export default RadioGroup;
//# sourceMappingURL=radio-group.js.map