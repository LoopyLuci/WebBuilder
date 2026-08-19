import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * WebBuilder Components - Atomic Avatar Component
 * A flexible avatar component with image, initials fallback, and status indicator.
 */
import React, { useState } from 'react';
const sizeStyles = {
    xs: { container: 'w-6 h-6', text: 'text-[10px]', status: 'w-1.5 h-1.5 bottom-0 right-0' },
    sm: { container: 'w-8 h-8', text: 'text-xs', status: 'w-2 h-2 bottom-0 right-0' },
    md: { container: 'w-10 h-10', text: 'text-sm', status: 'w-2.5 h-2.5 bottom-0 right-0' },
    lg: { container: 'w-12 h-12', text: 'text-base', status: 'w-3 h-3 bottom-0 right-0' },
    xl: { container: 'w-16 h-16', text: 'text-lg', status: 'w-3.5 h-3.5 bottom-0.5 right-0.5' },
    '2xl': { container: 'w-20 h-20', text: 'text-xl', status: 'w-4 h-4 bottom-0.5 right-0.5' },
};
const shapeStyles = {
    circle: 'rounded-full',
    square: 'rounded-none',
    rounded: 'rounded-lg',
};
const statusStyles = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
};
const bgColors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-sky-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-fuchsia-500',
    'bg-pink-500',
    'bg-rose-500',
];
function getInitials(name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1)
        return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
function getColorFromName(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return bgColors[Math.abs(hash) % bgColors.length] ?? 'bg-gray-500';
}
export const Avatar = React.forwardRef(({ src, alt, name, size = 'md', shape = 'circle', status, bordered = false, className = '', ...props }, ref) => {
    const [imgError, setImgError] = useState(false);
    const hasImage = src && !imgError;
    const sizes = sizeStyles[size];
    return (_jsxs("div", { ref: ref, className: ['relative inline-flex flex-shrink-0', className].filter(Boolean).join(' '), ...props, children: [_jsx("div", { className: [
                    sizes.container,
                    shapeStyles[shape],
                    'overflow-hidden flex items-center justify-center',
                    bordered ? 'ring-2 ring-white' : '',
                    !hasImage && name ? getColorFromName(name) : 'bg-gray-200',
                ]
                    .filter(Boolean)
                    .join(' '), children: hasImage ? (_jsx("img", { src: src, alt: alt || name || 'Avatar', className: "w-full h-full object-cover", onError: () => setImgError(true) })) : name ? (_jsx("span", { className: [sizes.text, 'font-medium text-white'].join(' '), children: getInitials(name) })) : (_jsx("svg", { className: "w-1/2 h-1/2 text-gray-400", fill: "currentColor", viewBox: "0 0 24 24", "aria-hidden": "true", children: _jsx("path", { d: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" }) })) }), status && (_jsx("span", { className: [
                    'absolute ring-2 ring-white rounded-full',
                    sizes.status,
                    statusStyles[status],
                ].join(' '), "aria-label": `Status: ${status}` }))] }));
});
Avatar.displayName = 'Avatar';
export const AvatarGroup = React.forwardRef(({ children, max, size = 'md', stacked = true, className = '', ...props }, ref) => {
    const childArray = React.Children.toArray(children);
    const displayChildren = max ? childArray.slice(0, max) : childArray;
    const remaining = max ? childArray.length - max : 0;
    const sizes = sizeStyles[size];
    return (_jsxs("div", { ref: ref, className: ['flex items-center', stacked ? '-space-x-2' : 'space-x-2', className]
            .filter(Boolean)
            .join(' '), ...props, children: [displayChildren.map((child, index) => (_jsx("div", { className: stacked ? 'ring-2 ring-white rounded-full' : '', children: child }, index))), remaining > 0 && (_jsx("div", { className: [
                    sizes.container,
                    'rounded-full bg-gray-200 flex items-center justify-center ring-2 ring-white',
                ].join(' '), children: _jsxs("span", { className: [sizes.text, 'font-medium text-gray-600'].join(' '), children: ["+", remaining] }) }))] }));
});
AvatarGroup.displayName = 'AvatarGroup';
export default Avatar;
//# sourceMappingURL=avatar.js.map