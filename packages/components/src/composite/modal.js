import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * WebBuilder Components - Modal Component
 * A flexible modal dialog with header, body, and footer.
 */
import React, { useEffect, useCallback } from 'react';
const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4',
};
export const Modal = React.forwardRef(({ open, onClose, title, description, size = 'md', closeOnOverlay = true, closeOnEsc = true, showCloseButton = true, footer, icon, children, className = '', ...props }, ref) => {
    const handleEsc = useCallback((e) => {
        if (e.key === 'Escape' && closeOnEsc) {
            onClose();
        }
    }, [closeOnEsc, onClose]);
    useEffect(() => {
        if (open) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = '';
        };
    }, [open, handleEsc]);
    if (!open)
        return null;
    return (_jsxs("div", { ref: ref, className: [
            'fixed inset-0 z-50 flex items-center justify-center p-4',
            className,
        ]
            .filter(Boolean)
            .join(' '), role: "dialog", "aria-modal": "true", "aria-labelledby": title ? 'modal-title' : undefined, "aria-describedby": description ? 'modal-description' : undefined, ...props, children: [_jsx("div", { className: "absolute inset-0 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]", onClick: closeOnOverlay ? onClose : undefined, "aria-hidden": "true" }), _jsxs("div", { className: [
                    'relative w-full bg-white rounded-xl shadow-2xl animate-[slideUp_0.3s_ease-out]',
                    sizeStyles[size],
                ].join(' '), children: [(title || showCloseButton) && (_jsxs("div", { className: "flex items-start justify-between p-6 pb-0", children: [_jsxs("div", { className: "flex items-start gap-3", children: [icon && (_jsx("div", { className: "flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-blue-100 text-blue-600", children: icon })), _jsxs("div", { children: [title && (_jsx("h2", { id: "modal-title", className: "text-lg font-semibold text-gray-900", children: title })), description && (_jsx("p", { id: "modal-description", className: "mt-1 text-sm text-gray-500", children: description }))] })] }), showCloseButton && (_jsx("button", { type: "button", onClick: onClose, className: "p-2 -mr-2 -mt-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors", "aria-label": "Close modal", children: _jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) }))] })), _jsx("div", { className: "p-6", children: children }), footer && (_jsx("div", { className: "flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl", children: footer }))] })] }));
});
Modal.displayName = 'Modal';
export default Modal;
//# sourceMappingURL=modal.js.map