'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const Timeline = ({ items, variant = 'default', className = '', }) => {
    const dotColors = {
        completed: 'bg-green-500',
        current: 'bg-blue-500 ring-4 ring-blue-100 dark:ring-blue-900',
        pending: 'bg-gray-300 dark:bg-gray-700',
    };
    return (_jsxs("div", { className: `relative ${className}`, role: "list", children: [variant === 'default' && (_jsx("div", { className: "absolute left-4 top-0 bottom-0 w-0.5 bg-border", "aria-hidden": "true" })), items.map((item, index) => (_jsxs("div", { className: "relative flex gap-4 pb-6 last:pb-0", role: "listitem", children: [variant === 'default' && (_jsx("div", { className: "relative z-10 shrink-0", children: item.icon ? (_jsx("div", { className: "w-8 h-8 rounded-full bg-background border-2 border-border flex items-center justify-center text-sm", children: item.icon })) : (_jsx("div", { className: `w-8 h-8 rounded-full flex items-center justify-center ${dotColors[item.status || 'pending']}`, children: item.status === 'completed' && (_jsx("svg", { className: "w-4 h-4 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" }) })) })) })), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-medium", children: item.title }), item.timestamp && (_jsx("span", { className: "text-xs text-muted-foreground", children: item.timestamp }))] }), item.description && variant === 'default' && (_jsx("p", { className: "text-sm text-muted-foreground mt-1", children: item.description })), item.meta && _jsx("div", { className: "mt-2", children: item.meta })] })] }, item.id)))] }));
};
export default Timeline;
//# sourceMappingURL=timeline.js.map