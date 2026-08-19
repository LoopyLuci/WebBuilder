import { jsx as _jsx } from "react/jsx-runtime";
/**
 * WebBuilder Components - Form Component
 * A form wrapper with layout, validation, and submission handling.
 */
import React from 'react';
const layoutStyles = {
    vertical: 'flex flex-col',
    horizontal: 'flex flex-col',
    inline: 'flex flex-row flex-wrap items-end',
};
const spacingStyles = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
};
export const Form = React.forwardRef(({ layout = 'vertical', spacing = 'md', disabled = false, children, className = '', ...props }, ref) => {
    return (_jsx("form", { ref: ref, className: [
            layoutStyles[layout],
            layout === 'inline' ? 'gap-3' : spacingStyles[spacing],
            className,
        ]
            .filter(Boolean)
            .join(' '), ...props, children: children }));
});
Form.displayName = 'Form';
export default Form;
//# sourceMappingURL=form.js.map