'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
export function StatusBar({ time, battery = 85, wifi = true, signal = true }) {
    const [currentTime, setCurrentTime] = useState(time || '12:00');
    useEffect(() => {
        if (time)
            return;
        const interval = setInterval(() => {
            const now = new Date();
            setCurrentTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
        }, 1000);
        return () => clearInterval(interval);
    }, [time]);
    return (_jsxs("div", { className: "flex items-center justify-between px-4 py-1 text-xs text-white bg-black/20", children: [_jsx("span", { className: "font-medium", children: currentTime }), _jsxs("div", { className: "flex items-center gap-1.5", children: [signal && (_jsx("svg", { className: "w-3.5 h-3.5", fill: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { d: "M2 22h20V2L2 22z" }) })), wifi && (_jsx("svg", { className: "w-3.5 h-3.5", fill: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { d: "M12 18c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-4.9-2.3l1.4 1.4C9.4 16.4 10.6 16 12 16s2.6.4 3.5 1.1l1.4-1.4C15.6 14.6 13.9 14 12 14s-3.6.6-4.9 1.7zm-2.8-2.8l1.4 1.4C7.3 13 9.5 12 12 12s4.7 1 6.3 2.3l1.4-1.4C17.7 11.1 15 10 12 10s-5.7 1.1-7.7 2.9zM1.5 10l1.4 1.4C5.1 9.3 8.4 8 12 8s6.9 1.3 9.1 3.4l1.4-1.4C19.8 7.5 16.1 6 12 6S4.2 7.5 1.5 10z" }) })), _jsxs("div", { className: "flex items-center gap-0.5", children: [_jsxs("span", { className: "text-[10px]", children: [battery, "%"] }), _jsx("div", { className: "w-5 h-2.5 border border-white/60 rounded-sm relative", children: _jsx("div", { className: `absolute left-0.5 top-0.5 bottom-0.5 rounded-[1px] ${battery > 20 ? 'bg-green-400' : 'bg-red-400'}`, style: { width: `${Math.max(0, battery - 10)}%` } }) })] })] })] }));
}
export default StatusBar;
//# sourceMappingURL=StatusBar.js.map