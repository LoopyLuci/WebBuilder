'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export function Tooltip({ content, position = 'top', delay = 0, children, show = true, onDismiss }) {
    const [isVisible, setIsVisible] = useState(false);
    const [timeoutId, setTimeoutId] = useState(null);
    const showTooltip = () => {
        if (delay > 0) {
            const id = setTimeout(() => setIsVisible(true), delay);
            setTimeoutId(id);
        }
        else {
            setIsVisible(true);
        }
    };
    const hideTooltip = () => {
        if (timeoutId)
            clearTimeout(timeoutId);
        setIsVisible(false);
        onDismiss?.();
    };
    const positions = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };
    const arrows = {
        top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900',
        bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900',
        left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900',
        right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900',
    };
    return (_jsxs("div", { className: "relative inline-flex", children: [_jsx("div", { onMouseEnter: showTooltip, onMouseLeave: hideTooltip, onFocus: showTooltip, onBlur: hideTooltip, children: children }), isVisible && show && (_jsxs("div", { className: `absolute z-50 px-3 py-1.5 text-xs text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap ${positions[position]} animate-fade-in`, role: "tooltip", children: [content, _jsx("span", { className: `absolute w-0 h-0 border-4 border-transparent ${arrows[position]}`, "aria-hidden": "true" })] }))] }));
}
export default Tooltip;
//# sourceMappingURL=Tooltip.js.map