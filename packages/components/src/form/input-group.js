import { jsx as _jsx } from "react/jsx-runtime";
/**
 * WebBuilder Components - InputGroup Component
 * Groups multiple inputs with addons, buttons, and icons.
 */
import React from 'react';
const sizeStyles = {
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
};
export const InputGroup = React.forwardRef(({ size = 'md', fullWidth = false, children, className = '', ...props }, ref) => {
    return (_jsx("div", { ref: ref, className: [
            'flex items-stretch',
            fullWidth ? 'w-full' : '',
            sizeStyles[size],
            className,
        ]
            .filter(Boolean)
            .join(' '), ...props, children: React.Children.map(children, (child) => React.isValidElement(child)
            ? React.cloneElement(child, {
                ...child.props,
                size,
            })
            : child) }));
});
InputGroup.displayName = 'InputGroup';
const addonSizeStyles = {
    sm: 'px-2 py-1.5',
    md: 'px-3 py-2.5',
    lg: 'px-4 py-3',
};
const addonVariantStyles = {
    default: 'bg-gray-100 border border-gray-300 text-gray-600',
    filled: 'bg-gray-200 text-gray-700',
    outline: 'bg-transparent border border-gray-300 text-gray-600',
};
export const InputGroupAddon = React.forwardRef(({ size = 'md', position = 'left', variant = 'default', children, className = '', ...props }, ref) => {
    return (_jsx("span", { ref: ref, className: [
            'inline-flex items-center whitespace-nowrap',
            addonSizeStyles[size],
            addonVariantStyles[variant],
            position === 'left' ? 'rounded-l-md border-r-0' : 'rounded-r-md border-l-0',
            className,
        ]
            .filter(Boolean)
            .join(' '), ...props, children: children }));
});
InputGroupAddon.displayName = 'InputGroupAddon';
const buttonSizeStyles = {
    sm: 'px-2 py-1.5 text-xs',
    md: 'px-3 py-2.5 text-sm',
    lg: 'px-4 py-3 text-base',
};
const buttonVariantStyles = {
    default: 'bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200',
    primary: 'bg-blue-600 border border-blue-600 text-white hover:bg-blue-700',
    outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50',
};
export const InputGroupButton = React.forwardRef(({ size = 'md', position = 'left', variant = 'default', children, className = '', ...props }, ref) => {
    return (_jsx("button", { ref: ref, type: "button", className: [
            'inline-flex items-center font-medium transition-colors',
            buttonSizeStyles[size],
            buttonVariantStyles[variant],
            position === 'left' ? 'rounded-l-md border-r-0' : 'rounded-r-md border-l-0',
            className,
        ]
            .filter(Boolean)
            .join(' '), ...props, children: children }));
});
InputGroupButton.displayName = 'InputGroupButton';
export default Object.assign(InputGroup, {
    Addon: InputGroupAddon,
    Button: InputGroupButton,
});
//# sourceMappingURL=input-group.js.map