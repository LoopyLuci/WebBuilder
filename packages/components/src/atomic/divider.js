import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * WebBuilder Components - Divider Component
 * A flexible divider with optional label and multiple orientations.
 */
import React from 'react';
const variantStyles = {
    solid: 'border-solid',
    dashed: 'border-dashed',
    dotted: 'border-dotted',
};
const spacingStyles = {
    sm: 'my-2',
    md: 'my-4',
    lg: 'my-8',
};
export const Divider = React.forwardRef(({ orientation = 'horizontal', variant = 'solid', label, labelPosition = 'center', color = 'border-gray-200', spacing = 'md', className = '', ...props }, ref) => {
    if (orientation === 'vertical') {
        return (_jsx("div", { ref: ref, className: ['inline-flex h-full', spacingStyles[spacing], className]
                .filter(Boolean)
                .join(' '), role: "separator", ...props, children: _jsx("div", { className: ['w-px h-full border-l', color, variantStyles[variant]].join(' ') }) }));
    }
    if (!label) {
        return (_jsx("div", { ref: ref, className: ['w-full', spacingStyles[spacing], className].filter(Boolean).join(' '), role: "separator", ...props, children: _jsx("div", { className: ['w-full border-t', color, variantStyles[variant]].join(' ') }) }));
    }
    const labelJustify = labelPosition === 'left'
        ? 'justify-start'
        : labelPosition === 'right'
            ? 'justify-end'
            : 'justify-center';
    return (_jsxs("div", { ref: ref, className: ['w-full flex items-center', spacingStyles[spacing], className]
            .filter(Boolean)
            .join(' '), role: "separator", ...props, children: [_jsx("div", { className: [
                    'flex-1 border-t',
                    color,
                    variantStyles[variant],
                    labelPosition === 'left' ? 'mr-4' : '',
                ]
                    .filter(Boolean)
                    .join(' ') }), _jsx("span", { className: ['px-3 text-sm text-gray-500 font-medium', labelJustify].join(' '), children: label }), _jsx("div", { className: [
                    'flex-1 border-t',
                    color,
                    variantStyles[variant],
                    labelPosition === 'right' ? 'ml-4' : '',
                ]
                    .filter(Boolean)
                    .join(' ') })] }));
});
Divider.displayName = 'Divider';
export default Divider;
//# sourceMappingURL=divider.js.map