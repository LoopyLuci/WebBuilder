import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * WebBuilder Components - Progress Component
 * A progress bar with multiple variants, sizes, and animations.
 */
import React from 'react';
const variantStyles = {
    default: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-500',
    danger: 'bg-red-600',
};
const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
};
export const Progress = React.forwardRef(({ value, max = 100, variant = 'default', size = 'md', showLabel = false, animated = false, striped = false, label, className = '', ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    return (_jsxs("div", { ref: ref, className: ['w-full', className].filter(Boolean).join(' '), role: "progressbar", "aria-valuenow": value, "aria-valuemin": 0, "aria-valuemax": max, "aria-label": label || `Progress: ${percentage}%`, ...props, children: [showLabel && (_jsxs("div", { className: "flex justify-between mb-1", children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: label || 'Progress' }), _jsxs("span", { className: "text-sm font-medium text-gray-500", children: [Math.round(percentage), "%"] })] })), _jsx("div", { className: ['w-full bg-gray-200 rounded-full overflow-hidden', sizeStyles[size]].join(' '), children: _jsx("div", { className: [
                        'h-full rounded-full transition-all duration-500 ease-out',
                        variantStyles[variant],
                        striped ? 'bg-[length:1rem_1rem] bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)]' : '',
                        animated ? 'animate-[progress-stripes_1s_linear_infinite]' : '',
                    ]
                        .filter(Boolean)
                        .join(' '), style: { width: `${percentage}%` } }) })] }));
});
Progress.displayName = 'Progress';
export default Progress;
//# sourceMappingURL=progress.js.map