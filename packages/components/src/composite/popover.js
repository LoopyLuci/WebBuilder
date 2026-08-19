import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * WebBuilder Components - Popover Component
 * A click-triggered popover with positioning and rich content support.
 */
import React, { useState, useRef, useEffect } from 'react';
const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};
export const Popover = React.forwardRef(({ content, position = 'bottom', trigger = 'click', open: controlledOpen, onOpenChange, showArrow = true, title, children, className = '', ...props }, ref) => {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
    const popoverRef = useRef(null);
    const toggle = () => {
        const newState = !open;
        if (controlledOpen === undefined) {
            setUncontrolledOpen(newState);
        }
        onOpenChange?.(newState);
    };
    useEffect(() => {
        if (trigger === 'click' && open) {
            const handleClickOutside = (e) => {
                if (popoverRef.current && !popoverRef.current.contains(e.target)) {
                    if (controlledOpen === undefined) {
                        setUncontrolledOpen(false);
                    }
                    onOpenChange?.(false);
                }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [open, trigger, controlledOpen, onOpenChange]);
    return (_jsxs("div", { ref: ref, className: ['relative inline-flex', className].filter(Boolean).join(' '), ...props, children: [_jsx("div", { onClick: trigger === 'click' ? toggle : undefined, onMouseEnter: trigger === 'hover' ? () => {
                    if (controlledOpen === undefined)
                        setUncontrolledOpen(true);
                    onOpenChange?.(true);
                } : undefined, onMouseLeave: trigger === 'hover' ? () => {
                    if (controlledOpen === undefined)
                        setUncontrolledOpen(false);
                    onOpenChange?.(false);
                } : undefined, className: "cursor-pointer", children: children }), open && (_jsxs("div", { ref: popoverRef, role: "dialog", className: [
                    'absolute z-50 w-72 bg-white rounded-lg shadow-xl border border-gray-200 animate-[fadeIn_0.15s_ease-out]',
                    positionStyles[position],
                ].join(' '), children: [showArrow && (_jsx("span", { className: [
                            'absolute w-3 h-3 bg-white border rotate-45',
                            position === 'top' ? 'top-full -translate-y-1/2 left-1/2 -translate-x-1/2 border-b border-r border-l-0 border-t-0' : '',
                            position === 'bottom' ? 'bottom-full translate-y-1/2 left-1/2 -translate-x-1/2 border-t border-l border-r-0 border-b-0' : '',
                            position === 'left' ? 'left-full -translate-x-1/2 top-1/2 -translate-y-1/2 border-t border-r border-l-0 border-b-0' : '',
                            position === 'right' ? 'right-full translate-x-1/2 top-1/2 -translate-y-1/2 border-b border-l border-r-0 border-t-0' : '',
                        ]
                            .filter(Boolean)
                            .join(' ') })), _jsxs("div", { className: "relative p-4", children: [title && (_jsx("h4", { className: "text-sm font-semibold text-gray-900 mb-2", children: title })), _jsx("div", { className: "text-sm text-gray-600", children: content })] })] }))] }));
});
Popover.displayName = 'Popover';
export default Popover;
//# sourceMappingURL=popover.js.map