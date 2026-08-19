import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
const spinnerSizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-3',
    xl: 'h-12 w-12 border-4',
};
export const Spinner = forwardRef(({ className, size = 'md', label = 'Loading', ...props }, ref) => {
    return (_jsxs("div", { ref: ref, role: "status", "aria-label": label, className: cn('inline-flex items-center justify-center', className), ...props, children: [_jsx("div", { className: cn('rounded-full border-current border-t-transparent animate-spin text-primary-500', spinnerSizes[size]) }), _jsx("span", { className: "sr-only", children: label })] }));
});
Spinner.displayName = 'Spinner';
export default Spinner;
//# sourceMappingURL=Spinner.js.map