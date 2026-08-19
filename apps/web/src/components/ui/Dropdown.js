import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef, useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
export const Dropdown = forwardRef(({ trigger, items, onSelect, className, align = 'left', open: controlledOpen, onOpenChange }, ref) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const open = controlledOpen ?? internalOpen;
    const setOpen = onOpenChange ?? setInternalOpen;
    const menuRef = useRef(null);
    const triggerRef = useRef(null);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    useEffect(() => {
        if (!open) {
            setHighlightedIndex(-1);
            return;
        }
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target) &&
                triggerRef.current && !triggerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        const handleEscape = (e) => {
            if (e.key === 'Escape')
                setOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [open, setOpen]);
    const handleKeyDown = useCallback((e) => {
        const enabledItems = items.filter((_, i) => !items[i].disabled);
        if (!open) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                e.preventDefault();
                setOpen(true);
                setHighlightedIndex(enabledItems.length > 0 ? 0 : -1);
            }
            return;
        }
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev => Math.min(prev + 1, items.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => Math.max(prev - 1, 0));
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (highlightedIndex >= 0 && !items[highlightedIndex].disabled) {
                    onSelect?.(items[highlightedIndex].value);
                    setOpen(false);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setOpen(false);
                triggerRef.current?.focus();
                break;
            case 'Tab':
                setOpen(false);
                break;
        }
    }, [open, highlightedIndex, items, onSelect, setOpen]);
    return (_jsxs("div", { ref: ref, className: cn('relative inline-block', className), children: [_jsx("div", { ref: triggerRef, tabIndex: 0, role: "button", "aria-haspopup": "listbox", "aria-expanded": open, onClick: () => setOpen(!open), onKeyDown: handleKeyDown, className: "outline-none", children: trigger }), open && (_jsx("div", { ref: menuRef, role: "listbox", "aria-orientation": "vertical", className: cn('absolute z-50 mt-1 w-56 rounded-lg border border-border bg-background py-1 shadow-lg', 'animate-in', align === 'right' ? 'right-0' : 'left-0'), children: items.map((item, index) => (_jsxs("button", { role: "option", "aria-selected": index === highlightedIndex, "aria-disabled": item.disabled, disabled: item.disabled, onClick: () => {
                        if (!item.disabled) {
                            onSelect?.(item.value);
                            setOpen(false);
                        }
                    }, onMouseEnter: () => setHighlightedIndex(index), className: cn('flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors', item.danger ? 'text-error-500 hover:bg-error-50 dark:hover:bg-error-700/10' : 'text-foreground hover:bg-muted', item.disabled && 'cursor-not-allowed opacity-40', index === highlightedIndex && 'bg-muted'), children: [item.icon && _jsx("span", { className: "shrink-0", children: item.icon }), _jsx("span", { className: "truncate", children: item.label })] }, item.value))) }))] }));
});
Dropdown.displayName = 'Dropdown';
export default Dropdown;
//# sourceMappingURL=Dropdown.js.map