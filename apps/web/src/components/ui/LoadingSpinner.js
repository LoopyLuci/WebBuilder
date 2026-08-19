'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function LoadingSpinner({ size = 'md', label }) {
    const sizes = {
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-3',
        lg: 'h-12 w-12 border-4',
    };
    return (_jsxs("div", { className: "flex flex-col items-center justify-center gap-3", role: "status", children: [_jsx("div", { className: `${sizes[size]} rounded-full border-primary-200 border-t-primary-600 animate-spin` }), label && _jsx("p", { className: "text-sm text-muted-foreground", children: label })] }));
}
export default LoadingSpinner;
//# sourceMappingURL=LoadingSpinner.js.map