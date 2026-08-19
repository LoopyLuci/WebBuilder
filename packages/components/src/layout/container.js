import { jsx as _jsx } from "react/jsx-runtime";
/**
 * WebBuilder Components - Container Component
 * A responsive container with max-width variants.
 */
import React from 'react';
const sizeStyles = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
};
const paddingStyles = {
    none: '',
    sm: 'px-4',
    md: 'px-6',
    lg: 'px-8',
};
export const Container = React.forwardRef(({ size = 'lg', centered = true, padding = 'md', maxWidth, children, className = '', ...props }, ref) => {
    return (_jsx("div", { ref: ref, className: [
            'w-full',
            maxWidth || sizeStyles[size],
            centered ? 'mx-auto' : '',
            paddingStyles[padding],
            className,
        ]
            .filter(Boolean)
            .join(' '), ...props, children: children }));
});
Container.displayName = 'Container';
export default Container;
//# sourceMappingURL=container.js.map