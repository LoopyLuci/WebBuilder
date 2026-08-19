import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * WebBuilder Components - Field Component
 * A form field wrapper with label, error, and helper text.
 */
import React from 'react';
const orientationStyles = {
    vertical: 'flex flex-col gap-1.5',
    horizontal: 'flex flex-row items-start gap-4',
};
const sizeLabelStyles = {
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
};
export const Field = React.forwardRef(({ label, htmlFor, error, helperText, required = false, disabled = false, orientation = 'vertical', labelWidth = 'w-32', size = 'md', children, className = '', ...props }, ref) => {
    const errorId = htmlFor ? `${htmlFor}-error` : undefined;
    const helperId = htmlFor ? `${htmlFor}-helper` : undefined;
    return (_jsxs("div", { ref: ref, className: [
            orientationStyles[orientation],
            disabled ? 'opacity-50' : '',
            className,
        ]
            .filter(Boolean)
            .join(' '), ...props, children: [label && (_jsxs("label", { htmlFor: htmlFor, className: [
                    'font-medium text-gray-700 flex-shrink-0',
                    sizeLabelStyles[size],
                    orientation === 'horizontal' ? `pt-2 ${labelWidth}` : '',
                ]
                    .filter(Boolean)
                    .join(' '), children: [label, required && _jsx("span", { className: "text-red-500 ml-0.5", children: "*" })] })), _jsxs("div", { className: "flex-1", children: [React.isValidElement(children)
                        ? React.cloneElement(children, {
                            'aria-invalid': error ? true : undefined,
                            'aria-describedby': [error ? errorId : null, helperText && !error ? helperId : null]
                                .filter(Boolean)
                                .join(' ') || undefined,
                            disabled,
                        })
                        : children, error && (_jsxs("p", { id: errorId, className: "mt-1.5 text-sm text-red-600 flex items-center gap-1", role: "alert", children: [_jsx("svg", { className: "w-4 h-4 flex-shrink-0", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }), error] })), helperText && !error && (_jsx("p", { id: helperId, className: "mt-1.5 text-sm text-gray-500", children: helperText }))] })] }));
});
Field.displayName = 'Field';
export default Field;
//# sourceMappingURL=field.js.map