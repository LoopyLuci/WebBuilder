import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * WebBuilder Components - Dropdown Component
 * A flexible dropdown menu with items, groups, and keyboard navigation.
 */
import React, { useState, useRef, useEffect } from 'react';
const positionStyles = {
    'bottom-left': 'top-full left-0 mt-1',
    'bottom-right': 'top-full right-0 mt-1',
    'top-left': 'bottom-full left-0 mb-1',
    'top-right': 'bottom-full right-0 mb-1',
};
export const Dropdown = React.forwardRef(({ trigger, groups, position = 'bottom-left', open: controlledOpen, onOpenChange, width = 'w-56', className = '', ...props }, ref) => {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
    const dropdownRef = useRef(null);
    const toggle = () => {
        const newState = !open;
        if (controlledOpen === undefined) {
            setUncontrolledOpen(newState);
        }
        onOpenChange?.(newState);
    };
    useEffect(() => {
        if (open) {
            const handleClickOutside = (e) => {
                if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                    if (controlledOpen === undefined) {
                        setUncontrolledOpen(false);
                    }
                    onOpenChange?.(false);
                }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [open, controlledOpen, onOpenChange]);
    useEffect(() => {
        if (open && dropdownRef.current) {
            const items = dropdownRef.current.querySelectorAll('[role="menuitem"]:not([disabled])');
            if (items.length > 0) {
                items[0].focus();
                setFocusedIndex(0);
            }
        }
    }, [open]);
    const handleKeyDown = (e) => {
        if (!open)
            return;
        const items = dropdownRef.current?.querySelectorAll('[role="menuitem"]:not([disabled])');
        if (!items)
            return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextIndex = focusedIndex < items.length - 1 ? focusedIndex + 1 : 0;
            setFocusedIndex(nextIndex);
            items[nextIndex].focus();
        }
        else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevIndex = focusedIndex > 0 ? focusedIndex - 1 : items.length - 1;
            setFocusedIndex(prevIndex);
            items[prevIndex].focus();
        }
        else if (e.key === 'Escape') {
            if (controlledOpen === undefined) {
                setUncontrolledOpen(false);
            }
            onOpenChange?.(false);
        }
    };
    return (_jsxs("div", { ref: ref, className: ['relative inline-flex', className].filter(Boolean).join(' '), onKeyDown: handleKeyDown, ...props, children: [_jsx("div", { onClick: toggle, className: "cursor-pointer", children: trigger }), open && (_jsx("div", { ref: dropdownRef, role: "menu", className: [
                    'absolute z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-1 animate-[fadeIn_0.15s_ease-out]',
                    positionStyles[position],
                    width,
                ].join(' '), children: groups.map((group, groupIndex) => (_jsxs("div", { children: [groupIndex > 0 && _jsx("div", { className: "my-1 border-t border-gray-100" }), group.title && (_jsx("div", { className: "px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider", children: group.title })), group.items.map((item) => (_jsxs("button", { role: "menuitem", disabled: item.disabled, onClick: () => {
                                item.onClick?.();
                                if (controlledOpen === undefined) {
                                    setUncontrolledOpen(false);
                                }
                                onOpenChange?.(false);
                            }, className: [
                                'w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors',
                                item.disabled
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : item.danger
                                        ? 'text-red-600 hover:bg-red-50'
                                        : 'text-gray-700 hover:bg-gray-50',
                            ].join(' '), children: [item.icon && _jsx("span", { className: "flex-shrink-0 w-4 h-4", children: item.icon }), item.label] }, item.id)))] }, groupIndex))) }))] }));
});
Dropdown.displayName = 'Dropdown';
export default Dropdown;
//# sourceMappingURL=dropdown.js.map