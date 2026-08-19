import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef, useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
export const Accordion = forwardRef(({ className, items, multiple = false, defaultOpen = [], collapsible = true, ...props }, ref) => {
    const [openItems, setOpenItems] = useState(new Set(defaultOpen));
    const toggle = useCallback((id) => {
        setOpenItems(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                if (collapsible)
                    next.delete(id);
            }
            else {
                if (!multiple)
                    next.clear();
                next.add(id);
            }
            return next;
        });
    }, [multiple, collapsible]);
    return (_jsx("div", { ref: ref, className: cn('divide-y divide-border rounded-lg border border-border', className), ...props, children: items.map(item => (_jsx(AccordionPanel, { item: item, isOpen: openItems.has(item.id), onToggle: () => toggle(item.id) }, item.id))) }));
});
Accordion.displayName = 'Accordion';
const AccordionPanel = ({ item, isOpen, onToggle }) => {
    const contentRef = useRef(null);
    const [height, setHeight] = useState(0);
    useEffect(() => {
        if (!contentRef.current)
            return;
        if (isOpen) {
            setHeight(contentRef.current.scrollHeight);
        }
        else {
            setHeight(0);
        }
    }, [isOpen]);
    return (_jsxs("div", { className: "group", children: [_jsx("h3", { children: _jsxs("button", { type: "button", "aria-expanded": isOpen, "aria-controls": `accordion-content-${item.id}`, disabled: item.disabled, onClick: onToggle, className: cn('flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-medium', 'transition-colors duration-150', 'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500', isOpen ? 'text-foreground' : 'text-muted-foreground hover:text-foreground', item.disabled && 'cursor-not-allowed opacity-40'), children: [_jsxs("span", { className: "flex items-center gap-2", children: [item.icon, item.title] }), _jsx("svg", { className: cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200', isOpen && 'rotate-180'), fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", "aria-hidden": "true", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" }) })] }) }), _jsx("div", { id: `accordion-content-${item.id}`, role: "region", "aria-labelledby": `accordion-trigger-${item.id}`, className: "overflow-hidden transition-all duration-200 ease-in-out", style: { height: isOpen ? height : 0 }, "aria-hidden": !isOpen, children: _jsx("div", { ref: contentRef, className: "px-4 pb-3 text-sm text-muted-foreground", children: item.content }) })] }));
};
export default Accordion;
//# sourceMappingURL=Accordion.js.map