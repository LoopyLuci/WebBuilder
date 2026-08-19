'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
// ─── Toast Function ────────────────────────────────────────────────────────
export function showToast(type, message) {
    const event = new CustomEvent('webbuilder-toast', { detail: { type, message } });
    window.dispatchEvent(event);
}
// ─── Toast Container ───────────────────────────────────────────────────────
export function ToastContainer() {
    const [toasts, setToasts] = useState([]);
    useEffect(() => {
        const listener = (e) => {
            const { type, message } = e.detail;
            const id = Date.now().toString(36);
            setToasts(prev => [...prev, { id, type, description: message }]);
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, 3000);
        };
        window.addEventListener('webbuilder-toast', listener);
        return () => window.removeEventListener('webbuilder-toast', listener);
    }, []);
    return (_jsx("div", { className: "fixed bottom-4 right-4 z-[100] flex flex-col gap-2", "aria-live": "polite", "aria-label": "Notifications", children: toasts.map(toast => (_jsxs("div", { role: "alert", className: `flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-slide-up ${toast.type === 'success' ? 'bg-green-500 text-white' :
                toast.type === 'error' ? 'bg-red-500 text-white' :
                    toast.type === 'warning' ? 'bg-yellow-500 text-white' :
                        'bg-blue-500 text-white'}`, children: [_jsx("span", { className: "flex-1", children: toast.description }), _jsx("button", { onClick: () => setToasts(prev => prev.filter(t => t.id !== toast.id)), className: "p-1 rounded hover:bg-white/20", "aria-label": "Dismiss", children: _jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }, toast.id))) }));
}
//# sourceMappingURL=ToastContainer.js.map