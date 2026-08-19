import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';
const avatarSizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
};
const statusSizes = {
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
    xl: 'h-3.5 w-3.5',
};
const statusColors = {
    online: 'bg-success-500',
    offline: 'bg-gray-400',
    away: 'bg-warning-500',
    busy: 'bg-error-500',
};
function getInitials(name) {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}
function getColorFromName(name) {
    const colors = [
        'bg-primary-500',
        'bg-success-500',
        'bg-warning-500',
        'bg-error-500',
        'bg-purple-500',
        'bg-pink-500',
        'bg-indigo-500',
        'bg-teal-500',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}
export const Avatar = forwardRef(({ className, src, alt, name = '', size = 'md', status, ...props }, ref) => {
    const [imgError, setImgError] = useState(false);
    const showImage = src && !imgError;
    return (_jsxs("div", { ref: ref, className: cn('relative inline-flex shrink-0', className), ...props, children: [_jsx("div", { className: cn('flex items-center justify-center overflow-hidden rounded-full', avatarSizes[size], !showImage && getColorFromName(name || 'unknown'), showImage && 'bg-muted'), children: showImage ? (_jsx("img", { src: src, alt: alt || name, onError: () => setImgError(true), className: "h-full w-full object-cover" })) : (_jsx("span", { className: "font-medium text-white", children: name ? getInitials(name) : (_jsx("svg", { className: "h-1/2 w-1/2 text-white/70", fill: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { d: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" }) })) })) }), status && (_jsx("span", { className: cn('absolute bottom-0 right-0 rounded-full ring-2 ring-background', statusSizes[size], statusColors[status]), "aria-label": `Status: ${status}` }))] }));
});
Avatar.displayName = 'Avatar';
export const AvatarGroup = forwardRef(({ className, children, max = 4, size = 'md', ...props }, ref) => {
    const childArray = React.Children.toArray(children);
    const visible = childArray.slice(0, max);
    const remaining = childArray.length - max;
    return (_jsxs("div", { ref: ref, className: cn('flex -space-x-2', className), ...props, children: [visible.map((child, i) => (_jsx("div", { className: "ring-2 ring-background rounded-full", children: child }, i))), remaining > 0 && (_jsxs("div", { className: cn('flex items-center justify-center rounded-full bg-muted text-muted-foreground font-medium ring-2 ring-background', avatarSizes[size]), children: ["+", remaining] }))] }));
});
AvatarGroup.displayName = 'AvatarGroup';
//# sourceMappingURL=Avatar.js.map