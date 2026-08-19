import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
export const Card = forwardRef(({ className, hover = false, children, ...props }, ref) => {
    return (_jsx("div", { ref: ref, className: cn('rounded-xl border border-border bg-background shadow-sm', hover && 'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5', className), ...props, children: children }));
});
Card.displayName = 'Card';
export const CardHeader = forwardRef(({ className, ...props }, ref) => (_jsx("div", { ref: ref, className: cn('flex flex-col space-y-1.5 p-6 pb-0', className), ...props })));
CardHeader.displayName = 'CardHeader';
export const CardTitle = forwardRef(({ className, ...props }, ref) => (_jsx("h3", { ref: ref, className: cn('text-lg font-semibold leading-none tracking-tight text-foreground', className), ...props })));
CardTitle.displayName = 'CardTitle';
export const CardDescription = forwardRef(({ className, ...props }, ref) => (_jsx("p", { ref: ref, className: cn('text-sm text-muted-foreground', className), ...props })));
CardDescription.displayName = 'CardDescription';
export const CardBody = forwardRef(({ className, ...props }, ref) => (_jsx("div", { ref: ref, className: cn('p-6', className), ...props })));
CardBody.displayName = 'CardBody';
export const CardFooter = forwardRef(({ className, ...props }, ref) => (_jsx("div", { ref: ref, className: cn('flex items-center p-6 pt-0', className), ...props })));
CardFooter.displayName = 'CardFooter';
//# sourceMappingURL=Card.js.map