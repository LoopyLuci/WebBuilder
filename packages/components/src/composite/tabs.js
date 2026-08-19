import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * WebBuilder Components - Tabs Component
 * A flexible tabs component with multiple variants.
 */
import React, { useState } from 'react';
const variantContainerStyles = {
    default: 'bg-gray-100 p-1',
    pills: 'bg-transparent gap-2',
    underline: 'border-b border-gray-200',
    boxed: 'bg-transparent border border-gray-200 p-1',
};
const variantTabStyles = {
    default: {
        base: 'px-4 py-2 text-sm font-medium rounded-md transition-all',
        active: 'bg-white text-gray-900 shadow-sm',
        inactive: 'text-gray-600 hover:text-gray-900',
    },
    pills: {
        base: 'px-4 py-2 text-sm font-medium rounded-full transition-all',
        active: 'bg-blue-600 text-white shadow-sm',
        inactive: 'text-gray-600 hover:bg-gray-100',
    },
    underline: {
        base: 'px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-all',
        active: 'border-blue-600 text-blue-600',
        inactive: 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300',
    },
    boxed: {
        base: 'px-4 py-2 text-sm font-medium rounded-lg transition-all',
        active: 'bg-white text-gray-900 shadow-sm border border-gray-200',
        inactive: 'text-gray-600 hover:text-gray-900',
    },
};
export const Tabs = React.forwardRef(({ tabs, defaultTab, activeTab: controlledTab, onTabChange, variant = 'default', fullWidth = false, className = '', ...props }, ref) => {
    const [uncontrolledTab, setUncontrolledTab] = useState(defaultTab || tabs[0]?.id || '');
    const activeTab = controlledTab !== undefined ? controlledTab : uncontrolledTab;
    const handleTabClick = (tabId) => {
        if (controlledTab === undefined) {
            setUncontrolledTab(tabId);
        }
        onTabChange?.(tabId);
    };
    const tabStyles = variantTabStyles[variant];
    const activeContent = tabs.find((t) => t.id === activeTab)?.content;
    return (_jsxs("div", { ref: ref, className: ['w-full', className].filter(Boolean).join(' '), ...props, children: [_jsx("div", { className: [
                    'flex',
                    variantContainerStyles[variant],
                    fullWidth ? 'w-full' : 'w-fit',
                    variant === 'underline' ? '' : 'rounded-lg',
                ]
                    .filter(Boolean)
                    .join(' '), role: "tablist", children: tabs.map((tab) => (_jsxs("button", { type: "button", role: "tab", "aria-selected": activeTab === tab.id, "aria-controls": `tabpanel-${tab.id}`, disabled: tab.disabled, onClick: () => handleTabClick(tab.id), className: [
                        tabStyles.base,
                        activeTab === tab.id ? tabStyles.active : tabStyles.inactive,
                        tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                        fullWidth ? 'flex-1 justify-center' : '',
                    ]
                        .filter(Boolean)
                        .join(' '), children: [tab.icon && _jsx("span", { className: "mr-2", children: tab.icon }), tab.label, tab.badge && (_jsx("span", { className: "ml-2 px-1.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-600 rounded-full", children: tab.badge }))] }, tab.id))) }), _jsx("div", { className: "mt-4", role: "tabpanel", id: `tabpanel-${activeTab}`, children: activeContent })] }));
});
Tabs.displayName = 'Tabs';
export default Tabs;
//# sourceMappingURL=tabs.js.map