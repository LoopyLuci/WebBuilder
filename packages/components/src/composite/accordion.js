import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * WebBuilder Components - Accordion Component
 * A collapsible accordion with single or multiple expand modes.
 */
import React, { useState } from 'react';
const variantStyles = {
    default: {
        container: 'divide-y divide-gray-200',
        item: '',
    },
    bordered: {
        container: 'border border-gray-200 rounded-lg divide-y divide-gray-200',
        item: '',
    },
    separated: {
        container: 'space-y-2',
        item: 'border border-gray-200 rounded-lg',
    },
};
const sizeStyles = {
    sm: { header: 'px-3 py-2', content: 'px-3 pb-2' },
    md: { header: 'px-4 py-3', content: 'px-4 pb-3' },
    lg: { header: 'px-5 py-4', content: 'px-5 pb-4' },
};
export const Accordion = React.forwardRef(({ items, defaultExpanded, expanded: controlledExpanded, onExpandedChange, multiple = false, variant = 'default', size = 'md', className = '', ...props }, ref) => {
    const [uncontrolledExpanded, setUncontrolledExpanded] = useState(defaultExpanded || []);
    const expanded = controlledExpanded !== undefined ? controlledExpanded : uncontrolledExpanded;
    const toggleItem = (id) => {
        let newExpanded;
        if (multiple) {
            newExpanded = expanded.includes(id)
                ? expanded.filter((i) => i !== id)
                : [...expanded, id];
        }
        else {
            newExpanded = expanded.includes(id) ? [] : [id];
        }
        if (controlledExpanded === undefined) {
            setUncontrolledExpanded(newExpanded);
        }
        onExpandedChange?.(newExpanded);
    };
    const vStyles = variantStyles[variant];
    const sStyles = sizeStyles[size];
    return (_jsx("div", { ref: ref, className: [vStyles.container, className].filter(Boolean).join(' '), ...props, children: items.map((item) => {
            const isExpanded = expanded.includes(item.id);
            return (_jsxs("div", { className: vStyles.item, children: [_jsxs("button", { type: "button", onClick: () => toggleItem(item.id), disabled: item.disabled, "aria-expanded": isExpanded, "aria-controls": `accordion-content-${item.id}`, className: [
                            'w-full flex items-center justify-between text-left transition-colors',
                            sStyles.header,
                            item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50',
                            variant === 'separated' && isExpanded ? 'rounded-t-lg' : '',
                            variant === 'separated' && !isExpanded ? 'rounded-lg' : '',
                        ]
                            .filter(Boolean)
                            .join(' '), children: [_jsxs("div", { className: "flex items-center gap-3", children: [item.icon && _jsx("span", { className: "flex-shrink-0", children: item.icon }), _jsxs("div", { children: [_jsx("span", { className: "text-sm font-medium text-gray-900", children: item.title }), item.subtitle && (_jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: item.subtitle }))] }), item.badge && (_jsx("span", { className: "px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-600 rounded-full", children: item.badge }))] }), _jsx("svg", { className: [
                                    'w-5 h-5 text-gray-400 transition-transform duration-200',
                                    isExpanded ? 'rotate-180' : '',
                                ].join(' '), fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" }) })] }), isExpanded && (_jsx("div", { id: `accordion-content-${item.id}`, className: [sStyles.content, 'text-sm text-gray-600'].join(' '), children: item.content }))] }, item.id));
        }) }));
});
Accordion.displayName = 'Accordion';
export default Accordion;
//# sourceMappingURL=accordion.js.map