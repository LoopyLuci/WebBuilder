import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
export const Skeleton = forwardRef(({ className, variant = 'text', width, height, lines = 1, animated = true, ...props }, ref) => {
    const base = cn('rounded bg-muted', animated && 'animate-pulse');
    if (variant === 'text' && lines > 1) {
        return (_jsx("div", { ref: ref, className: cn('space-y-2', className), ...props, children: Array.from({ length: lines }).map((_, i) => (_jsx("div", { className: cn(base, 'h-4'), style: { width: i === lines - 1 ? '75%' : '100%' } }, i))) }));
    }
    return (_jsx("div", { ref: ref, "aria-hidden": "true", "aria-label": "Loading...", role: "status", className: cn(base, variant === 'circular' && 'rounded-full', variant === 'rectangular' && 'rounded-none', className), style: { width, height: height ?? (variant === 'circular' ? width : variant === 'text' ? '1rem' : '8rem') }, ...props }));
});
Skeleton.displayName = 'Skeleton';
export default Skeleton;
//# sourceMappingURL=Skeleton.js.map