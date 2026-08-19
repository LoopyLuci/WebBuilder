import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * WebBuilder Components - Call-to-Action Section Component
 * A CTA section with title, description, and action buttons.
 */
import React from 'react';
export const CTA = React.forwardRef(({ title, description, variant = 'default', primaryAction, secondaryAction, backgroundColor, backgroundImage, overlay = false, align = 'center', size = 'md', className = '', children, ...props }, ref) => {
    const sizeStyles = {
        sm: 'py-8',
        md: 'py-12',
        lg: 'py-16',
    };
    const alignStyles = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
    };
    const variantContainerStyles = {
        default: 'bg-blue-600',
        primary: 'bg-indigo-600',
        minimal: 'bg-gray-100',
        gradient: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600',
    };
    const variantTextStyles = {
        default: 'text-white',
        primary: 'text-white',
        minimal: 'text-gray-900',
        gradient: 'text-white',
    };
    const variantDescriptionStyles = {
        default: 'text-blue-100',
        primary: 'text-indigo-100',
        minimal: 'text-gray-600',
        gradient: 'text-blue-100',
    };
    const hasBackground = !!backgroundImage;
    return (_jsxs("section", { ref: ref, className: [
            'relative overflow-hidden',
            sizeStyles[size],
            variant !== 'minimal' ? variantContainerStyles[variant] : '',
            className,
        ]
            .filter(Boolean)
            .join(' '), style: backgroundColor ? { backgroundColor } : undefined, ...props, children: [hasBackground && (_jsxs(_Fragment, { children: [_jsx("div", { className: "absolute inset-0 bg-cover bg-center", style: { backgroundImage: `url(${backgroundImage})` }, "aria-hidden": "true" }), overlay && (_jsx("div", { className: "absolute inset-0 bg-black/50", "aria-hidden": "true" }))] })), _jsx("div", { className: [
                    'relative z-10 container mx-auto px-4',
                    alignStyles[align],
                ].join(' '), children: _jsxs("div", { className: [
                        'max-w-2xl',
                        align === 'center' ? 'mx-auto' : '',
                        align === 'right' ? 'ml-auto' : '',
                    ].join(' '), children: [_jsx("h2", { className: [
                                'text-2xl md:text-3xl lg:text-4xl font-bold',
                                variantTextStyles[variant],
                            ].join(' '), children: title }), description && (_jsx("p", { className: [
                                'mt-3 text-lg',
                                variantDescriptionStyles[variant],
                            ].join(' '), children: description })), (primaryAction || secondaryAction) && (_jsxs("div", { className: [
                                'flex flex-wrap gap-4 mt-8',
                                align === 'center' ? 'justify-center' : '',
                                align === 'right' ? 'justify-end' : '',
                            ]
                                .filter(Boolean)
                                .join(' '), children: [primaryAction, secondaryAction] })), children] }) })] }));
});
CTA.displayName = 'CTA';
export default CTA;
//# sourceMappingURL=cta.js.map