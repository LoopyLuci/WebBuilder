import { jsx as _jsx } from "react/jsx-runtime";
/**
 * WebBuilder Components - Atomic Card Component
 * A flexible card with image, title, description, and footer slots.
 */
import React from 'react';
const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
};
const aspectRatioStyles = {
    '16:9': 'aspect-video',
    '4:3': 'aspect-4/3',
    '1:1': 'aspect-square',
    auto: '',
};
export const Card = React.forwardRef(({ padding = 'md', hoverable = false, bordered = true, children, className = '', ...props }, ref) => {
    return (_jsx("div", { ref: ref, className: [
            'bg-white rounded-lg overflow-hidden',
            bordered ? 'border border-gray-200' : '',
            hoverable ? 'shadow-sm hover:shadow-md transition-shadow duration-200' : '',
            className,
        ]
            .filter(Boolean)
            .join(' '), ...props, children: children }));
});
Card.displayName = 'Card';
export const CardImage = React.forwardRef(({ aspectRatio = '16:9', className = '', ...props }, ref) => {
    return (_jsx("div", { ref: ref, className: ['w-full overflow-hidden bg-gray-100', aspectRatioStyles[aspectRatio], className]
            .filter(Boolean)
            .join(' '), children: _jsx("img", { className: "w-full h-full object-cover", ...props }) }));
});
CardImage.displayName = 'CardImage';
export const CardBody = React.forwardRef(({ padding = 'md', className = '', children, ...props }, ref) => {
    return (_jsx("div", { ref: ref, className: [paddingStyles[padding], className].filter(Boolean).join(' '), ...props, children: children }));
});
CardBody.displayName = 'CardBody';
export const CardTitle = React.forwardRef(({ as: Tag = 'h3', className = '', children, ...props }, ref) => {
    return (_jsx(Tag, { ref: ref, className: ['text-lg font-semibold text-gray-900', className].filter(Boolean).join(' '), ...props, children: children }));
});
CardTitle.displayName = 'CardTitle';
export const CardDescription = React.forwardRef(({ className = '', children, ...props }, ref) => {
    return (_jsx("p", { ref: ref, className: ['mt-1 text-sm text-gray-600', className].filter(Boolean).join(' '), ...props, children: children }));
});
CardDescription.displayName = 'CardDescription';
export const CardFooter = React.forwardRef(({ className = '', children, ...props }, ref) => {
    return (_jsx("div", { ref: ref, className: ['px-4 py-3 bg-gray-50 border-t border-gray-200', className].filter(Boolean).join(' '), ...props, children: children }));
});
CardFooter.displayName = 'CardFooter';
export default Object.assign(Card, {
    Image: CardImage,
    Body: CardBody,
    Title: CardTitle,
    Description: CardDescription,
    Footer: CardFooter,
});
//# sourceMappingURL=card.js.map